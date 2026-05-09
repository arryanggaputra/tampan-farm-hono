import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

type Vars = { user: { sub: string; name: string; email: string } };

const expenses = new Hono<{ Bindings: CloudflareBindings; Variables: Vars }>();

expenses.use("*", authMiddleware);

expenses.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC"
  ).all();
  return c.json({ data: result.results });
});

expenses.post("/", async (c) => {
  const body = await c.req.json<{
    category: string;
    description: string;
    cost: number;
    expense_date: string;
  }>();

  const { category, description, cost, expense_date } = body;

  if (!category || !description || !cost || !expense_date) {
    return c.json(
      { error: "category, description, cost, expense_date are required" },
      400
    );
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO expenses (id, category, description, cost, expense_date) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, category, description, cost, expense_date)
    .run();

  const item = await c.env.DB.prepare("SELECT * FROM expenses WHERE id = ?")
    .bind(id)
    .first();
  return c.json({ data: item }, 201);
});

expenses.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM expenses WHERE id = ?"
  )
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json<
    Partial<{
      category: string;
      description: string;
      cost: number;
      expense_date: string;
    }>
  >();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.category !== undefined) {
    fields.push("category = ?");
    values.push(body.category);
  }
  if (body.description !== undefined) {
    fields.push("description = ?");
    values.push(body.description);
  }
  if (body.cost !== undefined) {
    fields.push("cost = ?");
    values.push(body.cost);
  }
  if (body.expense_date !== undefined) {
    fields.push("expense_date = ?");
    values.push(body.expense_date);
  }

  if (fields.length === 0) return c.json({ error: "No fields to update" }, 400);

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`
  )
    .bind(...values)
    .run();

  const item = await c.env.DB.prepare("SELECT * FROM expenses WHERE id = ?")
    .bind(id)
    .first();
  return c.json({ data: item });
});

expenses.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM expenses WHERE id = ?"
  )
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  await c.env.DB.prepare("DELETE FROM expenses WHERE id = ?").bind(id).run();
  return c.json({ data: { ok: true } });
});

export default expenses;
