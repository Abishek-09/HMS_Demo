import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Eye, Printer, CheckCircle, Clock } from "lucide-react";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { getBills, updateBillStatus } from "../services/bills";
import { getPatients } from "../services/patients";
import { formatDate, formatCurrency } from "../utils/format";
import { useData } from "../context/DataContext";

export default function Billing() {
  const navigate = useNavigate();
  const { dataVersion, showToast, refreshData } = useData();

  const [bills, setBills] = useState([]);
  const [patientsMap, setPatientsMap] = useState(new Map());
  const [filter, setFilter] = useState("All"); // All | Paid | Unpaid
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadBillingData();
  }, [filter, dataVersion]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [bList, pList] = await Promise.all([
        getBills(filter, ""),
        getPatients(),
      ]);
      setBills(bList);
      setPatientsMap(new Map(pList.map((p) => [p.id, p])));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = useMemo(() => {
    if (!search.trim()) return bills;
    const q = search.toLowerCase().trim();
    return bills.filter((b) => {
      const patient = patientsMap.get(b.patientId);
      const patName = patient ? patient.name.toLowerCase() : "";
      return (
        b.invoiceNo.toLowerCase().includes(q) ||
        patName.includes(q) ||
        b.patientId.toLowerCase().includes(q)
      );
    });
  }, [bills, search, patientsMap]);

  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage]);

  // Totals strip for current filter
  const filterStats = useMemo(() => {
    const count = filteredBills.length;
    const sum = filteredBills.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    return { count, sum };
  }, [filteredBills]);

  const handleToggleStatus = async (bill) => {
    const newStatus = bill.status === "Paid" ? "Unpaid" : "Paid";
    try {
      await updateBillStatus(bill.id, newStatus);
      showToast(`Invoice ${bill.invoiceNo} marked as ${newStatus}`);
      refreshData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update bill status", "error");
    }
  };

  const columns = [
    {
      header: "Invoice No",
      accessor: "invoiceNo",
      cellStyle: { fontWeight: "700", color: "var(--color-primary)", whiteSpace: "nowrap" },
    },
    {
      header: "Date",
      accessor: "date",
      cellStyle: { whiteSpace: "nowrap" },
      render: (b) => formatDate(b.date || b.createdAt, false),
    },
    {
      header: "Patient",
      accessor: "patientId",
      render: (b) => {
        const patient = patientsMap.get(b.patientId);
        return patient ? (
          <span
            onClick={() => navigate(`/patients/${patient.id}`)}
            style={{ fontWeight: "600", color: "var(--color-primary)", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            {patient.name}
          </span>
        ) : (
          b.patientId
        );
      },
    },
    {
      header: "Amount",
      accessor: "total",
      cellStyle: { fontWeight: "600", whiteSpace: "nowrap" },
      render: (b) => formatCurrency(b.total),
    },
    {
      header: "Mode",
      accessor: "paymentMode",
      cellStyle: { whiteSpace: "nowrap" },
      render: (b) => <Chip variant="mode">{b.paymentMode}</Chip>,
    },
    {
      header: "Status",
      accessor: "status",
      cellStyle: { whiteSpace: "nowrap" },
      render: (b) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(b)}
          title={`Click to mark as ${b.status === "Paid" ? "Unpaid" : "Paid"}`}
          style={{ cursor: "pointer" }}
        >
          <Chip variant={b.status === "Paid" ? "paid" : "unpaid"}>{b.status}</Chip>
        </button>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cellStyle: { textAlign: "right", whiteSpace: "nowrap" },
      headerStyle: { textAlign: "right" },
      render: (b) => (
        <div style={{ display: "inline-flex", gap: "6px" }}>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/billing/${b.id}`)}
          >
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => navigate(`/print/receipt/${b.id}`)}
            title="Print Receipt"
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell title="Billing & Invoices">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Filter Tabs & Search Bar */}
        <div
          className="toolbar-responsive"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Filter Pills */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--color-surface)",
              padding: "3px",
              borderRadius: "var(--radius-control)",
              border: "1px solid var(--color-border)",
            }}
          >
            {["All", "Paid", "Unpaid"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "6px 16px",
                  borderRadius: "calc(var(--radius-control) - 2px)",
                  fontSize: "13px",
                  fontWeight: filter === f ? "600" : "500",
                  backgroundColor: filter === f ? "var(--color-primary)" : "transparent",
                  color: filter === f ? "#FFFFFF" : "var(--color-text-secondary)",
                  transition: "all var(--transition-fast)",
                  cursor: "pointer",
                }}
              >
                {f} Bills
              </button>
            ))}
          </div>

          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search by invoice no or patient name..."
          />
        </div>

        {/* Invoices Table */}
        {!loading && filteredBills.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <EmptyState
              icon={Receipt}
              title="No billing records found"
              description={`No invoices match your selected filter (${filter}) or search term.`}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedBills}
            keyField="id"
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredBills.length}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}

        {/* Totals Strip at the Bottom */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Filter: <strong>{filter}</strong>
            </span>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Total Records: <strong>{filterStats.count}</strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Filtered Sum:
            </span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)" }}>
              {formatCurrency(filterStats.sum)}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
