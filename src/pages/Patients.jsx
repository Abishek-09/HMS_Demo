import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Eye, Edit2, Stethoscope } from "lucide-react";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import { getPatients } from "../services/patients";
import { getVisits } from "../services/visits";
import { formatDate } from "../utils/format";
import { useData } from "../context/DataContext";

export default function Patients() {
  const navigate = useNavigate();
  const { dataVersion } = useData();

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Sorting and pagination
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, visitsData] = await Promise.all([
        getPatients(""),
        getVisits(),
      ]);
      setPatients(patientsData);
      setVisits(visitsData);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Map each patient to their most recent visit date
  const lastVisitMap = useMemo(() => {
    const map = new Map();
    visits.forEach((v) => {
      const existing = map.get(v.patientId);
      if (!existing || new Date(v.dateTime) > new Date(existing)) {
        map.set(v.patientId, v.dateTime);
      }
    });
    return map;
  }, [visits]);

  // Filter patients by search (name, phone, id)
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase().trim();
    return patients.filter((p) => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    });
  }, [patients, search]);

  // Sort patients
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      if (sortField === "name") {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return sortDirection === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortField === "lastVisit") {
        const dateA = lastVisitMap.get(a.id) ? new Date(lastVisitMap.get(a.id)).getTime() : 0;
        const dateB = lastVisitMap.get(b.id) ? new Date(lastVisitMap.get(b.id)).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [filteredPatients, sortField, sortDirection, lastVisitMap]);

  // Paginated records
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      header: "Patient ID",
      accessor: "id",
      cellStyle: { fontWeight: "600", color: "var(--color-primary)", whiteSpace: "nowrap" },
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (p) => (
        <span
          onClick={() => navigate(`/patients/${p.id}`)}
          style={{
            fontWeight: "600",
            color: "var(--color-primary)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {p.name}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      cellStyle: { color: "var(--color-text-muted)", whiteSpace: "nowrap" },
    },
    {
      header: "Gender",
      accessor: "gender",
      cellStyle: { whiteSpace: "nowrap" },
    },
    {
      header: "Age / DOB",
      accessor: "age",
      cellStyle: { whiteSpace: "nowrap" },
      render: (p) => {
        if (p.age) return `${p.age} yrs`;
        if (p.dob) return formatDate(p.dob, false);
        return "—";
      },
    },
    {
      header: "Last Visit",
      accessor: "lastVisit",
      sortable: true,
      cellStyle: { whiteSpace: "nowrap" },
      render: (p) => {
        const last = lastVisitMap.get(p.id);
        return last ? (
          formatDate(last, false)
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>No visits</span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cellStyle: { textAlign: "right", whiteSpace: "nowrap" },
      headerStyle: { textAlign: "right" },
      render: (p) => (
        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/patients/${p.id}`)}
            title="View Profile"
          >
            Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Stethoscope}
            onClick={() => navigate(`/consultations/new?patientId=${p.id}`)}
            title="New Consultation"
          >
            New Visit
          </Button>
          <Button
            variant="text"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/patients/${p.id}/edit`)}
            title="Edit Patient"
          />
        </div>
      ),
    },
  ];

  return (
    <AppShell title="Patients Directory">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Actions Bar */}
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
            placeholder="Search by name, phone, or PT-ID..."
          />

          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => navigate("/patients/new")}
          >
            Register Patient
          </Button>
        </div>

        {/* Patients Table */}
        {!loading && filteredPatients.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <EmptyState
              icon={User}
              title="No patients found"
              description={
                search
                  ? `No patient records match "${search}". Try searching with a different name, phone, or ID.`
                  : "You have not registered any patients yet."
              }
              actionText="Register new patient"
              onAction={() => navigate("/patients/new")}
              actionIcon={UserPlus}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedPatients}
            keyField="id"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={sortedPatients.length}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
      </div>
    </AppShell>
  );
}
