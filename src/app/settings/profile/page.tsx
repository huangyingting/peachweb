"use client";

import { useEffect, useState } from "react";
import { User, Check } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarColor, setAvatarColor] = useState("#ff6b4a");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(
        (data: {
          user?: {
            name?: string;
            email?: string;
            bio?: string;
            avatarColor?: string;
          };
        }) => {
          if (data.user) {
            setName(data.user.name ?? "");
            setEmail(data.user.email ?? "");
            setBio(data.user.bio ?? "");
            setAvatarColor(data.user.avatarColor ?? "#ff6b4a");
          }
        },
      )
      .catch(() => undefined);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        avatarColor,
        ...(newPassword ? { newPassword } : {}),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "Could not update profile.");
      return;
    }

    setNewPassword("");
    setSaved(true);
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <User className="w-5 h-5 text-[#ff6b4a]" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your PeachWorlds Studio identity, avatar badge color, and security credentials.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl bg-[#11131e] border border-white/10 p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div
              style={{ backgroundColor: avatarColor }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white"
            >
              {(name || email || "P")[0]?.toUpperCase()}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Avatar Accent Color
              </label>
              <input
                type="color"
                value={avatarColor}
                onChange={(e) => setAvatarColor(e.target.value)}
                className="h-8 w-20 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Account Email (Verified via Invite)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12]/60 border border-white/5 text-sm text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Creator Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Spatial 3D web designer & creative technologist"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Update Password (Optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white"
            />
          </div>

          {error && <div className="text-xs text-rose-400">{error}</div>}
          {saved && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Profile settings saved.</span>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>
    </WorkspaceShell>
  );
}
