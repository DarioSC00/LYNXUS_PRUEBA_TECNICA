"use client";

import React, { useState } from "react";
import DetalModal from "../detailUniversalComponents/detailModal";
import styles from "./createUniversalModal.module.css";

type GenericRecord = Record<string, unknown>;

type Props<T extends GenericRecord = GenericRecord> = {
  open: boolean;
  onClose: () => void;
  title?: string;
  submitLabel?: string;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<unknown> | unknown;
  /**
   * renderForm receives (values, setValues, submitting)
   * and must return the form controls (inputs, selects, etc).
   */
  renderForm: (args: {
    values: T;
    setValues: React.Dispatch<React.SetStateAction<T>>;
    submitting: boolean;
  }) => React.ReactNode;
  className?: string;
};

export default function CreateUniversalModal<T extends GenericRecord = GenericRecord>({
  open,
  onClose,
  title,
  submitLabel = "Create",
  initialValues,
  onSubmit,
  renderForm,
  className,
}: Props<T>) {
  const [values, setValues] = useState<T>(() => (initialValues ? ({ ...(initialValues as T) } as T) : ({} as T)));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset cuando se abre/cierra
  React.useEffect(() => {
    if (open) {
      setValues(initialValues ? ({ ...(initialValues as T) } as T) : ({} as T));
      setError(null);
      setSubmitting(false);
    }
  }, [open, initialValues]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values as T);
      setSubmitting(false);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Creation error.");
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <DetalModal open={open} onClose={onClose} title={title ?? submitLabel}>
      <form
        className={`${styles.form} ${className ?? ""}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.body}>
          {renderForm({ values: values as T, setValues: setValues as React.Dispatch<React.SetStateAction<T>>, submitting })}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? "Creating…" : submitLabel}
          </button>
        </div>
      </form>
    </DetalModal>
  );
}