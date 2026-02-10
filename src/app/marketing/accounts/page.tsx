"use client";

import { useState, useEffect, useCallback } from "react";
import { accountStore, type ConnectedAccount } from "@/lib/store";
import { OAUTH_PLATFORMS, type OAuthPlatform } from "@/lib/oauth-config";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<OAuthPlatform | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");

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

  const openConnectModal = (platform: OAuthPlatform) => {
    setConnectingPlatform(platform);
    setUsernameInput("");
    setDisplayNameInput("");
  };

  const handleConnect = useCallback(() => {
    if (!connectingPlatform || !usernameInput.trim()) return;

    accountStore.connect({
      platform: connectingPlatform.id as ConnectedAccount["platform"],
      username: usernameInput.startsWith("@") ? usernameInput : `@${usernameInput}`,
      displayName: displayNameInput.trim() || usernameInput.trim(),
      profileImage: "",
      accessToken: "simulated-token",
      refreshToken: "",
      tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      scopes: connectingPlatform.scopes,
      status: "active",
    });

    setAccounts(accountStore.getAll());
    showFeedback("success", `${connectingPlatform.name} connected!`);
    setConnectingPlatform(null);
  }, [connectingPlatform, usernameInput, displayNameInput]);

  const handleDisconnect = useCallback((account: ConnectedAccount, platformName: string) => {
    accountStore.remove(account.id);
    setAccounts(accountStore.getAll());
    showFeedback("success", `${platformName} disconnected`);
  }, []);

  return (
    <div className="p-8 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Connected Accounts</h1>
        <p className="text-gray-400 mt-1">
          Connect your social media accounts to publish content directly
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

      {/* How It Works */}
      <div className="bg-violet-600/10 border border-violet-500/30 rounded-lg p-4">
        <p className="text-violet-300 text-sm font-medium mb-1">How publishing works</p>
        <p className="text-gray-400 text-sm">
          When you publish, your content is copied to your clipboard and the platform opens in a new tab — just paste and post.
          Connect your accounts below so you can pick which ones to publish to.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {OAUTH_PLATFORMS.map((platform) => {
          const connected = getConnectedAccount(platform.id);

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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                        <span>{platform.icon}</span>
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

                    <div className="text-xs text-gray-500">
                      <p>Connected {new Date(connected.connectedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-800">
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
                      Not connected. Add your {platform.name} account so you can publish to it.
                    </p>

                    <button
                      onClick={() => openConnectModal(platform)}
                      className={`w-full ${platform.bgColor} text-white font-medium py-2.5 rounded-lg transition-all text-sm hover:opacity-90`}
                    >
                      Connect {platform.name}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {connectingPlatform && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full">
            <div className={`${connectingPlatform.bgColor} px-6 py-4 rounded-t-xl flex items-center gap-3`}>
              <span className="text-2xl">{connectingPlatform.icon}</span>
              <div>
                <h3 className="text-white font-semibold">Connect {connectingPlatform.name}</h3>
                <p className="text-white/70 text-xs">Add your account details</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={`e.g. @your${connectingPlatform.id}handle`}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder-gray-500"
                  onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name <span className="text-gray-500">(optional)</span></label>
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="Your name or business name"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder-gray-500"
                  onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConnectingPlatform(null)}
                className="flex-1 bg-gray-800 text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!usernameInput.trim()}
                className={`flex-1 ${connectingPlatform.bgColor} text-white font-medium py-2.5 rounded-lg transition-all text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
