export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/stickers") {
      const folder = url.searchParams.get("folder");

      if (!folder) {
        return new Response(
          JSON.stringify({ error: "Missing folder" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      const prefix = folder.replace(/^\/+|\/+$/g, "") + "/";

      const listed = await env.MY_BUCKET.list({
        prefix: prefix,
        limit: 10
      });

      const stickers = listed.objects.map((object) => ({
        key: object.key,
        name: object.key.split("/").pop(),
        url: "/api/sticker?key=" + encodeURIComponent(object.key)
      }));

      return new Response(
        JSON.stringify({
          folder: folder,
          count: stickers.length,
          stickers: stickers
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (url.pathname === "/api/sticker") {
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response("Missing key", {
          status: 400
        });
      }

      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Sticker not found", {
          status: 404
        });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type":
            object.httpMetadata?.contentType || "image/png",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};