"use client";

import React from "react";
import styles from "./paginationUniversal.module.css";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function PaginationUniversal({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  // No mostrar paginación si solo hay una página o menos
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  // Generar array de números de página a mostrar
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Máximo de páginas visibles

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      if (currentPage <= 3) {
        // Inicio: 1 2 3 4 ... last
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: 1 ... n-3 n-2 n-1 n
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Medio: 1 ... current-1 current current+1 ... last
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calcular rango de items mostrados
  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems && pageSize 
    ? Math.min(currentPage * pageSize, totalItems) 
    : null;

  return (
    <div className={styles.paginationContainer}>
      {/* Info de items */}
      {totalItems !== undefined && startItem && endItem && (
        <div className={styles.paginationInfo}>
          Showing <span className={styles.highlight}>{startItem}</span> to{" "}
          <span className={styles.highlight}>{endItem}</span> of{" "}
          <span className={styles.highlight}>{totalItems}</span> results
        </div>
      )}

      {/* Controles de paginación */}
      <div className={styles.paginationControls}>
        {/* Botón Previous */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || disabled}
          className={styles.paginationButton}
          aria-label="Previous page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className={styles.buttonText}>Previous</span>
        </button>

        {/* Números de página */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                disabled={disabled}
                className={`${styles.pageNumber} ${isActive ? styles.pageNumberActive : ""}`}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Botón Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || disabled}
          className={styles.paginationButton}
          aria-label="Next page"
        >
          <span className={styles.buttonText}>Next</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
