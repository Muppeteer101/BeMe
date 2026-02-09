"use client";

import { useState, useEffect, useCallback } from "react";
import { accountStore, type ConnectedAccount } from "@/lib/store";
import { OAUTH_PLATFORMS, type OAuthPlatform } from "@/lib/oauth-config";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    setAccounts(accountStore.getAll());
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const getConnectedAccount = (platformId: string): ConnectedAccount | undefined => {
    return accounts.find((a) => a.platform === platformId && a.status === "active");
  };

  const handleConnect = useCallback((platform: OAuthPlatform) => {
    setConnecting(platform.id);

    // Build the OAuth redirect URL
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/marketing/accounts/callback`;
    const state = JSON.stringify({ platform: platform.id, ts: Date.now() });

    const params = new URLSearchParams({
      client_id: "", // Will be set from env vars on the server
      redirect_uri: redirectUri,
      response_type: "code",
      scope: platform.scopes.join(" "),
      state: btoa(state),
    });

    // For platforms that need PKCE
    if (platform.id === "twitter") {
      params.set("code_challenge", "challenge");
      params.set("code_challenge_method", "plain");
    }

    const authUrl = `${platform.authUrl}?${params.toString()}`;

    // Open popup window for OAuth
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      `connect_${platform.id}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Listen for the callback message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth_callback" && event.data?.platform === platform.id) {
        window.removeEventListener("message", handleMessage);
        popup?.close();

        if (event.data.success) {
          // Store the connected account
          accountStore.connect({
            platform: platform.id as ConnectedAccount["platform"],
            username: event.data.username || `@${platform.id}_user`,
            displayName: event.data.displayName || platform.name + " Account",
            profileImage: event.data.profileImage || "",
            accessToken: event.data.accessToken || "",
            refreshToken: event.data.refreshToken || "",
            tokenExpiry: event.data.tokenExpiry || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            scopes: platform.scopes,
            status: "active",
          });
          setAccounts(accountStore.getAll());
          showFeedback("success", `${platform.name} connected successfully!`);
        } else {
          showFeedback("error", event.data.error || `Failed to connect ${platform.name}`);
        }
        setConnecting(null);
      }
    };

    window.addEventListener("message", handleMessage);

    // Fallback: If popup is closed manually
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        window.removeEventListener("message", handleMessage);
        setConnecting(null);
      }
    }, 1000);

    // Cleanup after 5 minutes max
    setTimeout(() => {
      clearInterval(checkPopup);
      window.removeEventListener("message", handleMessage);
      setConnecting(null);
    }, 300000);
  }, []);

  const handleDisconnect = useCallback((account: ConnectedAccount, platformName: string) => {
    accountStore.remove(account.id);
    setAccounts(accountStore.getAll());
    showFeedback("success", `${platformName} disconnected`);
  }, []);

  const handleTestConnection = useCallback(async (account: ConnectedAccount, platformName: string) => {
    setTestingId(account.id);

    // Simulate testing the token
    await new Promise((r) => setTimeout(r, 1500));

    // Check if token is still "valid" (not expired)
    const isExpired = account.tokenExpiry && new Date(account.tokenExpiry) < new Date();
    if (isExpired) {
      accountStore.disconnect(account.id);
      setAccounts(accountStore.getAll());
      showFeedback("error", `${platformName} token expired. Please reconnect.`);
    } else {
      showFeedback("success", `${platformName} connection is active!`);
    }
    setTestingId(null);
  }, []);

  return (
    <div className="p-8 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Connected Accounts</h1>
        <p className="text-gray-400 mt-1">
          Connect your social media accounts to publish content directly from BeMe
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg z-50 animate-pulse ${
            feedback.type === "success"
              ? "bg-green-600/90 text-white"
              : "bg-red-600/90 text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {OAUTH_PLATFORMS.map((platform) => {
          const connected = getConnectedAccount(platform.id);
          const isConnecting = connecting === platform.id;
          const isTesting = testingId === connected?.id;

          return (
            <div
              key={platform.id}
              className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                connected
                  ? `${platform.borderColor} border-2`
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              {/* Platform Header */}
              <div className={`${platform.bgColor} px-5 py-4 flex items-center gap-3`}>
                <span className="text-2xl">{platform.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{platform.name}</h3>
                  <p className="text-white/70 text-xs">{platform.description}</p>
                </div>
                {connected && (
                  <div className="bg-green-500/20 border border-green-400/40 rounded-full px-2.5 py-0.5">
                    <span className="text-green-300 text-xs font-medium">Connected</span>
                  </div>
                )}
              </div>

              {/* Account Info or Connect Button */}
              <div className="p-5">
                {connected ? (
                  <div className="space-y-4">
                    {/* Profile Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg overflow-hidden">
                        {connected.profileImage ? (
                          <img
                            src={connected.profileImage}
                            alt={connected.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{platform.icon}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {connected.displayName}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {connected.username}
                        </p>
                      </div>
                    </div>

                    {/* Connection Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Connected {new Date(connected.connectedAt).toLocaleDateString()}</p>
                      <p>
                        Permissions: {connected.scopes.length} scope{connected.scopes.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => handleTestConnection(connected, platform.name)}
                        disabled={isTesting}
                        className="flex-1 bg-gray-800 text-gray-300 text-xs font-medium py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {isTesting ? "Testing..." : "Test Connection"}
                      </button>
                      <button
                        onClick={() => handleDisconnect(connected, platform.name)}
                        className="flex-1 bg-red-600/20 text-red-400 text-xs font-medium py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-sm">
                      Not connected yet. Click below to sign in with {platform.name} and authorize BeMe to post on your behalf.
                    </p>

                    <button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                      className={`w-full ${platform.bgColor} text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
                    >
                      {isConnecting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
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
                          Connecting...
                        </span>
                      ) : (
                        `Connect ${platform.name}`
                      )}
                    </button>

                    <p className="text-gray-600 text-xs text-center">
                      Requires a{" "}
                      <a
                        href={platform.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 underline"
                      >
                        developer app
                      </a>{" "}
                      to be configured
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Guide */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Setup Guide</h2>
        <p className="text-gray-400 text-sm">
          To connect each platform, you need to create a developer app and add your credentials to BeMe.
          Each platform has its own developer portal where you register your app and get API keys.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OAUTH_PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="text-xl">{platform.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{platform.name}</p>
                <p className="text-gray-500 text-xs truncate">
                  Env: {platform.clientIdEnvKey}
                </p>
              </div>
              <a
                href={platform.setupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 text-xs font-medium"
              >
                Setup
              </a>
            </div>
          ))}
        </div>

        <div className="bg-violet-600/10 border border-violet-500/30 rounded-lg p-4 mt-4">
          <p className="text-violet-300 text-sm font-medium mb-2">Environment Variables Required</p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
            {OAUTH_PLATFORMS.map((p) => (
              <div key={p.id}>
                <span className="text-gray-600"># {p.name}</span>
                <br />
                <span className="text-violet-400">{p.clientIdEnvKey}</span>=your_client_id
                <br />
                <span className="text-violet-400">{p.clientSecretEnvKey}</span>=your_client_secret
                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
