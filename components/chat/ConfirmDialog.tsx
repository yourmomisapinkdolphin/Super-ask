"use client";

/**
 * In-app confirm dialog — replaces window.confirm so citizens never see a
 * browser chrome popup that breaks the brand surface.
 */

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Lang } from "@/lib/types";
import { T } from "@/lib/ui/theme";
import { UI } from "@/lib/ui/copy";

export function ConfirmDialog({
  lang,
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onClose,
}: {
  lang: Lang;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{ background: "rgba(16, 24, 40, 0.50)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-body"
        className="ag-fade w-full rounded-2xl p-5"
        style={{ maxWidth: 400, background: T.paper }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            id="confirm-dialog-title"
            style={{ fontSize: 15, fontWeight: 600, color: T.ink }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{ color: T.inkFaint }}
            aria-label={UI.cancel[lang]}
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <p
          id="confirm-dialog-body"
          className="km"
          style={{ fontSize: 13, color: T.inkSoft, marginTop: 10, lineHeight: 1.55 }}
        >
          {body}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2"
            style={{
              fontSize: 13,
              color: T.inkSoft,
              border: `1px solid ${T.line}`,
            }}
          >
            {UI.cancel[lang]}
          </button>
          <button
            ref={confirmRef}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg px-3.5 py-2"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              background: destructive ? "#B42318" : T.deep,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
