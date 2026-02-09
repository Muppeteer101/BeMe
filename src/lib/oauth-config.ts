// ============================================================
// OAuth Configuration for Social Platform Connections
// ============================================================

export interface OAuthPlatform {
  id: "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok";
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnvKey: string;
  clientSecretEnvKey: string;
  description: string;
  setupUrl: string;
}

export const OAUTH_PLATFORMS: OAuthPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "text-pink-400",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    borderColor: "border-pink-500/30",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights", "pages_show_list"],
    clientIdEnvKey: "INSTAGRAM_CLIENT_ID",
    clientSecretEnvKey: "INSTAGRAM_CLIENT_SECRET",
    description: "Post photos, carousels, and reels to your Instagram business account",
    setupUrl: "https://developers.facebook.com/apps",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "text-blue-400",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-500/30",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    clientIdEnvKey: "FACEBOOK_CLIENT_ID",
    clientSecretEnvKey: "FACEBOOK_CLIENT_SECRET",
    description: "Publish posts and manage your Facebook Page",
    setupUrl: "https://developers.facebook.com/apps",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "𝕏",
    color: "text-gray-300",
    bgColor: "bg-gray-800",
    borderColor: "border-gray-600/30",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnvKey: "TWITTER_CLIENT_ID",
    clientSecretEnvKey: "TWITTER_CLIENT_SECRET",
    description: "Post tweets and threads to your X account",
    setupUrl: "https://developer.twitter.com/en/portal/dashboard",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "text-blue-300",
    bgColor: "bg-blue-700",
    borderColor: "border-blue-400/30",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "w_member_social"],
    clientIdEnvKey: "LINKEDIN_CLIENT_ID",
    clientSecretEnvKey: "LINKEDIN_CLIENT_SECRET",
    description: "Share posts and articles to your LinkedIn profile",
    setupUrl: "https://www.linkedin.com/developers/apps",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-br from-cyan-500 to-pink-500",
    borderColor: "border-cyan-500/30",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.publish", "video.upload"],
    clientIdEnvKey: "TIKTOK_CLIENT_ID",
    clientSecretEnvKey: "TIKTOK_CLIENT_SECRET",
    description: "Upload videos and manage your TikTok creator account",
    setupUrl: "https://developers.tiktok.com/apps/",
  },
];

export function getOAuthPlatform(id: string): OAuthPlatform | undefined {
  return OAUTH_PLATFORMS.find((p) => p.id === id);
}

export function buildAuthUrl(platform: OAuthPlatform, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: `\${process.env.NEXT_PUBLIC_${platform.clientIdEnvKey} || ""}`,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: platform.scopes.join(" "),
    state,
  });

  // Platform-specific auth URL tweaks
  if (platform.id === "twitter") {
    params.set("code_challenge", "challenge");
    params.set("code_challenge_method", "plain");
  }

  return `${platform.authUrl}?${params.toString()}`;
}
