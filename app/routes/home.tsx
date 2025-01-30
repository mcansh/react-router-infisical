import { getCloudinaryUrl } from "~/lib/cloudinary";
import { getSecrets } from "~/lib/env";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export async function loader({}: Route.LoaderArgs) {
  let secrets = await getSecrets();
  let mugshot = await getCloudinaryUrl(secrets.MUGSHOT, {
    resize: { width: 200, height: 200, type: "fill" },
  });

  let mugshotSrcSet = await Promise.all(
    [400, 600, 800, 1000, 1200].map(async (size) => {
      let url = await getCloudinaryUrl(secrets.MUGSHOT, {
        resize: { width: size, height: size, type: "fill" },
      });

      return `${url} ${size}w`;
    }),
  );

  return { mugshot, mugshotSrcSet: mugshotSrcSet.join(", ") };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      {/* <img
        src={loaderData.mugshot}
        alt="Mugshot"
        srcSet={loaderData.mugshotSrcSet}
        sizes="(min-width: 800px) 400px, 100vw"
        height={200}
        width={200}
      /> */}
      <Welcome />
    </div>
  );
}
