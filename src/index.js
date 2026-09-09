const ROOT = "Sticker Nany/";

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/r2-debug") {
      const result = await env.MY_BUCKET.list({
        prefix: ROOT,
        delimiter: "/",
        limit: 1000
      });

      return json({
        delimitedPrefixes: result.delimitedPrefixes,
        objects: result.objects.map(o => o.key)
      });
    }

    if (url.pathname === "/api/stickers") {
      const folder = url.searchParams.get("folder") || "";

      if (!folder.startsWith(ROOT)) {
        return json({ error: "Invalid sticker category." }, 400);
      }

      const prefix = folder.replace(/\/+$/, "") + "/";

      const result = await env.MY_BUCKET.list({
        prefix,
        limit: 1000
      });

      const stickers = result.objects
        .filter(object => object.key !== prefix)
        .map(object => ({
          name: object.key.substring(prefix.length),
          key: object.key,
          url: "/api/sticker?key=" + encodeURIComponent(object.key)
        }));

      return json({
        folder,
        count: stickers.length,
        stickers,
        truncated: result.truncated === true
      });
    }

    if (url.pathname === "/api/sticker") {
      const key = url.searchParams.get("key") || "";

      if (!key.startsWith(ROOT) || key.includes("..")) {
        return new Response("Invalid sticker key.", { status: 400 });
      }

      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Sticker not found.", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=3600");

      return new Response(object.body, { headers });
    }

    return env.ASSETS.fetch(request);
  }
};

