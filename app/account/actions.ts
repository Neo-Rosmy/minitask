"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function back(kind: "ok" | "error", msg: string): never {
  redirect(`/account?${kind}=${encodeURIComponent(msg)}`);
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

  const { error } = await supabase.auth.updateUser({ email });
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
