const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Erro na requisição");
  }
  return data as T;
}

export type UserRole = "participante" | "admin";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isStudent: boolean;
  period: string;
  course: string;
  interests: string[];
  xp: number;
  rank: string;
  rankColor: string;
  rankIcon: string;
  rankProgressPct: number;
  nextRankXp: number | null;
  qrPayload: string;
  stats?: { presences: number; connections: number };
}

export interface ApiActivity {
  id: string;
  name: string;
  type: string;
  points: number;
  qrPayload: string;
}

export interface LeaderboardEntry {
  position: number;
  id: string;
  name: string;
  course: string;
  period: string;
  xp: number;
  rank: string;
  rankColor: string;
  rankIcon: string;
}

export const api = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    isStudent: boolean;
    period?: string;
    course: string;
    interests: string[];
  }) => request<ApiUser>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<ApiUser>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),

  me: () => request<ApiUser>("/auth/me"),

  getUser: (id: string) => request<ApiUser>(`/users/${id}`),

  getLeaderboard: (limit = 50) => request<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`),

  listActivities: () => request<ApiActivity[]>("/activities"),

  createActivity: (payload: { name: string; type: string; points?: number }) =>
    request<ApiActivity>("/activities", { method: "POST", body: JSON.stringify(payload) }),

  scanPresence: (payload: { activityId: string }) =>
    request<{ message: string; pointsEarned: number; user: ApiUser }>("/scan/presence", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  scanNetwork: (payload: { scannedId: string }) =>
    request<{
      message: string;
      pointsEarned: number;
      bonusReason: string[];
      connectedWith: { id: string; name: string };
      user: ApiUser;
    }>("/scan/network", { method: "POST", body: JSON.stringify(payload) }),
};
