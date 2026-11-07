import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onJumpTo: (targetProgress: number) => void;
  currentProgress: number;
  revealMode: 'hybrid' | 'spotlight' | 'wipe';
  onToggleRevealMode: () => void;
  onOpenTriggerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onJumpTo,
  currentProgress,
  revealMode,
  onToggleRevealMode,
  onOpenTriggerModal,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { label: 'WORK', target: 0.0 },
    { label: 'PROCESS', target: 1.35 },
    { label: 'STUDIO', target: 2.2 },
    { label: 'CONTACT', target: 3.3 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-auto">
      {/* Top-Left: Stylized "M" Geometric Crown SVG Path + "FULL WORKFLOW AUTOMATION FOR CREATIVE TEAMS" */}
      <button
        onClick={() => onJumpTo(0)}
        className="flex items-center gap-3.5 text-left focus:outline-none cursor-pointer group"
        aria-label="Inner Circle Home"
      >
        <svg
          width="28"
          height="24"
          viewBox="0 0 28 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white transition-transform duration-300 group-hover:scale-105"
        >
          <path
            d="M2.5 21V4.5L9.5 12.5L14 6.5L18.5 12.5L25.5 4.5V21"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>

        <div className="font-manrope text-[9.5px] sm:text-[10px] leading-[1.28] tracking-[0.18em] uppercase text-white/85 font-semibold">
          <div>FULL WORKFLOW</div>
          <div>AUTOMATION</div>
          <div>FOR CREATIVE TEAMS</div>
        </div>
      </button>

      {/* Top-Right: Outlined Pill Nav Buttons (WORK, PROCESS, STUDIO, CONTACT) */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-3"
      >
        {/* Interactive Reveal Mask Mode Toggle Pill */}
        <button
          onClick={onToggleRevealMode}
          className="border border-[#00D85F]/45 bg-[#00D85F]/10 text-[#00D85F] rounded-full px-4 py-2 text-[10px] tracking-[0.15em] font-manrope font-semibold uppercase hover:bg-[#00D85F] hover:text-black transition cursor-pointer"
          title="Switch between Scroll Mask Wipe & Cursor Spotlight Reveal"
        >
          MASK: {revealMode.toUpperCase()}
        </button>

        {navItems.map((item) => {
          const isActive =
            Math.abs(currentProgress - item.target) < 0.45 ||
            (item.label === 'CONTACT' && currentProgress > 2.75);
          return (
            <button
              key={item.label}
              onClick={() => onJumpTo(item.target)}
              className={`border rounded-full px-5 py-2 text-[11px] tracking-[0.15em] font-manrope uppercase transition cursor-pointer ${
                isActive
                  ? 'border-[#00D85F] bg-[#00D85F] text-black font-bold'
                  : 'border-white/25 text-white hover:bg-white hover:text-black'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
          className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="fixed inset-x-4 top-20 z-50 rounded-2xl bg-neutral-950/95 border border-white/20 p-5 flex flex-col gap-2.5 md:hidden backdrop-blur-xl">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setMobileOpen(false);
                onJumpTo(item.target);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl border border-white/15 text-xs tracking-[0.15em] font-manrope uppercase hover:bg-[#00D85F] hover:text-black transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenTriggerModal();
            }}
            className="w-full text-center px-4 py-2.5 rounded-xl bg-[#00D85F] text-black font-bold text-xs tracking-[0.15em] uppercase cursor-pointer"
          >
            LAUNCH PIPELINE
          </button>
        </div>
      )}
    </header>
  );
};
