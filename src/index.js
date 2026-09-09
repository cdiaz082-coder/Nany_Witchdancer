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

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function validFolder(folder) {
  if (!folder.startsWith(ROOT)) return false;

  const category = folder.slice(ROOT.length).replace(/\/+$/, "");

  return CATEGORIES.has(category);
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

      const requestedCategory = folder
        .slice(ROOT.length)
        .replace(/\/+$/, "");

      const exactPrefix = folder.replace(/\/+$/, "") + "/";

      let listed = await env.MY_BUCKET.list({
        prefix: exactPrefix,
        limit: 1000
      });

      let objects = listed.objects.filter(
        object => !object.key.endsWith("/")
      );

      /*
       * Si la coincidencia exacta no encuentra objetos,
       * buscamos dentro de Sticker Nany/ y comparamos
       * la categoría real normalizada.
       */
      if (objects.length === 0) {
        const rootList = await env.MY_BUCKET.list({
          prefix: ROOT,
          limit: 1000
        });

        const wanted = normalize(requestedCategory);

        objects = rootList.objects.filter(object => {
          if (object.key.endsWith("/")) return false;

          const rest = object.key.slice(ROOT.length);
          const slash = rest.indexOf("/");

          if (slash <= 0) return false;

          const realCategory = rest.slice(0, slash);

          return normalize(realCategory) === wanted;
        });
      }

      const stickers = objects.map(object => ({
        name: object.key.split("/").pop(),
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

      if (!key.startsWith(ROOT) || key.includes("..")) {
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
      headers.set("cache-control", "public, max-age=3600");

      return new Response(object.body, {
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};

