export type ActivityType = "palestra" | "workshop" | "mesa_redonda" | "keynote" | "oficina";

export interface User {
  id: string;
  name: string;
  period: string; // periodo/semestre, ex: "5o periodo"
  course: string; // curso
  interests: string[]; // areas de interesse tecnologico
  xp: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  points: number;
  createdAt: string;
}

export interface PresenceScan {
  id: string;
  userId: string;
  activityId: string;
  points: number;
  createdAt: string;
}

export interface Connection {
  id: string;
  userAId: string;
  userBId: string;
  points: number;
  bonusReason: string[];
  createdAt: string;
}

export interface DB {
  users: User[];
  activities: Activity[];
  presenceScans: PresenceScan[];
  connections: Connection[];
}

export const DEFAULT_POINTS: Record<ActivityType, number> = {
  palestra: 20,
  workshop: 30,
  mesa_redonda: 25,
  keynote: 50,
  oficina: 30,
};
