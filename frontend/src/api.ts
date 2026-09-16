const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Erro na requisição");
  }
  return data as T;
}

export interface ApiUser {
  id: string;
  name: string;
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
  createUser: (payload: { name: string; period: string; course: string; interests: string[] }) =>
    request<ApiUser>("/users", { method: "POST", body: JSON.stringify(payload) }),

  getUser: (id: string) => request<ApiUser>(`/users/${id}`),

  getLeaderboard: (limit = 50) => request<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`),

  listActivities: () => request<ApiActivity[]>("/activities"),

  createActivity: (payload: { name: string; type: string; points?: number }) =>
    request<ApiActivity>("/activities", { method: "POST", body: JSON.stringify(payload) }),

  scanPresence: (payload: { userId: string; activityId: string }) =>
    request<{ message: string; pointsEarned: number; user: ApiUser }>("/scan/presence", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  scanNetwork: (payload: { scannerId: string; scannedId: string }) =>
    request<{
      message: string;
      pointsEarned: number;
      bonusReason: string[];
      connectedWith: { id: string; name: string };
      user: ApiUser;
    }>("/scan/network", { method: "POST", body: JSON.stringify(payload) }),
};

const STORAGE_KEY = "itworks_user_id";

export function getStoredUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeUserId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function clearStoredUserId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
