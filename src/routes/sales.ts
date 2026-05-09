import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

type Vars = { user: { sub: string; name: string; email: string } };

const sales = new Hono<{ Bindings: CloudflareBindings; Variables: Vars }>();

sales.use("*", authMiddleware);

sales.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    `
    SELECT
      s.*,
      l.name AS livestock_name,
      l.type AS livestock_type
    FROM sales s
    LEFT JOIN livestock l ON s.livestock_id = l.id
    ORDER BY s.created_at DESC
  `
  ).all();

  return c.json({ data: result.results });
});

sales.get("/:id", async (c) => {
  const item = await c.env.DB.prepare(
    `
    SELECT
      s.*,
      l.name AS livestock_name,
      l.type AS livestock_type,
      l.weight_kg AS livestock_weight_kg
    FROM sales s
    LEFT JOIN livestock l ON s.livestock_id = l.id
    WHERE s.id = ?
  `
  )
    .bind(c.req.param("id"))
    .first();

  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ data: item });
});

sales.post("/", async (c) => {
  const body = await c.req.json<{
    livestock_id: string;
    buyer_name: string;
    selling_price: number;
    amount_paid: number;
    payment_status: string;
    sale_date: string;
    delivery_date?: string;
    notes?: string;
  }>();

  const {
    livestock_id,
    buyer_name,
    selling_price,
    amount_paid,
    payment_status,
    sale_date,
  } = body;

  if (!livestock_id || !buyer_name || !selling_price || !sale_date) {
    return c.json(
      {
        error:
          "livestock_id, buyer_name, selling_price, sale_date are required",
      },
      400
    );
  }

  const animal = await c.env.DB.prepare(
    "SELECT id, status FROM livestock WHERE id = ?"
  )
    .bind(livestock_id)
    .first<{ id: string; status: string }>();

  if (!animal) return c.json({ error: "Hewan tidak ditemukan" }, 404);
  if (animal.status === "sold")
    return c.json({ error: "Hewan sudah terjual" }, 400);

  const id = crypto.randomUUID();

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO sales (id, livestock_id, buyer_name, selling_price, amount_paid, payment_status, sale_date, delivery_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      livestock_id,
      buyer_name,
      selling_price,
      amount_paid ?? 0,
      payment_status ?? "dp",
      sale_date,
      body.delivery_date ?? null,
      body.notes ?? null
    ),
    c.env.DB.prepare(
      "UPDATE livestock SET status = 'sold', updated_at = datetime('now') WHERE id = ?"
    ).bind(livestock_id),
  ]);

  const item = await c.env.DB.prepare(
    `
    SELECT s.*, l.name AS livestock_name, l.type AS livestock_type
    FROM sales s LEFT JOIN livestock l ON s.livestock_id = l.id
    WHERE s.id = ?
  `
  )
    .bind(id)
    .first();

  return c.json({ data: item }, 201);
});

sales.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare("SELECT id FROM sales WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json<
    Partial<{
      buyer_name: string;
      selling_price: number;
      amount_paid: number;
      payment_status: string;
      sale_date: string;
      delivery_date: string;
      notes: string;
    }>
  >();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.buyer_name !== undefined) {
    fields.push("buyer_name = ?");
    values.push(body.buyer_name);
  }
  if (body.selling_price !== undefined) {
    fields.push("selling_price = ?");
    values.push(body.selling_price);
  }
  if (body.amount_paid !== undefined) {
    fields.push("amount_paid = ?");
    values.push(body.amount_paid);
  }
  if (body.payment_status !== undefined) {
    fields.push("payment_status = ?");
    values.push(body.payment_status);
  }
  if (body.sale_date !== undefined) {
    fields.push("sale_date = ?");
    values.push(body.sale_date);
  }
  if (body.delivery_date !== undefined) {
    fields.push("delivery_date = ?");
    values.push(body.delivery_date);
  }
  if (body.notes !== undefined) {
    fields.push("notes = ?");
    values.push(body.notes);
  }

  if (fields.length === 0) return c.json({ error: "No fields to update" }, 400);

  values.push(id);
  await c.env.DB.prepare(`UPDATE sales SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  const item = await c.env.DB.prepare(
    `
    SELECT s.*, l.name AS livestock_name, l.type AS livestock_type
    FROM sales s LEFT JOIN livestock l ON s.livestock_id = l.id
    WHERE s.id = ?
  `
  )
    .bind(id)
    .first();

  return c.json({ data: item });
});

sales.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const sale = await c.env.DB.prepare(
    "SELECT livestock_id FROM sales WHERE id = ?"
  )
    .bind(id)
    .first<{ livestock_id: string }>();

  if (!sale) return c.json({ error: "Not found" }, 404);

  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM sales WHERE id = ?").bind(id),
    c.env.DB.prepare(
      "UPDATE livestock SET status = 'available', updated_at = datetime('now') WHERE id = ?"
    ).bind(sale.livestock_id),
  ]);

  return c.json({ data: { ok: true } });
});

export default sales;
