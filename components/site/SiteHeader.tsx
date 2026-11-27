"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SuperAskLogo } from "./SuperAskLogo";
import { MARKETING, t, type Lang } from "@/lib/ui/marketing";
import { NAV } from "@/lib/ui/landing";

const GRADIENT = "linear-gradient(135deg,#4F3FA8,#6D5BD0)";

/** Cambodian flag, drawn inline because flag emoji do not render on Windows. */
function FlagKH() {
  return (
    <svg viewBox="0 0 60 40" width={24} height={16} aria-hidden>
      <rect width="60" height="40" fill="#032EA1" />
      <rect y="10" width="60" height="20" fill="#E00025" />
      <g fill="#fff">
        <path d="M17 27h26v-2H17z" />
        <path d="M19 25h22v-3H19z" />
        <path d="M27.5 22v-5l2.5-5 2.5 5v5z" />
        <path d="M20.5 22v-3.5l2-4 2 4V22z" />
        <path d="M35.5 22v-3.5l2-4 2 4V22z" />
      </g>
    </svg>
  );
}

/** UK flag, for English. */
function FlagUK() {
  const clip = useId();
  return (
    <svg viewBox="0 0 60 30" width={24} height={16} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <clipPath id={clip}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${clip})`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

/** Language switch: Cambodian flag for Khmer, UK flag for English. The active one is ringed. */
export function LangToggle({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}) {
  const item = (value: Lang, label: string, flag: React.ReactNode) => {
    const active = lang === value;
    return (
      <button
        type="button"
        onClick={() => onLangChange(value)}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className="block overflow-hidden rounded-[3px] transition-opacity hover:opacity-100"
        style={{
          opacity: active ? 1 : 0.5,
          boxShadow: active ? "0 0 0 2px #fff, 0 0 0 3.5px #4F3FA8" : "0 0 0 1px rgba(16,24,40,0.12)",
          lineHeight: 0,
        }}
      >
        {flag}
      </button>
    );
  };
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label="Language">
      {item("km", "ភាសាខ្មែរ", <FlagKH />)}
      {item("en", "English", <FlagUK />)}
    </div>
  );
}

export function SiteHeader({
  lang,
  onLangChange,
  variant = "default",
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  variant?: "default" | "auth";
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-lg"
      style={{
        background: "rgba(255,255,255,0.94)",
        borderBottom: "1px solid rgba(208,213,221,0.35)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <SuperAskLogo size="md" />

        <div className="hidden items-center gap-7 md:flex">
          {NAV.links.map((l) => (
            <Link
              key={l.id}
              href={`/#${l.id}`}
              className="transition-colors hover:text-[#4F3FA8]"
              style={{ color: "#4A5565", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}
            >
              {l.label[lang]}
            </Link>
          ))}

          <LangToggle lang={lang} onLangChange={onLangChange} />

          <div className="flex items-center gap-3">
            {variant === "default" && (
              <Link
                href="/login"
                className="transition-colors hover:text-[#4F3FA8]"
                style={{ color: "#4A5565", fontSize: 13, fontWeight: 500 }}
              >
                {t(MARKETING.login, lang)}
              </Link>
            )}
            <Link
              href="/chat"
              className="ag-press whitespace-nowrap rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: GRADIENT, fontSize: 13, padding: "9px 20px" }}
            >
              {NAV.askNow[lang]}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded p-1 md:hidden"
          aria-label={NAV.menu[lang]}
          aria-expanded={open}
          style={{ color: "#101828" }}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="bg-white px-6 pb-5 pt-3 md:hidden" style={{ borderTop: "1px solid #F0F0F0" }}>
          {NAV.links.map((l) => (
            <Link
              key={l.id}
              href={`/#${l.id}`}
              onClick={() => setOpen(false)}
              className="block py-2.5"
              style={{ color: "#4A5565", fontSize: 15, fontWeight: 500, borderBottom: "1px solid #F5F5F5" }}
            >
              {l.label[lang]}
            </Link>
          ))}
          {variant === "default" && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block py-2.5"
              style={{ color: "#4A5565", fontSize: 15, fontWeight: 500, borderBottom: "1px solid #F5F5F5" }}
            >
              {t(MARKETING.login, lang)}
            </Link>
          )}
          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="inline-block rounded-lg font-semibold text-white"
              style={{ background: GRADIENT, fontSize: 14, padding: "10px 24px" }}
            >
              {NAV.askNow[lang]}
            </Link>
            <LangToggle lang={lang} onLangChange={onLangChange} />
          </div>
        </div>
      )}
    </nav>
  );
}
