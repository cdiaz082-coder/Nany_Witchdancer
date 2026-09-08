const ROOT = "Sticker Nany/";

const CATEGORIES = new Set([
  "Nany Hollywood",
  "Nany animada",
  "Nany brujita feminista",
  "Nany folclore mundial",
  "Nany frases",
  "Nany gamer",
  "Nany por el mundo",
  "Nany sentimientos",
  "Nany tarot",
  "Nany tik toker"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function validFolder(folder) {
  if (!folder.startsWith(ROOT)) return false;

  const category = folder
    .slice(ROOT.length)
    .replace(/\/+$/, "");

  return CATEGORIES.has(category);
}

function validKey(key) {
  if (!key.startsWith(ROOT) || key.includes("..")) {
    return false;
  }

  const rest = key.slice(ROOT.length);
  const slash = rest.indexOf("/");

  if (slash <= 0) return false;

  return CATEGORIES.has(rest.slice(0, slash));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/stickers") {
      const folder = url.searchParams.get("folder") || "";

      if (!validFolder(folder)) {
        return json({
          error: "Invalid sticker category."
        }, 400);
      }

      const prefix =
        folder.replace(/\/+$/, "") + "/";

      const listed = await env.MY_BUCKET.list({
        prefix,
        limit: 1000
      });

      const stickers = listed.objects
        .filter(object => !object.key.endsWith("/"))
        .map(object => ({
          name: object.key.slice(prefix.length),
          key: object.key,
          url:
            "/api/sticker?key=" +
            encodeURIComponent(object.key)
        }));

      return json({
        folder,
        count: stickers.length,
        stickers,
        truncated: listed.truncated === true
      });
    }

    if (url.pathname === "/api/sticker") {
      const key = url.searchParams.get("key") || "";

      if (!validKey(key)) {
        return new Response("Invalid sticker key.", {
          status: 400
        });
      }

      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Sticker not found.", {
          status: 404
        });
      }

      const headers = new Headers();

      object.writeHttpMetadata(headers);

      headers.set("etag", object.httpEtag);
      headers.set(
        "cache-control",
        "public, max-age=3600"
      );

      return new Response(object.body, {
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};


