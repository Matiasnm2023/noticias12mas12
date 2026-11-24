# Procedimiento permanente para compartir noticias por WhatsApp

Este procedimiento forma parte del proyecto y debe mantenerse en futuras publicaciones.

## Regla obligatoria

Para cada noticia con ID `ID`:

1. Generar `compartir-ID.html` en la raíz del sitio.
2. Generar la imagen optimizada `previews/noticia-ID.jpg`.
3. Incluir en el HTML, dentro de `<head>` y antes de cualquier redirección, los metadatos Open Graph: `og:title`, `og:description`, `og:image`, `og:image:secure_url` y `og:url`.
4. El enlace público para compartir en WhatsApp es siempre:

   `https://noticias12mas12.com.ar/compartir-ID.html?v=6`

5. No reemplazarlo por `noticia.html?id=ID`, `noticias/ID.html` ni variantes sin el parámetro `?v=6`.
6. Antes de entregar el enlace, verificar que existan el archivo HTML y la imagen de preview en el repositorio y que GitHub Pages haya publicado los cambios.
7. La finalización del workflow no garantiza por sí sola que WhatsApp haya actualizado la tarjeta. La vista previa se considera confirmada únicamente cuando se comprueba en WhatsApp.

## Automatización

El workflow `.github/workflows/generar-previews-facebook.yml` genera las páginas de preview para las noticias de Supabase. La URL `og:url` de cada preview debe incluir también `?v=6`, coincidiendo con el enlace público que se comparte.

Si se modifica el sistema de publicación, conservar esta regla y actualizar este documento junto con el workflow.
