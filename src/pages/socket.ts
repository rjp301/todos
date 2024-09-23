import type { APIRoute } from "astro";

export const ALL: APIRoute = ({ request }) => {
  if (request.headers.has("Upgrade")) {
    const { } = await request.
  }


  return new Response("Hello, world!");
};
