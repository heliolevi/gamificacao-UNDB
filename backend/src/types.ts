export type ActivityType = "palestra" | "workshop" | "mesa_redonda" | "keynote" | "oficina";

export const DEFAULT_POINTS: Record<ActivityType, number> = {
  palestra: 20,
  workshop: 30,
  mesa_redonda: 25,
  keynote: 50,
  oficina: 30,
};
