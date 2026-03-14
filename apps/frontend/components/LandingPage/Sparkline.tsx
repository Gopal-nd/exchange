export default function Sparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  if (!data?.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 30 - ((v - min) / (max - min || 1)) * 30;
      return `${x},${y}`;
    })
    .join(" ");


  return (
    <svg width="120" height="30" viewBox="0 0 120 30">
      <polyline
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}
