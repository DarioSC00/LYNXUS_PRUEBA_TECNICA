"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./detailUniversal.module.css";

type Props<T = unknown> = {
  open: boolean;
  onClose: () => void;
  title?: string;
  data?: T | null;
  /**
   * Si se provee `render`, se usa para renderizar `data`.
   * Si no, se muestra `children`. Si no hay nada, muestra mensaje vacío.
   */
  render?: (data: T | null) => React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export default function DetalModal<T = unknown>({
  open,
  onClose,
  title,
  data = null,
  render,
  children,
  className,
}: Props<T>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof window === "undefined") return null;
  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <div
        aria-hidden
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Detail"}
        className={`${styles.container} ${className ?? ""}`}
        style={{ position: "relative", margin: "4vh auto", zIndex: 10000 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          {title ? <h3 style={{ margin: 0 }}>{title}</h3> : <div />}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {render ? (
            render(data)
          ) : children ? (
            <>{children}</>
          ) : data ? (
            Object.keys(data as Record<string, unknown>).map((k) => (
              <div key={k} className={styles.row}>
                <div className={styles.key}>{k}</div>
                <div className={styles.value}>{String((data as Record<string, unknown>)[k] ?? "")}</div>
              </div>
            ))
          ) : (
            <p className={styles.meta}>No data to display</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}