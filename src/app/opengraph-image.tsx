import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — Website Design & Development`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#07080B",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            backgroundImage: "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {site.name}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "rgba(245,247,251,0.72)", maxWidth: 900 }}>
          {site.ogDescription}
        </div>
      </div>
    ),
    { ...size }
  );
}
