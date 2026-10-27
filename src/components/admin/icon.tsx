import {
  Bell, Box, Calendar, Clock, File, Flag, Folder, Grid3x3, HelpCircle, Home, Image, Inbox, Layout, Mail, Menu, MapPin, PenLine, Quote, Repeat, Settings, Shield, ShoppingBag, Smile, Tag, Users, Wine, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  home: Home, bag: ShoppingBag, users: Users, repeat: Repeat, inbox: Inbox, bottle: Wine, box: Box, tag: Tag, layout: Layout, menu: Menu, image: Image,
  settings: Settings, pen: PenLine, calendar: Calendar, pin: MapPin, help: HelpCircle, quote: Quote, grid: Grid3x3, smile: Smile, flag: Flag, file: File,
  folder: Folder, mail: Mail, shield: Shield, clock: Clock, bell: Bell,
};

export function AIcon({ name, className }: { name: string; className?: string }) {
  const I = icons[name] ?? File;
  return <I className={className ?? "size-4"} strokeWidth={1.75} aria-hidden />;
}
