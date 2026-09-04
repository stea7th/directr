// Compact inline icon set — stroke icons that inherit currentColor.

type Props = { size?: number; className?: string };

function Svg({ size = 16, className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconRevenue = (p: Props) => (
  <Svg {...p}><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Svg>
);
export const IconCart = (p: Props) => (
  <Svg {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /></Svg>
);
export const IconUsers = (p: Props) => (
  <Svg {...p}><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3.4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9" /><path d="M16.5 3.6a4 4 0 0 1 0 6.8" /></Svg>
);
export const IconPulse = (p: Props) => (
  <Svg {...p}><path d="M2 12h4l3-8 5 16 3-8h5" /></Svg>
);
export const IconBox = (p: Props) => (
  <Svg {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></Svg>
);
export const IconTarget = (p: Props) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></Svg>
);
export const IconSpark = (p: Props) => (
  <Svg {...p}><path d="M12 2.6 14.2 9 21 11.2 14.2 13.4 12 20l-2.2-6.6L3 11.2 9.8 9Z" /></Svg>
);
export const IconArrowUp = (p: Props) => (
  <Svg {...p}><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></Svg>
);
export const IconAlert = (p: Props) => (
  <Svg {...p}><path d="M12 9v4.5M12 17h.01" /><path d="M10.3 3.9 2.6 17.1A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" /></Svg>
);
export const IconCheck = (p: Props) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
);
export const IconClock = (p: Props) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></Svg>
);
export const IconTag = (p: Props) => (
  <Svg {...p}><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.8" cy="7.8" r="1.4" /></Svg>
);
export const IconGauge = (p: Props) => (
  <Svg {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M14.1 9.9 18 6M3.6 18a10 10 0 1 1 16.8 0" /></Svg>
);
export const IconRefresh = (p: Props) => (
  <Svg {...p}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></Svg>
);
export const IconStore = (p: Props) => (
  <Svg {...p}><path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12v8h14v-8" /></Svg>
);
export const IconSearch = (p: Props) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></Svg>
);
export const IconShield = (p: Props) => (
  <Svg {...p}><path d="M12 22s8-4 8-10V5.5L12 2 4 5.5V12c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></Svg>
);
export const IconBrush = (p: Props) => (
  <Svg {...p}><path d="M4 20.5 8.5 16" /><path d="M9.8 14.7 6.5 11.4a2 2 0 0 1 0-2.8l6.4-6.4a2 2 0 0 1 2.8 0l3.3 3.3a2 2 0 0 1 0 2.8l-6.4 6.4a2 2 0 0 1-2.8 0Z" /></Svg>
);
