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
  const contentType = c.req.header("content-type") ?? "";

  let category: string, description: string, cost: number, expense_date: string;
  let imageFile: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await c.req.formData();
    category = form.get("category") as string;
    description = form.get("description") as string;
    cost = Number(form.get("cost"));
    expense_date = form.get("expense_date") as string;
    imageFile = form.get("photo") as File | null;
  } else {
    const body = await c.req.json<{
      category: string;
      description: string;
      cost: number;
      expense_date: string;
    }>();
    category = body.category;
    description = body.description;
    cost = body.cost;
    expense_date = body.expense_date;
  }

  if (!category || !description || !cost || !expense_date) {
    return c.json(
      { error: "category, description, cost, expense_date are required" },
      400
    );
  }

  const id = crypto.randomUUID();
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const key = `expenses/${id}/${Date.now()}.${ext}`;
    await c.env.STORAGE.put(key, imageFile.stream(), {
      httpMetadata: { contentType: imageFile.type },
    });
    imageUrl = `/api/expenses/${id}/photo`;
  }

  await c.env.DB.prepare(
    "INSERT INTO expenses (id, category, description, cost, expense_date, image_url) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, category, description, cost, expense_date, imageUrl)
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

expenses.post("/:id/photo", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM expenses WHERE id = ?"
  )
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const form = await c.req.formData();
  const file = form.get("photo") as File | null;
  if (!file || file.size === 0) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const ext = file.name.split(".").pop();
  const key = `expenses/${id}/${Date.now()}.${ext}`;
  await c.env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const imageUrl = `/api/expenses/${id}/photo`;
  await c.env.DB.prepare("UPDATE expenses SET image_url = ? WHERE id = ?")
    .bind(imageUrl, id)
    .run();

  return c.json({ data: { image_url: imageUrl } });
});

expenses.get("/:id/photo", async (c) => {
  const id = c.req.param("id");
  const list = await c.env.STORAGE.list({ prefix: `expenses/${id}/` });

  if (!list.objects.length) {
    return c.json({ error: "No photo found" }, 404);
  }

  const latest = list.objects.sort(
    (a, b) => b.uploaded.getTime() - a.uploaded.getTime()
  )[0];
  const obj = await c.env.STORAGE.get(latest.key);
  if (!obj) return c.json({ error: "Photo not found" }, 404);

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
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
