import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)" },
      redirect: "follow",
    });

    const html = await response.text();

    const getMetaContent = (html: string, property: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]) return m[1];
      }
      return null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    const preview = {
      title: getMetaContent(html, 'og:title') || titleMatch?.[1]?.trim() || null,
      description: getMetaContent(html, 'og:description') || getMetaContent(html, 'description') || null,
      image: getMetaContent(html, 'og:image') || null,
      siteName: getMetaContent(html, 'og:site_name') || null,
      favicon: null as string | null,
    };

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*)["']/i);
    if (faviconMatch?.[1]) {
      const fav = faviconMatch[1];
      preview.favicon = fav.startsWith('http') ? fav : new URL(fav, url).href;
    }

    // Make relative image URLs absolute
    if (preview.image && !preview.image.startsWith('http')) {
      preview.image = new URL(preview.image, url).href;
    }

    return new Response(JSON.stringify(preview), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
