import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DaamCheck — Indian Food Bill Validator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "#059669",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            padding: "8px 20px",
            borderRadius: 9999,
            marginBottom: 32,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Free Consumer Rights Tool
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          DaamCheck
        </div>
        <div
          style={{
            color: "#A7F3D0",
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          Is your restaurant bill legal?
        </div>
        <div
          style={{
            color: "#6B7280",
            fontSize: 24,
            marginTop: 16,
            lineHeight: 1.4,
          }}
        >
          Service charge banned · GST capped at 5% · IRCTC price caps
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            color: "#374151",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          daamcheck.vercel.app
        </div>
      </div>
    ),
    size
  );
}
