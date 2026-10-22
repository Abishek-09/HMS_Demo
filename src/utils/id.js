// Sequential ID generation utilities

const SEQ_STORAGE_KEY = "clinic_sequences";

function getSequences() {
  try {
    const raw = localStorage.getItem(SEQ_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read sequences:", e);
  }
  return {
    patient: 6,
    visit: 8,
    prescription: 6,
    bill: 8,
  };
}

function saveSequences(seqs) {
  try {
    localStorage.setItem(SEQ_STORAGE_KEY, JSON.stringify(seqs));
  } catch (e) {
    console.error("Failed to save sequences:", e);
  }
}

export function getNextPatientId() {
  const seqs = getSequences();
  seqs.patient = (seqs.patient || 0) + 1;
  saveSequences(seqs);
  return `PT-${String(seqs.patient).padStart(4, "0")}`;
}

export function getNextVisitId() {
  const seqs = getSequences();
  seqs.visit = (seqs.visit || 0) + 1;
  saveSequences(seqs);
  return `V-${String(seqs.visit).padStart(4, "0")}`;
}

export function getNextPrescriptionId() {
  const seqs = getSequences();
  seqs.prescription = (seqs.prescription || 0) + 1;
  saveSequences(seqs);
  return `RX-${String(seqs.prescription).padStart(4, "0")}`;
}

export function getNextInvoiceNo() {
  const seqs = getSequences();
  seqs.bill = (seqs.bill || 0) + 1;
  saveSequences(seqs);
  const year = new Date().getFullYear();
  return `INV-${year}-${String(seqs.bill).padStart(4, "0")}`;
}

export function initSequences(initial = { patient: 6, visit: 8, prescription: 6, bill: 8 }) {
  const existing = localStorage.getItem(SEQ_STORAGE_KEY);
  if (!existing) {
    saveSequences(initial);
  }
}
