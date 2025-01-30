import {
  createNonce,
  createSecureHeaders,
  mergeHeaders,
} from "@mcansh/http-helmet";
import { NonceProvider } from "@mcansh/http-helmet/react";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { PassThrough } from "node:stream";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
      isbot(userAgent) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    let nonce = createNonce();

    let secureHeaders = createSecureHeaders({
      "Content-Security-Policy": {
        "default-src": ["'none'"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "https://res.cloudinary.com"],
        "style-src": ["'self'", "https://fonts.googleapis.com"],
        "script-src": ["'self'", `'nonce-${nonce}'`],
        "connect-src": ["'self'"],
      },
    });

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider nonce={nonce}>
        <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
      </NonceProvider>,
      {
        nonce,
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: mergeHeaders(responseHeaders, secureHeaders),
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}
