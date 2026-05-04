"use client";

interface AuroraProps {
  size?: "sm" | "md" | "lg" | "full";
  blendMode?: "normal" | "screen" | "overlay";
  className?: string;
}

export function Aurora({ size = "lg", blendMode = "screen", className = "" }: AuroraProps) {
  const sizeMap = {
    sm: "w-[500px] h-[500px]",
    md: "w-[800px] h-[800px]",
    lg: "w-[1200px] h-[1200px]",
    full: "w-full h-full",
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className={`absolute -top-1/2 left-1/4 ${sizeMap[size]} rounded-full bg-[#6D28D9]/30 blur-[120px]`}
        style={{ mixBlendMode: blendMode }}
      />
      <div
        className={`absolute -bottom-1/2 right-1/4 ${sizeMap[size]} rounded-full bg-[#06B6D4]/20 blur-[120px]`}
        style={{ mixBlendMode: blendMode }}
      />
      <div
        className={`absolute top-1/3 right-1/3 ${sizeMap[size === "full" ? "md" : "sm"]} rounded-full bg-[#F59E0B]/10 blur-[100px]`}
        style={{ mixBlendMode: blendMode }}
      />
    </div>
  );
}
