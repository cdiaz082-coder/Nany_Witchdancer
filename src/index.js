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

function cleanFolder(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Detecta automáticamente las carpetas reales dentro de Sticker Nany
    if (url.pathname === "/api/sticker-categories") {
      const result = await env.MY_BUCKET.list({
        prefix: ROOT,
        delimiter: "/",
        limit: 1000
      });

      const categories = (result.delimitedPrefixes || [])
        .map(prefix => cleanFolder(prefix))
        .filter(prefix => prefix !== ROOT.replace(/\/$/, ""));

      return json({
        count: categories.length,
        categories
      });
    }

    // Obtiene automáticamente los stickers de una categoría
    if (url.pathname === "/api/stickers") {
      const requestedFolder = url.searchParams.get("folder") || "";

      if (!requestedFolder) {
        return json({ error: "Missing folder." }, 400);
      }

      const requested = cleanFolder(requestedFolder);

      const folders = await env.MY_BUCKET.list({
        prefix: ROOT,
        delimiter: "/",
        limit: 1000
      });

      const realPrefix = (folders.delimitedPrefixes || [])
        .find(prefix => cleanFolder(prefix).toLowerCase() === requested.toLowerCase());

      if (!realPrefix) {
        return json({
          error: "Category not found.",
          requestedFolder,
          availableCategories: folders.delimitedPrefixes || []
        }, 404);
      }

      const result = await env.MY_BUCKET.list({
        prefix: realPrefix,
        limit: 1000
      });

      const stickers = result.objects
        .filter(object => object.key !== realPrefix)
        .map(object => ({
          name: object.key.substring(realPrefix.length),
          key: object.key,
          url: "/api/sticker?key=" + encodeURIComponent(object.key)
        }));

      return json({
        folder: realPrefix,
        count: stickers.length,
        stickers,
        truncated: result.truncated === true
      });
    }

    // Entrega el archivo desde R2 sin hacerlo público
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

    // Diagnóstico temporal
    if (url.pathname === "/api/r2-debug") {
      const result = await env.MY_BUCKET.list({
        prefix: ROOT,
        delimiter: "/",
        limit: 1000
      });

      return json({
        delimitedPrefixes: result.delimitedPrefixes || [],
        objects: result.objects.map(o => o.key)
      });
    }

    return env.ASSETS.fetch(request);
  }
};
