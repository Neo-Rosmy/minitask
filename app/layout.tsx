import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://minitask-fawn.vercel.app"),
  title: {
    default: "Kanban — Organiza tus tareas",
    template: "%s · Kanban",
  },
  description:
    "Tableros, listas y tarjetas para organizar tu trabajo. Simple, rápido, tuyo.",
  openGraph: {
    title: "Kanban — Organiza tu trabajo en tableros",
    description:
      "Tableros, listas y tarjetas con drag & drop. Hecho con Next.js + Supabase.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban — Organiza tu trabajo en tableros",
    description: "Tableros, listas y tarjetas con drag & drop.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Anti-flash: aplica el tema antes de pintar, evitando parpadeo. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
