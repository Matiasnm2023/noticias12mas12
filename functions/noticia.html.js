const SUPABASE_URL = "https://piyabciajfhlarvecdvu.supabase.co";
const SUPABASE_KEY = "sb_publishable_t2UOYQYMPxYW1g5R4HoVaw_erREYkWK";

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteImage(url, origin) {
  if (!url) return `${origin}/logo.jpg`;
  try {
    return new URL(url, origin).href;
  } catch {
    return `${origin}/logo.jpg`;
  }
}

function replaceMeta(html, property, content) {
  const safe = escapeAttr(content);
  const escaped = property.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`<meta\\s+property=["']${escaped}["']\\s+content=["'][^"']*["']\\s*/?>`, "i");
  const tag = `<meta property="${property}" content="${safe}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<head>/i, `<head>\n${tag}`);
}

function replaceNameMeta(html, name, content) {
  const safe = escapeAttr(content);
  const escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`<meta\\s+name=["']${escaped}["']\\s+content=["'][^"']*["']\\s*/?>`, "i");
  const tag = `<meta name="${name}" content="${safe}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<head>/i, `<head>\n${tag}`);
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const id = requestUrl.searchParams.get("id");

  const assetResponse = await context.env.ASSETS.fetch(
    new Request(new URL("/noticia.html", requestUrl).href, context.request)
  );

  if (!id) return assetResponse;

  const apiUrl = `${SUPABASE_URL}/rest/v1/noticias?id=eq.${encodeURIComponent(id)}&select=titulo,contenido,imagen,categoria,fecha`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) return assetResponse;

    const rows = await response.json();
    const noticia = Array.isArray(rows) ? rows[0] : null;

    if (!noticia) return assetResponse;

    let html = await assetResponse.text();
    const titulo = noticia.titulo || "12 + 12 Noticias de Tigre";
    const descripcion = stripHtml(noticia.contenido).substring(0, 200) || "Noticias de Tigre y toda la información local.";
    const imagen = absoluteImage(noticia.imagen, requestUrl.origin);
    const canonicalUrl = `${requestUrl.origin}/noticias/${id}.html`;

    html = replaceMeta(html, "og:title", titulo);
    html = replaceMeta(html, "og:description", descripcion);
    html = replaceMeta(html, "og:image", imagen);
    html = replaceMeta(html, "og:url", canonicalUrl);
    html = replaceMeta(html, "og:type", "article");
    html = replaceMeta(html, "og:site_name", "12 + 12 Noticias de Tigre");
    html = replaceNameMeta(html, "twitter:card", "summary_large_image");
    html = replaceNameMeta(html, "twitter:title", titulo);
    html = replaceNameMeta(html, "twitter:description", descripcion);
    html = replaceNameMeta(html, "twitter:image", imagen);
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(titulo)} | 12 + 12 Noticias de Tigre</title>`);

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=60, s-maxage=60"
      }
    });
  } catch (error) {
    console.error("Error generando metadatos Open Graph:", error);
    return assetResponse;
  }
}
