import { Award, Calendar, Clock, Droplet, FlaskConical, Gift, GlassWater, Heart, Leaf, Mountain, Recycle, Shield, Sparkles, Sprout, Store, Sun, Thermometer, Truck, Users, type LucideIcon } from "lucide-react";
import type { IconName } from "./definitions";

function Bubbles(props: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.6} className={props.className} aria-hidden>
      <circle cx="8" cy="15" r="4" /><circle cx="16" cy="8" r="3" /><circle cx="17" cy="17" r="2" /><circle cx="9" cy="6" r="1.4" />
    </svg>
  );
}

const map: Record<IconName, LucideIcon | typeof Bubbles> = {
  leaf: Leaf, sprout: Sprout, bubbles: Bubbles, heart: Heart, shield: Shield, sun: Sun, mountain: Mountain, recycle: Recycle, truck: Truck, gift: Gift,
  sparkles: Sparkles, droplet: Droplet, clock: Clock, flask: FlaskConical, users: Users, store: Store, calendar: Calendar, thermometer: Thermometer, glass: GlassWater, award: Award,
};

export function BlockIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name as IconName] ?? Leaf;
  return <Icon className={className} strokeWidth={1.6} aria-hidden />;
}
