import { NextResponse } from "next/server";

// Platform-specific publishing functions
async function publishToInstagram(content: { body: string; hashtags: string[]; imageUrl?: string }, accessToken: string) {
  // Instagram Graph API: Create media container, then publish
  const caption = `${content.body}\n\n${content.hashtags.join(" ")}`;

  // For text-only posts, Instagram requires an image
  // In a full implementation, you'd upload the image first
  const response = await fetch(
    `https://graph.instagram.com/me/media?caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
    { method: "POST" }
  );

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Instagram publish failed: ${error}`);
  }

  const data = await response.json();
  return { postId: data.id, postUrl: `https://www.instagram.com/p/${data.id}` };
}

async function publishToFacebook(content: { body: string; hashtags: string[] }, accessToken: string) {
  const message = `${content.body}\n\n${content.hashtags.join(" ")}`;

  // Get page access token first
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0];

  if (!page) {
    throw new Error("No Facebook Page found. Make sure your app has pages_manage_posts permission.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${page.id}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: page.access_token,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Facebook publish failed: ${error}`);
  }

  const data = await response.json();
  return { postId: data.id, postUrl: `https://www.facebook.com/${data.id}` };
}

async function publishToTwitter(content: { body: string; hashtags: string[] }, accessToken: string) {
  const text = `${content.body}\n\n${content.hashtags.join(" ")}`.slice(0, 280);

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Twitter publish failed: ${error}`);
  }

  const data = await response.json();
  return { postId: data.data.id, postUrl: `https://x.com/i/status/${data.data.id}` };
}

async function publishToLinkedIn(content: { body: string; hashtags: string[] }, accessToken: string) {
  // Get user profile URN
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profileData = await profileRes.json();
  const personUrn = `urn:li:person:${profileData.sub}`;

  const text = `${content.body}\n\n${content.hashtags.join(" ")}`;

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`LinkedIn publish failed: ${error}`);
  }

  const data = await response.json();
  return { postId: data.id, postUrl: `https://www.linkedin.com/feed/update/${data.id}` };
}

async function publishToTikTok(content: { body: string; hashtags: string[] }, accessToken: string) {
  // TikTok requires video content — this is a placeholder for the Content Posting API
  const caption = `${content.body} ${content.hashtags.join(" ")}`;

  // TikTok's Content Posting API requires video upload first
  // This is a simplified version
  const response = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: { title: caption, privacy_level: "PUBLIC_TO_EVERYONE" },
      source_info: { source: "PULL_FROM_URL" },
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`TikTok publish failed: ${error}`);
  }

  const data = await response.json();
  return { postId: data.data?.publish_id || "", postUrl: "" };
}

const PUBLISHERS: Record<string, (content: { body: string; hashtags: string[]; imageUrl?: string }, token: string) => Promise<{ postId: string; postUrl: string }>> = {
  instagram: publishToInstagram,
  facebook: publishToFacebook,
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  tiktok: publishToTikTok,
};

export async function POST(request: Request) {
  try {
    const { platform, content, accessToken, scheduleAt } = await request.json();

    if (!platform || !content || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: platform, content, accessToken" },
        { status: 400 }
      );
    }

    // If scheduled for later, just acknowledge (client handles the scheduling)
    if (scheduleAt) {
      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledAt: scheduleAt,
        message: `Content scheduled for ${new Date(scheduleAt).toLocaleString()}`,
      });
    }

    // Publish now
    const publisher = PUBLISHERS[platform];
    if (!publisher) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    const result = await publisher(content, accessToken);

    return NextResponse.json({
      success: true,
      published: true,
      postId: result.postId,
      postUrl: result.postUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Publish failed: ${message}` }, { status: 500 });
  }
}
