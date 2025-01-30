import type {
  TransformerOption,
  TransformerVideoOption,
} from "@cld-apis/types";
import { buildUrl } from "cloudinary-build-url";
import { getSecrets } from "./env";

export async function getCloudinaryUrl(
  publicId: string,
  transformations?: TransformerOption | TransformerVideoOption,
) {
  let secrets = await getSecrets();

  return buildUrl(publicId, {
    cloud: { cloudName: secrets.CLOUDINARY_CLOUD_NAME },
    transformations: {
      quality: "auto",
      fetchFormat: "auto",
      ...transformations,
    },
  });
}
