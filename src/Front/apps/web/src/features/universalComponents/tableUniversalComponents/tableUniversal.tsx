"use client";

import React from "react";
import styles from "./tableUniversal.module.css";

type Accessor<T> = keyof T | ((item: T) => React.ReactNode);

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: Accessor<T>;
  width?: string;
  align?: "left" | "center" | "right";
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowKey?: (item: T) => string | number;
  className?: string;
  actions?: (item: T) => React.ReactNode;
};

function renderCell<T>(item: T, accessor?: Accessor<T>) {
  if (!accessor) return null;
  if (typeof accessor === "function") return accessor(item);

  // accessor es clave de T; convertimos a string para indexar de forma segura
  const key = String(accessor as keyof T);
  const value = (item as Record<string, unknown>)[key];

  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
}

export default function TableUniversal<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay elementos.",
  onRowClick,
  rowKey,
  className,
  actions,
}: Props<T>) {
  return (
    <div className={`${styles.wrapper} ${className ?? ""}`}>
      <table className={styles.table} role="table" aria-busy={loading}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={styles.th}
                style={{ width: col.width ?? "auto", textAlign: col.align ?? "left" }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
            {actions && <th className={styles.th} scope="col" style={{ width: 120 }}>Actions</th>}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {loading ? (
            <tr className={styles.row}>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.loadingCell}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className={styles.row}>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const idVal = (item as Record<string, unknown>)["id"];
              const fallbackKey = typeof idVal === "string" || typeof idVal === "number" ? idVal : idx;
              const key = rowKey ? rowKey(item) : fallbackKey;
              return (
                <tr
                  key={String(key)}
                  className={styles.row}
                  onClick={() => onRowClick?.(item)}
                  role={onRowClick ? "button" : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={styles.td}
                      style={{ textAlign: col.align ?? "left" }}
                    >
                      {renderCell(item, col.accessor)}
                    </td>
                  ))}

                  {actions && <td className={styles.td}>{actions(item)}</td>}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}