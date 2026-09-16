interface Props {
  rank: string;
  color?: string;
  icon?: string;
}

export function RankBadge({ rank, color = "#4ee1ff", icon = "⚡" }: Props) {
  return (
    <span
      className="rank-badge"
      style={{
        color,
        borderColor: color,
        boxShadow: `0 0 14px ${color}55`,
      }}
    >
      <span>{icon}</span> {rank}
    </span>
  );
}
