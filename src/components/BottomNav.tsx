"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconToday,
  IconSchedule,
  IconClients,
  IconDog,
  IconReport,
} from "./icons";

const TABS = [
  { href: "/today", label: "Today", Icon: IconToday },
  { href: "/schedule", label: "Week", Icon: IconSchedule },
  { href: "/clients", label: "Clients", Icon: IconClients },
  { href: "/dogs", label: "Dogs", Icon: IconDog },
  { href: "/reports", label: "Reports", Icon: IconReport },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-beige bg-warmwhite/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-charcoal" : "text-muted"
              }`}
            >
              <span
                className={`flex items-center justify-center h-7 w-12 rounded-full transition-colors ${
                  active ? "bg-sage/25" : ""
                }`}
              >
                <Icon width={22} height={22} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
