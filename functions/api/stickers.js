const ROOT = "Sticker Nany/";

const CATEGORIES = new Set([
  "Nany hollywood",
  "Nany animada",
  "Nany brujita feminista",
  "Nany folclore mundial",
  "Nany frases",
  "Nany gamer",
  "Nany por el mundo",
  "Nany sentimientos",
  "Nany tarot",
  "Nany tiktoker"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function validFolder(folder) {
  if (!folder.startsWith(ROOT)) return false;

  return CATEGORIES.has(
    folder.slice(ROOT.length).replace(/\/+$/, "")
  );
}

function validKey(key) {
  if (!key.startsWith(ROOT) || key.includes("..")) {
    return false;
  }

  const rest = key.slice(ROOT.length);
  const slash = rest.indexOf("/");

  return (
    slash > 0 &&
    CATEGORIES.has(rest.slice(0, slash))
  );
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const mode = url.searchParams.get("mode") || "list";

  if (!env.STICKERS) {
    return json({
      error: "R2 binding STICKERS is not available."
    }, 500);
  }

  if (mode === "list") {
    const folder = url.searchParams.get("folder") || "";

    if (!validFolder(folder)) {
      return json({
        error: "Invalid sticker category."
      }, 400);
    }

    const prefix =
      folder.replace(/\/+$/, "") + "/";

    const listed = await env.STICKERS.list({
      prefix,
      limit: 1000
    });

    const stickers = listed.objects
      .filter(object => !object.key.endsWith("/"))
      .map(object => ({
        name: object.key.slice(prefix.length),
        key: object.key,
        url:
          `/api/stickers?mode=image&key=` +
          encodeURIComponent(object.key)
      }));

    return json({
      folder,
      count: stickers.length,
      stickers,
      truncated: listed.truncated === true
    });
  }

  if (mode === "image") {
    const key = url.searchParams.get("key") || "";

    if (!validKey(key)) {
      return new Response(
        "Invalid sticker key.",
        { status: 400 }
      );
    }

    const object = await env.STICKERS.get(key);

    if (!object) {
      return new Response(
        "Sticker not found.",
        { status: 404 }
      );
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    headers.set(
      "etag",
      object.httpEtag
    );

    headers.set(
      "cache-control",
      "public, max-age=3600"
    );

    return new Response(object.body, {
      headers
    });
  }

  return json({
    error: "Unsupported mode."
  }, 400);
}
