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
                      <span style={{ color: isCurrentSort ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
                        {isCurrentSort ? (
                          sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} opacity={0.5} />
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
                <span style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                  Loading records...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  {emptyIcon && (
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-control)",
                        backgroundColor: "var(--color-primary-tint)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-primary)",
                      }}
                    >
                      {emptyIcon}
                    </div>
                  )}
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "14px", fontWeight: "400" }}>
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
            fontSize: "13px",
            color: "var(--color-text-secondary)",
          }}
        >
          <div className="tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              icon={ChevronLeft}
            >
              Prev
            </Button>
            <span style={{ fontWeight: "600", color: "var(--color-text)" }} className="tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
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
