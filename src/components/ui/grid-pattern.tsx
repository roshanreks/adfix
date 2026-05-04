interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number | string;
  className?: string;
  squares?: [number, number][];
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  className = "",
  squares,
}: GridPatternProps) {
  return (
    <svg
      fill="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern id="grid" x={x} y={y} width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray={String(strokeDasharray)} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      {squares?.map(([sqX, sqY]) => (
        <rect
          key={`${sqX}-${sqY}`}
          x={sqX * width}
          y={sqY * height}
          width={width}
          height={height}
          fill="currentColor"
          className="opacity-[0.03]"
        />
      ))}
    </svg>
  );
}
