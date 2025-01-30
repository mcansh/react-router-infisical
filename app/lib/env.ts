import {
  cachified,
  totalTtl,
  type Cache,
  type CacheEntry,
} from "@epic-web/cachified";
import { InfisicalSDK } from "@infisical/sdk";
import { LRUCache } from "lru-cache";
import { z } from "zod";

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

let client = new InfisicalSDK();

let initialized = await client.auth().universalAuth.login({
  clientId: appEnv.INFISICAL_CLIENT_ID,
  clientSecret: appEnv.INFISICAL_CLIENT_SECRET,
});

async function getSecrets() {
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

function getCachedSecrets() {
  return cachified({
    key: "secrets",
    cache: lru,
    async getFreshValue() {
      console.log(`getting secrets from Infisical`);
      return getSecrets();
    },
    /**
     * 5 minutes until cache gets invalid
     * Optional, defaults to Infinity
     */
    ttl: 300_000,
  });
}

export { getCachedSecrets as getSecrets };
