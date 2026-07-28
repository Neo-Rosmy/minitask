import { ImageResponse } from "next/og";

export const alt = "Kanban — Organiza tu trabajo en tableros";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 60%, #818cf8 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>Kanban</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 800,
            marginTop: 40,
            lineHeight: 1.1,
          }}
        >
          <div>Organiza tu trabajo</div>
          <div>en tableros</div>
        </div>
        <div style={{ fontSize: 30, marginTop: 28, opacity: 0.9 }}>
          Tableros · listas · tarjetas · drag & drop · Next.js + Supabase
        </div>
      </div>
    ),
    { ...size }
  );
}
