import { Bottle } from "@/components/brand/bottle";
import { cn } from "@/lib/utils";

/** Decorative illustrations used when a block has no photo. All aria-hidden. */

export function HillsArt({ className, tones = ["var(--sky)", "#8FA67C", "#2E5240", "var(--forest)"], softFirst = true }: { className?: string; tones?: string[]; softFirst?: boolean }) {
  return (
    <svg viewBox="0 0 1200 600" preserveAspectRatio="none" className={cn("w-full", className)} aria-hidden>
      {tones.map((c, i) => {
        const base = 230 + i * 85;
        const amp = 90 - i * 14;
        return <path key={i} d={`M0 ${base} C 240 ${base - amp}, 420 ${base + amp * 0.4}, 660 ${base - amp * 0.6} S 1020 ${base - amp}, 1200 ${base - amp * 0.2} V 600 H 0 Z`} fill={c} opacity={i === 0 && softFirst ? 0.55 : 1} />;
      })}
    </svg>
  );
}

export function LeafArt({ className, color = "#8FA67C" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={cn(className)} aria-hidden>
      <path d="M8 104C50 30 128 6 194 18C150 82 84 118 8 104z" fill={color} />
      <path d="M8 104C70 74 130 44 194 18" stroke="var(--cream)" strokeWidth="2" opacity=".55" fill="none" />
      {[0.3, 0.5, 0.7].map((t) => (
        <path key={t} d={`M${8 + 186 * t} ${104 - 86 * t}l${-14 + t * 4} ${-22 + t * 10}`} stroke="var(--cream)" strokeWidth="1.4" opacity=".4" />
      ))}
    </svg>
  );
}

export function BubblesArt({ className, color = "currentColor" }: { className?: string; color?: string }) {
  const dots = [[20, 80, 14], [60, 30, 8], [110, 70, 20], [150, 20, 6], [180, 90, 10], [90, 120, 5], [200, 50, 16], [40, 140, 9]];
  return (
    <svg viewBox="0 0 230 170" className={cn(className)} aria-hidden>
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="2" opacity={0.35 + (i % 3) * 0.2} />
      ))}
    </svg>
  );
}

export function JarArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 380" className={cn(className)} aria-hidden>
      <rect x="60" y="20" width="180" height="34" rx="12" fill="var(--forest)" />
      <rect x="70" y="50" width="160" height="300" rx="38" fill="#fff" fillOpacity=".4" stroke="var(--ink)" strokeWidth="3" />
      <rect x="78" y="150" width="144" height="192" rx="30" fill="#C98A3D" opacity=".88" />
      <ellipse cx="150" cy="156" rx="70" ry="12" fill="#EAD7B4" stroke="#B9935C" strokeWidth="2" />
      {[[110, 250, 5], [170, 290, 4], [140, 210, 3], [190, 230, 6], [120, 310, 3]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="var(--cream)" strokeWidth="1.6" />
      ))}
    </svg>
  );
}

export function CrateArt({ className }: { className?: string }) {
  const colors = ["#C98A3D", "#8FA67C", "#E9C53F", "#F0A62E"];
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="flex items-end justify-center gap-1">
        {colors.map((c, i) => (
          <Bottle key={c} color={c} label={["Classic", "Bay Leaf", "Ginger", "Pineapple"][i]} className="w-1/5" />
        ))}
      </div>
      <div className="-mt-[18%] mx-auto h-[38%] w-[96%] rounded-lg bg-[#8a5a32] shadow-[inset_0_-10px_0_rgba(0,0,0,.15)]" />
    </div>
  );
}

export function BottleTrio({ className, colors = ["#8FA67C", "#C98A3D", "#E9C53F"], labels = ["Bay Leaf", "Classic", "Ginger"] }: { className?: string; colors?: string[]; labels?: string[] }) {
  return (
    <div className={cn("flex items-end justify-center", className)} aria-hidden>
      <Bottle color={colors[0]} label={labels[0]} className="w-[30%] -rotate-6 translate-y-[4%]" />
      <Bottle color={colors[1]} label={labels[1]} className="z-10 -mx-[4%] w-[36%]" />
      <Bottle color={colors[2]} label={labels[2]} className="w-[30%] rotate-6 translate-y-[4%]" />
    </div>
  );
}
