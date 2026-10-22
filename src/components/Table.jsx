import React from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Button from "./Button";

export default function Table({
  columns = [],
  data = [],
  keyField = "id",
  sortField,
  sortDirection = "asc",
  onSort,
  currentPage = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  emptyMessage = "No records found",
  emptyIcon = null,
  loading = false,
}) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSortable = !!col.sortable;
              const isCurrentSort = sortField === col.accessor;

              return (
                <th
                  key={col.header}
                  style={{
                    cursor: isSortable ? "pointer" : "default",
                    userSelect: "none",
                    ...col.headerStyle,
                  }}
                  onClick={() => {
                    if (isSortable && onSort) {
                      onSort(col.accessor);
                    }
                  }}
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>{col.header}</span>
                    {isSortable && (
                      <span style={{ color: isCurrentSort ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                        {isCurrentSort ? (
                          sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} opacity={0.4} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Loading records...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  {emptyIcon && (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--color-accent-tint)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-warning)",
                      }}
                    >
                      {emptyIcon}
                    </div>
                  )}
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    {emptyMessage}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row[keyField] || rowIndex}>
                {columns.map((col) => (
                  <td key={col.header} style={col.cellStyle}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalCount > pageSize && onPageChange && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              icon={ChevronLeft}
            >
              Prev
            </Button>
            <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
