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
app.route("/api/livestock", livestockRoutes);
app.route("/api/sales", salesRoutes);
app.route("/api/expenses", expensesRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/users", usersRoutes);

// Public photo endpoint — no auth, must be before the auth-protected livestock routes
app.get("/api/livestock/:id/photo", async (c) => {
  const id = c.req.param("id");
  const list = await c.env.STORAGE.list({ prefix: `livestock/${id}/` });
  if (!list.objects.length) return c.json({ error: "No photo" }, 404);
  const latest = list.objects.sort(
    (a, b) => b.uploaded.getTime() - a.uploaded.getTime()
  )[0];
  const obj = await c.env.STORAGE.get(latest.key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

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
