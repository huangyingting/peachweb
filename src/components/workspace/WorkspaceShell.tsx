"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  LayoutTemplate,
  Globe,
  MailPlus,
  Archive,
  User,
  Bookmark,
  ShieldCheck,
  Plus,
  Sparkles,
  ChevronDown,
  LogOut,
  Users,
  Bell,
  X,
} from "lucide-react";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  avatarColor?: string;
}

interface WorkspaceShellProps {
  children: React.ReactNode;
  onNewWebsiteClick?: () => void;
}

export function WorkspaceShell({
  children,
  onNewWebsiteClick,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceInfo | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [creatingBlank, setCreatingBlank] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json() as Promise<{ user: CurrentUser | null }>)
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => undefined);

    fetch("/api/workspaces")
      .then((r) => r.json() as Promise<{ workspaces?: WorkspaceInfo[] }>)
      .then((data) => {
        if (data.workspaces && data.workspaces.length > 0) {
          setWorkspaces(data.workspaces);
          setActiveWorkspace(data.workspaces[0]);
        }
      })
      .catch(() => undefined);
  }, [router]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_team", name: newTeamName }),
    });
    if (res.ok) {
      const data = (await res.json()) as { workspace: WorkspaceInfo };
      setWorkspaces((prev) => [...prev, data.workspace]);
      setActiveWorkspace(data.workspace);
      setNewTeamName("");
      setCreateTeamOpen(false);
      setSwitcherOpen(false);
    }
  }

  async function handleStartFromScratch() {
    setCreatingBlank(true);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled 3D Website",
          workspaceId: activeWorkspace?.id,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { website: { id: string } };
        router.push(`/builder/${data.website.id}`);
      }
    } finally {
      setCreatingBlank(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const navItems = [
    { href: "/workspace", label: "Home", icon: Home },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/my-websites", label: "My Websites", icon: Globe },
    { href: "/invites", label: "Invites", icon: MailPlus },
    { href: "/archive", label: "Archive", icon: Archive },
  ];

  const settingsItems = [
    { href: "/settings/profile", label: "Profile Settings", icon: User },
    { href: "/settings/my-templates", label: "My Templates", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-[#08090f] text-white flex">
      {/* Left Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0d16] flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              data-testid="workspace-switcher-btn"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="w-full p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {activeWorkspace?.name?.[0]?.toUpperCase() ?? "P"}
                </div>
                <div className="text-left truncate">
                  <div className="text-xs font-bold text-white truncate">
                    {activeWorkspace?.name ?? "PeachWorlds Workspace"}
                  </div>
                  <div className="text-[10px] text-[#ff6b4a] font-semibold">
                    {activeWorkspace?.plan ?? "PRO"} WORKSPACE
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {switcherOpen && (
              <div className="absolute left-0 right-0 mt-2 z-40 rounded-2xl bg-[#141726] border border-white/15 shadow-2xl p-2 space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setSwitcherOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? "bg-[#ff6b4a]/20 text-white font-bold"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-400">{ws.plan}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCreateTeamOpen(true);
                    setSwitcherOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs text-[#ff6b4a] hover:bg-white/5 font-semibold flex items-center gap-2 cursor-pointer border-t border-white/10 pt-2.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Create a team</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary + New Website Button */}
          <div className="space-y-2">
            <button
              type="button"
              data-testid="new-website-btn"
              onClick={() =>
                onNewWebsiteClick ? onNewWebsiteClick() : setGetStartedOpen(true)
              }
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/20 hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Website</span>
            </button>

            <Link
              href="/remix"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
              <span>Start with AI (/remix)</span>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Workspace
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    active
                      ? "bg-[#ff6b4a]/15 text-[#ff6b4a] font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings & Admin Links */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Settings
            </div>
            {settingsItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    active
                      ? "bg-[#ff6b4a]/15 text-[#ff6b4a] font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/invitations"
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2.5 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Invitations & RBAC</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: user?.avatarColor ?? "#ff6b4a" }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            >
              {(user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name ?? "Creator"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email ?? ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
        {/* Top Workspace Bar with Notification Bell Popover (69_1_workspace_notification_bell_popover.png) */}
        <header className="h-14 border-b border-white/10 bg-[#0b0d16]/70 backdrop-blur-md px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="text-xs font-semibold text-slate-400">
            {activeWorkspace?.name ?? "PeachWorlds Workspace"}
          </div>
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              title="Notifications"
              data-testid="workspace-notifications-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a] absolute top-1.5 right-1.5" />
            </button>

            {notificationsOpen && (
              <div
                data-testid="workspace-notifications-popover"
                className="absolute right-0 top-12 w-80 rounded-2xl bg-[#141726] border border-white/15 shadow-2xl p-4 z-50 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white">Notifications</span>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-0.5">
                    <div className="font-semibold text-white">
                      {activeWorkspace?.name ?? "Workspace"} 3D Studio is ready
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Just now • PeachWorlds Cloud
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>

      {/* Create a Team Modal */}
      {createTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create a team</h3>
              <button
                type="button"
                onClick={() => setCreateTeamOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Collaborate on 3D websites, shared templates, and spatial feedback with your team.
            </p>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Acme Spatial Design"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateTeamOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Get Started! (+ New Website) Modal */}
      {getStartedOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-[#121422] border border-white/15 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold">Get Started!</h2>
              <button
                type="button"
                onClick={() => setGetStartedOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Choose how you want to create your new 3D website in PeachWorlds Studio.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/remix"
                onClick={() => setGetStartedOpen(false)}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#9333ea]/20 border border-[#ff6b4a]/40 hover:border-[#ff6b4a] transition flex flex-col justify-between"
              >
                <Sparkles className="w-7 h-7 text-[#ff6b4a] mb-4" />
                <div>
                  <div className="font-bold text-sm text-white mb-1">
                    Start with AI
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Generate a tailored 3D website in 5 guided steps.
                  </p>
                </div>
              </Link>

              <Link
                href="/templates"
                onClick={() => setGetStartedOpen(false)}
                className="p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex flex-col justify-between"
              >
                <LayoutTemplate className="w-7 h-7 text-purple-400 mb-4" />
                <div>
                  <div className="font-bold text-sm text-white mb-1">
                    Use a 3D Template
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Start from curated SaaS, AI, E-Commerce, or Agency scenes.
                  </p>
                </div>
              </Link>

              <button
                type="button"
                disabled={creatingBlank}
                onClick={() => void handleStartFromScratch()}
                className="p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex flex-col justify-between text-left cursor-pointer"
              >
                <Plus className="w-7 h-7 text-sky-400 mb-4" />
                <div>
                  <div className="font-bold text-sm text-white mb-1">
                    {creatingBlank ? "Creating..." : "Start from Scratch"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Open a fresh 3D WebGL + UI canvas in the Builder Studio.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
