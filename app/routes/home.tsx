import { data } from "react-router";
import { getCloudinaryUrl } from "~/lib/cloudinary";
import { getSecrets } from "~/lib/env";
import { pipeHeaders } from "~/lib/headers";
import { makeTimings, time } from "~/lib/timing";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  let forceFresh = url.searchParams.has("fresh");
  let timings = makeTimings("home");

  let secrets = await time(() => getSecrets({ forceFresh }), {
    type: "secrets",
    timings,
  });

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

  return data(
    { mugshot, mugshotSrcSet: mugshotSrcSet.join(",") },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Server-Timing": timings.toString(),
        Link: `<${mugshot}>; rel=preload; as=image; imagesizes="(min-width: 800px) 400px, 100vw"`,
      },
    },
  );
}

export function headers(headers: Route.HeadersArgs): Headers | HeadersInit {
  return pipeHeaders({ ...headers, extraForwardHeaders: ["Link"] });
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
      <img
        src={loaderData.mugshot}
        alt="Mugshot"
        srcSet={loaderData.mugshotSrcSet}
        sizes="(min-width: 800px) 400px, 100vw"
        height={200}
        width={200}
      />
      <Welcome />
    </div>
  );
}
