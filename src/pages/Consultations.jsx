import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Eye, Printer, Plus, User } from "lucide-react";
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
      header: "Visit ID",
      accessor: "id",
      cellStyle: { fontWeight: "600", color: "var(--color-primary)", whiteSpace: "nowrap" },
    },
    {
      header: "Date & Time",
      accessor: "dateTime",
      cellStyle: { whiteSpace: "nowrap" },
      render: (v) => formatDate(v.dateTime, true),
    },
    {
      header: "Patient",
      accessor: "patientId",
      render: (v) => {
        const patient = patientsMap.get(v.patientId);
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
          v.patientId
        );
      },
    },
    {
      header: "Chief Complaint",
      accessor: "complaint",
      cellStyle: { maxWidth: "300px" },
      render: (v) => (
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={v.complaint}
        >
          {v.complaint}
        </span>
      ),
    },
    {
      header: "Bill Status",
      accessor: "billStatus",
      cellStyle: { whiteSpace: "nowrap" },
      render: (v) => {
        const bill = billMap.get(v.id);
        if (!bill) return "—";
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
        const bill = billMap.get(v.id);

        return (
          <div style={{ display: "inline-flex", gap: "6px" }}>
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => navigate(`/consultations/${v.id}`)}
            >
              View
            </Button>
            {rx && (
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/prescription/${rx.id}`)}
                title="Print Prescription"
              >
                Rx
              </Button>
            )}
            {bill && (
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => navigate(`/print/receipt/${bill.id}`)}
                title="Print Receipt"
              >
                Receipt
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppShell title="Consultations & Visits">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
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
              borderRadius: "var(--radius-lg)",
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
