import { NextResponse } from "next/server";

// Platform token exchange configuration
const PLATFORM_CONFIG: Record<string, { tokenUrl: string; clientIdEnv: string; clientSecretEnv: string; profileUrl?: string }> = {
  instagram: {
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    profileUrl: "https://graph.instagram.com/me?fields=id,username&access_token=",
  },
  facebook: {
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    profileUrl: "https://graph.facebook.com/me?fields=id,name,picture&access_token=",
  },
  twitter: {
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
  },
  linkedin: {
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
  tiktok: {
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    clientIdEnv: "TIKTOK_CLIENT_ID",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
  },
};

const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

export async function POST(request: Request) {
  try {
    const { code, platform, redirectUri } = await request.json();

    if (!code || !platform || !redirectUri) {
      return NextResponse.json(
        { error: "Missing required fields: code, platform, redirectUri" },
        { status: 400 }
      );
    }

    const config = PLATFORM_CONFIG[platform];
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }

    const clientId = process.env[config.clientIdEnv];
    const clientSecret = process.env[config.clientSecretEnv];

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: `${PLATFORM_NAMES[platform]} API credentials not configured. Add ${config.clientIdEnv} and ${config.clientSecretEnv} to your environment variables.`,
        },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenParams: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error || "Token exchange failed" },
        { status: 400 }
      );
    }

    // Extract token info
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || "";
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Try to fetch profile info
    let username = "";
    let displayName = PLATFORM_NAMES[platform] + " Account";
    let profileImage = "";

    if (config.profileUrl && accessToken) {
      try {
        const profileRes = await fetch(config.profileUrl + accessToken);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (platform === "instagram") {
            username = `@${profileData.username || ""}`;
            displayName = profileData.username || displayName;
          } else if (platform === "facebook") {
            displayName = profileData.name || displayName;
            profileImage = profileData.picture?.data?.url || "";
          }
        }
      } catch {
        // Profile fetch is optional, continue without it
      }
    }

    return NextResponse.json({
      success: true,
      platformName: PLATFORM_NAMES[platform],
      accessToken,
      refreshToken,
      tokenExpiry,
      username: username || `@${platform}_user`,
      displayName,
      profileImage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Connection failed: ${message}` }, { status: 500 });
  }
}
