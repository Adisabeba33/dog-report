import React from "react";

type P = React.SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconToday = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M8 3v4M16 3v4M4 11h16" />
    <circle cx="12" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IconSchedule = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="8" cy="6" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="10" cy="18" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const IconClients = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.2 5.2 0 0 0-2.3-4.3" />
  </svg>
);
export const IconDog = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 5.5 7 4v3.2C5.2 8 4 9.7 4 11.8V18a2 2 0 0 0 2 2h1.5" />
    <path d="M14 5.5 17 4v3.2c1.8.8 3 2.5 3 4.6V18a2 2 0 0 1-2 2h-1.5" />
    <path d="M9 20v-3.5a3 3 0 0 1 6 0V20" />
    <circle cx="9.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const IconReport = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 13h7M8.5 16.5h5" />
  </svg>
);
export const IconSettings = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 5.5v13l11-6.5z" fill="currentColor" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12.5 10 17 19 7" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v12M8 7l4-4 4 4" />
    <path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" />
  </svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v12M8 11l4 4 4-4" />
    <path d="M5 20h14" />
  </svg>
);
export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h3l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5V21a1 1 0 0 1-1 1A16 16 0 0 1 4 6a1 1 0 0 1 1-1z" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const IconFilter = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h11M4 12h16M4 17h8" />
    <circle cx="17" cy="7" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="14" cy="17" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);
export const IconCalendarSmall = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="16" height="15" rx="2.5" />
    <path d="M4 9h16M8 3v4M16 3v4" />
  </svg>
);
export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
);
export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5 17.5 10.5" />
  </svg>
);
export const IconCopyWeek = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="12" height="12" rx="2" />
    <path d="M8 5V3.5A1.5 1.5 0 0 1 9.5 2h9A1.5 1.5 0 0 1 20 3.5v9a1.5 1.5 0 0 1-1.5 1.5H17" />
  </svg>
);
export const IconRepeat = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8a5 5 0 0 1 5-5h7l-2-2M20 16a5 5 0 0 1-5 5H8l2 2" />
    <path d="M16 3l2 2-2 2M8 21l-2-2 2-2" />
  </svg>
);
export const IconPaw = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="16" rx="4" ry="3" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="11" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="11" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
