"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Lab {
  id: number;
  title: string;
  url: string;
  isDone: boolean;
  isError: boolean;
}

interface User {
  profileUrl: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profileInput, setProfileInput] = useState("");
  const [labs, setLabs] = useState<Lab[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "pending" | "error">("all");
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check authentication session
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        fetchLabs();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/labs");
      const data = await res.json();
      if (data.labs) {
        setLabs(data.labs);
      }
    } catch (err) {
      console.error("Error fetching labs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInput.trim()) return;

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: profileInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        // Refresh labs list
        fetchLabs();
      } else {
        alert(data.error || "Gagal masuk. Pastikan URL profile valid.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setUser(null);
      setLabs([]);
      setProfileInput("");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Remove manual handleToggle


  const handleErrorToggle = async (id: number, currentStatus: boolean, title: string) => {
    const actionText = currentStatus ? "NORMAL" : "ERROR";
    const confirmed = window.confirm(`Apakah Anda yakin ingin menandai "${title}" sebagai ${actionText}?`);
    if (!confirmed) return;

    try {
      setLabs((prev) =>
        prev.map((lab) => (lab.id === id ? { ...lab, isError: !currentStatus } : lab))
      );

      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isError: !currentStatus }),
      });

      if (!res.ok) {
        setLabs((prev) =>
          prev.map((lab) => (lab.id === id ? { ...lab, isError: currentStatus } : lab))
        );
      }
    } catch (err) {
      console.error("Error toggling lab error status:", err);
    }
  };

  const handleSyncProfile = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync-profile", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Sinkronisasi selesai! ${data.count} badge ditemukan.`);
        fetchLabs();
      } else {
        alert("Sync error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error syncing profile:", err);
      alert("Gagal sync dari profile.");
    } finally {
      setSyncing(false);
    }
  };

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch = lab.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "done") return matchesSearch && lab.isDone;
    if (filter === "pending") return matchesSearch && !lab.isDone && !lab.isError;
    if (filter === "error") return matchesSearch && lab.isError;
    return matchesSearch;
  });

  const doneCount = labs.filter((l) => l.isDone).length;
  const errorCount = labs.filter((l) => l.isError).length;
  const totalCount = labs.length;
  const progressPercent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  // Render Login / Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-zinc-900">
        <Card className="max-w-md w-full bg-white border-zinc-200 shadow-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Masuk ke GSA Tracker</h2>
            <p className="text-sm text-zinc-500">
              Masukkan Link Public Profile Google Cloud Skills Boost Anda untuk mulai mengelola lab.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="profileUrl" className="text-xs font-semibold text-zinc-600">
                Link Public Profile URL
              </label>
              <Input
                id="profileUrl"
                type="url"
                placeholder="https://www.skills.google/public_profiles/..."
                value={profileInput}
                onChange={(e) => setProfileInput(e.target.value)}
                required
                className="bg-white border-zinc-200 placeholder:text-zinc-400 text-zinc-800 text-xs py-5"
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs py-5 font-semibold transition-colors"
            >
              {loginLoading ? "Memvalidasi..." : "Masuk ke Dashboard"}
            </Button>
          </form>
          <div className="text-xs text-zinc-450 border-t border-zinc-100 pt-4 text-center">
            Mendaftar gratis menggunakan link profil unik Anda.
          </div>
        </Card>
      </div>
    );
  }

  // Render Dashboard Page
  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 text-zinc-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-6 bg-white p-6 rounded-xl shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Google Cloud Skill Boost Tracker</h1>
            <p className="text-xs text-zinc-500 break-all font-mono bg-zinc-50 px-2 py-1 rounded border border-zinc-100 inline-block max-w-full">
              Profil: {user.profileUrl}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleSyncProfile}
              disabled={syncing}
              className="bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100 text-xs px-3"
            >
              {syncing ? "Mensinkronisasi..." : "Sync dari Profile"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-650 hover:bg-zinc-100 text-xs px-3"
            >
              Keluar
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-medium text-xs">Total Lab</CardDescription>
              <CardTitle className="text-4xl font-extrabold text-zinc-950">{totalCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-medium text-xs">Selesai</CardDescription>
              <CardTitle className="text-4xl font-extrabold text-green-600">{doneCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-medium text-xs">Error</CardDescription>
              <CardTitle className="text-4xl font-extrabold text-red-500">{errorCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 font-medium text-xs">Progress</CardDescription>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-zinc-700">{progressPercent}% selesai</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and List */}
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama lab..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border-zinc-200 placeholder:text-zinc-400 text-zinc-800"
                />
              </div>
              <div className="flex gap-1 border border-zinc-200 rounded-lg p-1 bg-zinc-50">
                <Button
                  variant={filter === "all" ? "secondary" : "ghost"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  className="text-xs px-3 h-8"
                >
                  Semua
                </Button>
                <Button
                  variant={filter === "done" ? "secondary" : "ghost"}
                  onClick={() => setFilter("done")}
                  size="sm"
                  className="text-xs px-3 h-8"
                >
                  Selesai
                </Button>
                <Button
                  variant={filter === "pending" ? "secondary" : "ghost"}
                  onClick={() => setFilter("pending")}
                  size="sm"
                  className="text-xs px-3 h-8"
                >
                  Belum
                </Button>
                <Button
                  variant={filter === "error" ? "secondary" : "ghost"}
                  onClick={() => setFilter("error")}
                  size="sm"
                  className="text-xs px-3 h-8"
                >
                  Error
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-20 text-center text-zinc-500">Memuat data...</div>
            ) : filteredLabs.length === 0 ? (
              <div className="py-20 text-center text-zinc-400">Tidak ada lab yang sesuai dengan kriteria.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className={`py-4 flex items-start justify-between gap-4 transition-colors px-2 rounded-md ${
                      lab.isError
                        ? "bg-red-50 hover:bg-red-100/60 border-l-4 border-red-400"
                        : "hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="space-y-1">
                        <div
                          className={`text-sm font-semibold break-words leading-tight ${
                            lab.isError
                              ? "text-red-700"
                              : lab.isDone
                              ? "line-through text-zinc-400"
                              : "text-zinc-800"
                          }`}
                        >
                          {lab.title}
                        </div>
                        {lab.url && (
                          <div className="text-xs">
                            <a
                              href={lab.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Buka link template / course
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lab.isError ? (
                        <button
                          onClick={() => handleErrorToggle(lab.id, lab.isError, lab.title)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs px-2.5 py-1.5 rounded-full border border-red-200 transition-colors cursor-pointer"
                          title="Klik untuk hapus tanda error"
                        >
                          ⚠ Error
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleErrorToggle(lab.id, lab.isError, lab.title)}
                            className="bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs px-2 py-0.5 rounded transition-colors cursor-pointer"
                            title="Tandai sebagai error"
                          >
                            ⚠
                          </button>
                          {lab.isDone ? (
                            <Badge className="bg-green-100 hover:bg-green-100 text-green-800 font-semibold shadow-none border-none">
                              Done
                            </Badge>
                          ) : (
                            <Badge className="bg-zinc-100 hover:bg-zinc-100 text-zinc-600 font-semibold shadow-none border-none">
                              Belum
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
