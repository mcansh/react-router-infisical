import type { Cache, CacheEntry } from "@epic-web/cachified";
import { totalTtl } from "@epic-web/cachified";
import { InfisicalSDK } from "@infisical/sdk";
import { LRUCache } from "lru-cache";
import { z } from "zod";
import { cachified } from "./cachified";

let appEnvSchema = z.object({
  INFISICAL_CLIENT_ID: z.string().min(1),
  INFISICAL_CLIENT_SECRET: z.string().min(1),
  INFISICAL_PROJECT_ID: z.string().uuid(),
  INFISICAL_ENVIRONMENT: z.string().min(1),
});

let appEnv = appEnvSchema.parse(process.env);

let envSchema = z.object({
  MUGSHOT: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

async function createInfisicalClient() {
  let client = new InfisicalSDK();

  await client.auth().universalAuth.login({
    clientId: appEnv.INFISICAL_CLIENT_ID,
    clientSecret: appEnv.INFISICAL_CLIENT_SECRET,
  });

  return client;
}

async function getFreshSecrets() {
  let client = await createInfisicalClient();
  console.log(`getting secrets from Infisical`);
  let result = await client.secrets().listSecrets({
    projectId: appEnv.INFISICAL_PROJECT_ID,
    environment: appEnv.INFISICAL_ENVIRONMENT,
  });

  let secrets = result.secrets.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.secretKey]: cur.secretValue,
    };
  }, {});

  return envSchema.parse(secrets);
}

const lruInstance = new LRUCache<string, CacheEntry>({ max: 1000 });

const lru: Cache = {
  set(key, value) {
    const ttl = totalTtl(value?.metadata);
    return lruInstance.set(key, value, {
      ttl: ttl === Infinity ? undefined : ttl,
      start: value?.metadata?.createdTime,
    });
  },
  get(key) {
    return lruInstance.get(key);
  },
  delete(key) {
    return lruInstance.delete(key);
  },
};

export function getSecrets({ forceFresh }: { forceFresh?: boolean } = {}) {
  return cachified({
    key: "secrets",
    cache: lru,
    async getFreshValue() {
      return getFreshSecrets();
    },
    forceFresh,
    /**
     * 1 hour until cache gets invalid
     * Optional, defaults to Infinity
     */
    ttl: 60 * 60 * 1000,
  });
}
