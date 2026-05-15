import { Hono } from "hono";
import { cors } from "hono/cors";
import { html } from "hono/html";
import { Homepage } from "./templates/homepage";
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

app.route("/api/livestock", livestockRoutes);
app.route("/api/sales", salesRoutes);
app.route("/api/expenses", expensesRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/users", usersRoutes);

app.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, name, type, weight_kg, status, selling_price, purchase_price, image_url FROM livestock ORDER BY created_at ASC"
  ).all<{
    id: string;
    name: string | null;
    type: string;
    weight_kg: number | null;
    status: string;
    selling_price: number | null;
    purchase_price: number;
    image_url: string | null;
  }>();
  return c.html(html`<!DOCTYPE html>${<Homepage livestock={result.results} />}`);
});

// SPA fallback — serve index.html for all non-API routes so React Router handles client-side navigation
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
