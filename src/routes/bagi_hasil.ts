import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

type Vars = { user: { sub: string; name: string; email: string } };

const bagiHasil = new Hono<{ Bindings: CloudflareBindings; Variables: Vars }>();

bagiHasil.use("*", authMiddleware);

bagiHasil.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM bagi_hasil_members ORDER BY sort_order ASC"
  ).all();
  return c.json({ data: result.results });
});

bagiHasil.post("/", async (c) => {
  const body = await c.req.json<{ name: string; percentage: number }>();
  if (!body.name || body.percentage == null) {
    return c.json({ error: "name and percentage are required" }, 400);
  }

  const maxOrder = await c.env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM bagi_hasil_members"
  ).first<{ max_order: number }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO bagi_hasil_members (id, name, percentage, sort_order) VALUES (?, ?, ?, ?)"
  )
    .bind(id, body.name, body.percentage, (maxOrder?.max_order ?? 0) + 1)
    .run();

  const item = await c.env.DB.prepare(
    "SELECT * FROM bagi_hasil_members WHERE id = ?"
  )
    .bind(id)
    .first();
  return c.json({ data: item }, 201);
});

bagiHasil.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM bagi_hasil_members WHERE id = ?"
  )
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json<Partial<{ name: string; percentage: number }>>();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.percentage !== undefined) {
    fields.push("percentage = ?");
    values.push(body.percentage);
  }

  if (fields.length === 0) return c.json({ error: "No fields to update" }, 400);

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE bagi_hasil_members SET ${fields.join(", ")} WHERE id = ?`
  )
    .bind(...values)
    .run();

  const item = await c.env.DB.prepare(
    "SELECT * FROM bagi_hasil_members WHERE id = ?"
  )
    .bind(id)
    .first();
  return c.json({ data: item });
});

bagiHasil.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM bagi_hasil_members WHERE id = ?"
  )
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  await c.env.DB.prepare("DELETE FROM bagi_hasil_members WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ data: { ok: true } });
});

export default bagiHasil;
