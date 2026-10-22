import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Eye, Printer, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { getVisits } from "../services/visits";
import { getPatients } from "../services/patients";
import { getPrescriptions } from "../services/prescriptions";
import { getBills } from "../services/bills";
import { formatDate } from "../utils/format";
import { useData } from "../context/DataContext";

export default function Consultations() {
  const navigate = useNavigate();
  const { dataVersion } = useData();

  const [visits, setVisits] = useState([]);
  const [patientsMap, setPatientsMap] = useState(new Map());
  const [rxMap, setRxMap] = useState(new Map());
  const [billMap, setBillMap] = useState(new Map());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadAllVisits();
  }, [dataVersion]);

  const loadAllVisits = async () => {
    setLoading(true);
    try {
      const [vList, pList, rxList, bList] = await Promise.all([
        getVisits(),
        getPatients(),
        getPrescriptions(),
        getBills(),
      ]);

      const pMap = new Map(pList.map((p) => [p.id, p]));
      const rMap = new Map(rxList.map((r) => [r.visitId, r]));
      const bMap = new Map(bList.map((b) => [b.visitId, b]));

      setVisits(vList);
      setPatientsMap(pMap);
      setRxMap(rMap);
      setBillMap(bMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = useMemo(() => {
    if (!search.trim()) return visits;
    const q = search.toLowerCase().trim();
    return visits.filter((v) => {
      const patient = patientsMap.get(v.patientId);
      const patName = patient ? patient.name.toLowerCase() : "";
      return (
        patName.includes(q) ||
        v.id.toLowerCase().includes(q) ||
        (v.complaint && v.complaint.toLowerCase().includes(q))
      );
    });
  }, [visits, search, patientsMap]);

  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisits.slice(start, start + pageSize);
  }, [filteredVisits, currentPage]);

  const columns = [
    {
      header: "Patient",
      accessor: "patientId",
      render: (v) => {
        const patient = patientsMap.get(v.patientId);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              onClick={() => patient && navigate(`/patients/${patient.id}`)}
              style={{
                fontSize: "14px",
                fontWeight: "600",
                lineHeight: "20px",
                color: "var(--color-primary)",
                cursor: patient ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (patient) e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                if (patient) e.currentTarget.style.textDecoration = "none";
              }}
            >
              {patient ? patient.name : v.patientId}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: "12px",
                fontWeight: "400",
                lineHeight: "17px",
                color: "var(--color-text-secondary)",
              }}
            >
              {patient ? patient.id : v.patientId}
            </span>
          </div>
        );
      },
    },
    {
      header: "Time",
      accessor: "dateTime",
      cellStyle: { whiteSpace: "nowrap" },
      render: (v) => (
        <span className="tabular-nums" style={{ fontSize: "14px", color: "var(--color-text)" }}>
          {formatDate(v.dateTime, true)}
        </span>
      ),
    },
    {
      header: "Chief Complaint",
      accessor: "complaint",
      cellStyle: { maxWidth: "260px" },
      render: (v) => (
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "14px",
            color: "var(--color-text)",
          }}
          title={v.complaint || "Routine consultation"}
        >
          {v.complaint || "Routine consultation"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "billStatus",
      cellStyle: { whiteSpace: "nowrap" },
      render: (v) => {
        const bill = billMap.get(v.id);
        if (!bill) return <Chip variant="unpaid">Pending</Chip>;
        return (
          <Chip variant={bill.status === "Paid" ? "paid" : "unpaid"}>
            {bill.status}
          </Chip>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cellStyle: { textAlign: "right", whiteSpace: "nowrap" },
      headerStyle: { textAlign: "right" },
      render: (v) => {
        const rx = rxMap.get(v.id);

        return (
          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => navigate(`/consultations/${v.id}`)}
              title="View consultation"
              aria-label="View consultation"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                e.currentTarget.style.color = "var(--color-primary)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <Eye size={18} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                if (rx) {
                  navigate(`/print/prescription/${rx.id}`);
                } else {
                  navigate(`/consultations/${v.id}`);
                }
              }}
              title="Print prescription"
              aria-label="Print prescription"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary-tint)";
                e.currentTarget.style.color = "var(--color-primary)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <Printer size={18} strokeWidth={2} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AppShell title="Consultations & Visits">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search by patient name or complaint..."
          />

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("/consultations/new")}
          >
            New Consultation
          </Button>
        </div>

        {!loading && filteredVisits.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <EmptyState
              icon={Stethoscope}
              title="No consultations found"
              description="No clinical visits match your search criteria."
              actionText="Record New Consultation"
              onAction={() => navigate("/consultations/new")}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedVisits}
            keyField="id"
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredVisits.length}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
      </div>
    </AppShell>
  );
}
