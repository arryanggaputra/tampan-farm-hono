import { Hono } from "hono";
import { cors } from "hono/cors";
import { html } from "hono/html";
import { Homepage } from "./templates/homepage";
import { ProductDetail } from "./templates/product-detail";
import authRoutes from "./routes/auth";
import livestockRoutes from "./routes/livestock";
import salesRoutes from "./routes/sales";
import expensesRoutes from "./routes/expenses";
import dashboardRoutes from "./routes/dashboard";
import usersRoutes from "./routes/users";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("/api/*", cors({ origin: "*", credentials: true }));

app.route("/api/auth", authRoutes);

// Public photo endpoint — must be before auth-protected livestock routes
app.get("/api/livestock/:id/photo", async (c) => {
  const via = c.req.header("via") ?? "";

  // Inner subrequest from CF Image Resizing — serve raw from R2
  if (/image-resizing/.test(via)) {
    const id = c.req.param("id");
    const list = await c.env.STORAGE.list({ prefix: `livestock/${id}/` });
    if (!list.objects.length) return c.json({ error: "No photo" }, 404);
    const latest = list.objects.sort(
      (a, b) => b.uploaded.getTime() - a.uploaded.getTime()
    )[0];
    const obj = await c.env.STORAGE.get(latest.key);
    if (!obj) return c.json({ error: "Not found" }, 404);
    return new Response(obj.body, {
      headers: { "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg" },
    });
  }

  // Outer request — resize via CF Image Resizing, CF auto-caches the result
  const resized = await fetch(c.req.url, {
    cf: { image: { width: 600, quality: 85, format: "webp" } },
  } as RequestInit);

  return new Response(resized.body, {
    status: resized.status,
    headers: {
      "Content-Type": resized.headers.get("Content-Type") ?? "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

app.get("/ternak/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [item, allIds] = await Promise.all([
    c.env.DB.prepare(
      "SELECT id, name, type, weight_kg, status, selling_price, image_url, notes, slug FROM livestock WHERE slug = ? OR id = ? LIMIT 1"
    )
      .bind(slug, slug)
      .first<{
        id: string;
        name: string | null;
        type: string;
        weight_kg: number | null;
        status: string;
        selling_price: number | null;
        image_url: string | null;
        notes: string | null;
        slug: string | null;
      }>(),
    c.env.DB.prepare("SELECT id FROM livestock ORDER BY created_at ASC").all<{
      id: string;
    }>(),
  ]);
  if (!item)
    return c.html(
      `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tidak Ditemukan — Peternak Tampan</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f1f5f9;color:#1e293b;text-align:center;padding:24px}h1{font-size:1.5rem;margin-bottom:8px}p{color:#94a3b8;margin-bottom:24px}a{color:#16a34a;font-weight:700;text-decoration:none}</style></head><body><div style="font-size:3rem">🐑</div><h1>Ternak Tidak Ditemukan</h1><p>Data ternak ini tidak tersedia.</p><a href="/">← Kembali ke Katalog</a></body></html>`,
      404
    );
  const index = allIds.results.findIndex((r) => r.id === item.id);
  return c.html(
    html`<!DOCTYPE html>${<ProductDetail livestock={item} index={index} />}`
  );
});

app.route("/api/livestock", livestockRoutes);
app.route("/api/sales", salesRoutes);
app.route("/api/expenses", expensesRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/users", usersRoutes);

app.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, name, type, weight_kg, status, selling_price, purchase_price, image_url, slug FROM livestock ORDER BY CASE status WHEN 'available' THEN 0 WHEN 'booking' THEN 1 ELSE 2 END ASC, COALESCE(selling_price, 0) DESC"
  ).all<{
    id: string;
    name: string | null;
    type: string;
    weight_kg: number | null;
    status: string;
    selling_price: number | null;
    purchase_price: number;
    image_url: string | null;
    slug: string | null;
  }>();
  return c.html(html`<!DOCTYPE html>${<Homepage livestock={result.results} />}`);
});

// SPA fallback — serve index.html for all non-API routes so React Router handles client-side navigation
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
