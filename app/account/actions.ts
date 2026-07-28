"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function back(kind: "ok" | "error", msg: string): never {
  redirect(`/account?${kind}=${encodeURIComponent(msg)}`);
}

// Origin of the current request (localhost in dev, the deployed domain in
// prod). Used so email confirmation links come back to the right host.
async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("display_name") ?? "").trim().slice(0, 60);

  const { error } = await supabase.auth.updateUser({
    data: { display_name: name },
  });
  if (error) back("error", error.message);

  revalidatePath("/", "layout");
  back("ok", "Perfil actualizado.");
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) back("error", "Ingresa un email.");

  const origin = await requestOrigin();
  const { error } = await supabase.auth.updateUser(
    { email },
    origin
      ? { emailRedirectTo: `${origin}/auth/confirm?next=/account` }
      : undefined
  );
  if (error) back("error", error.message);

  // Supabase envía un enlace de confirmación al nuevo (y al viejo si
  // "Secure email change" está activo). El cambio se aplica al confirmar.
  back(
    "ok",
    "Te enviamos un enlace de confirmación. Revisa tu correo para completar el cambio de email."
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6)
    back("error", "La contraseña debe tener al menos 6 caracteres.");
  if (password !== confirm) back("error", "Las contraseñas no coinciden.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) back("error", error.message);

  back("ok", "Contraseña actualizada.");
}
