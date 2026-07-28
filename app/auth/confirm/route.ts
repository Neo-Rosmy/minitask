import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles Supabase email confirmation links (email change, signup, recovery…).
// The @supabase/ssr (PKCE) flow needs the app to verify the token itself —
// without this route the hosted-verify link fails with access_denied.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(
        `${origin}${next}?ok=${encodeURIComponent("Email confirmado.")}`
      );
    }
  } else if (code) {
    // Fallback for the code-exchange (default ConfirmationURL) flow.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${origin}${next}?ok=${encodeURIComponent("Email confirmado.")}`
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/account?error=${encodeURIComponent(
      "El enlace no es válido o expiró. Vuelve a intentar el cambio."
    )}`
  );
}
