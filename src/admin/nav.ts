export type AdminNavItem = { href: string; label: string; icon: string; minRole?: "EDITOR" | "OWNER"; badgeKey?: "orders" | "enquiries" | "subscriptions" };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "home" }] },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "bag", badgeKey: "orders" },
      { href: "/admin/c/customers", label: "Customers", icon: "users" },
      { href: "/admin/c/subscriptions", label: "Subscriptions", icon: "repeat", badgeKey: "subscriptions" },
      { href: "/admin/c/enquiries", label: "Enquiries", icon: "inbox", badgeKey: "enquiries" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/c/flavours", label: "Flavours", icon: "bottle" },
      { href: "/admin/c/packs", label: "Packs & combos", icon: "box" },
      { href: "/admin/c/discounts", label: "Discount codes", icon: "tag" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/pages", label: "Pages", icon: "layout" },
      { href: "/admin/navigation", label: "Menus", icon: "menu" },
      { href: "/admin/media", label: "Media library", icon: "image" },
      { href: "/admin/settings", label: "Site settings", icon: "settings", minRole: "OWNER" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/c/journal", label: "Journal", icon: "pen" },
      { href: "/admin/c/events", label: "Events", icon: "calendar" },
      { href: "/admin/c/stockists", label: "Stockists", icon: "pin" },
      { href: "/admin/c/faqs", label: "FAQs", icon: "help" },
      { href: "/admin/c/testimonials", label: "Testimonials", icon: "quote" },
      { href: "/admin/c/gallery", label: "Gallery", icon: "grid" },
      { href: "/admin/c/team", label: "Team", icon: "smile" },
      { href: "/admin/c/milestones", label: "Milestones", icon: "flag" },
      { href: "/admin/c/legal", label: "Legal pages", icon: "file" },
      { href: "/admin/c/categories", label: "Journal categories", icon: "folder" },
    ],
  },
  {
    label: "Audience & team",
    items: [
      { href: "/admin/c/newsletter", label: "Newsletter", icon: "mail" },
      { href: "/admin/users", label: "Users & roles", icon: "shield", minRole: "OWNER" },
      { href: "/admin/activity", label: "Activity log", icon: "clock" },
    ],
  },
];
