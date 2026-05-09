import { useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Beef } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input, Field } from "../components/ui/Input";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  if (user) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(form.get("email") as string, form.get("password") as string);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-lg">
            <Beef className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tampan Farm</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ops Tracker — Masuk ke akun Anda
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" loading={submitting} className="w-full mt-1">
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
