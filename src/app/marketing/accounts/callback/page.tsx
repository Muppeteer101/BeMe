"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Authentication denied: ${error}`);
      // Notify parent window
      if (window.opener) {
        window.opener.postMessage({
          type: "oauth_callback",
          success: false,
          error: error,
        }, window.location.origin);
      }
      return;
    }

    if (!code || !stateParam) {
      setStatus("error");
      setMessage("Missing authentication data. Please try again.");
      return;
    }

    // Parse state to get platform
    let platform = "";
    try {
      const state = JSON.parse(atob(stateParam));
      platform = state.platform;
    } catch {
      setStatus("error");
      setMessage("Invalid authentication state. Please try again.");
      return;
    }

    // Exchange code for token
    async function exchangeToken() {
      try {
        const response = await fetch("/api/marketing/accounts/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            platform,
            redirectUri: `${window.location.origin}/marketing/accounts/callback`,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(`${data.platformName || platform} connected successfully! This window will close shortly.`);

          // Notify parent window
          if (window.opener) {
            window.opener.postMessage({
              type: "oauth_callback",
              platform,
              success: true,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              tokenExpiry: data.tokenExpiry,
              username: data.username,
              displayName: data.displayName,
              profileImage: data.profileImage,
            }, window.location.origin);
          }

          // Close window after a moment
          setTimeout(() => window.close(), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to complete authentication.");

          if (window.opener) {
            window.opener.postMessage({
              type: "oauth_callback",
              platform,
              success: false,
              error: data.error,
            }, window.location.origin);
          }
        }
      } catch {
        setStatus("error");
        setMessage("Network error during authentication. Please try again.");

        if (window.opener) {
          window.opener.postMessage({
            type: "oauth_callback",
            platform,
            success: false,
            error: "Network error",
          }, window.location.origin);
        }
      }
    }

    exchangeToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-4">
        {status === "processing" && (
          <>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-violet-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Connecting Account</h2>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-semibold text-green-400">Connected!</h2>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl">❌</div>
            <h2 className="text-lg font-semibold text-red-400">Connection Failed</h2>
            <p className="text-gray-400 text-sm">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
