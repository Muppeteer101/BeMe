import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { platform, accessToken } = await request.json();

    if (!platform) {
      return NextResponse.json({ error: "Missing platform" }, { status: 400 });
    }

    // Attempt to revoke the token on the platform side (best effort)
    if (accessToken) {
      try {
        if (platform === "facebook" || platform === "instagram") {
          await fetch(
            `https://graph.facebook.com/me/permissions?access_token=${accessToken}`,
            { method: "DELETE" }
          );
        }
        // Other platforms: token revocation endpoints vary
        // Twitter: POST https://api.twitter.com/2/oauth2/revoke
        // LinkedIn: No standard revocation endpoint
        // TikTok: POST https://open.tiktokapis.com/v2/oauth/revoke/
      } catch {
        // Revocation is best-effort
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Disconnect failed: ${message}` }, { status: 500 });
  }
}
