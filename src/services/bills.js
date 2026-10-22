// Bills Service (Async API Layer)

import { getFromStorage, saveToStorage, STORAGE_KEYS } from "./storage";
import { getNextInvoiceNo } from "../utils/id";

export async function getBills(filter = "All", searchQuery = "") {
  let bills = await getFromStorage(STORAGE_KEYS.BILLS);

  if (filter === "Paid") {
    bills = bills.filter((b) => b.status === "Paid");
  } else if (filter === "Unpaid") {
    bills = bills.filter((b) => b.status === "Unpaid");
  }

  // Sort descending by date
  bills.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    // In order to search by patient name, we need patient list or check if patient name is stored / resolved
    const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
    const patientMap = new Map(patients.map((p) => [p.id, p.name.toLowerCase()]));

    bills = bills.filter((b) => {
      const invMatch = b.invoiceNo && b.invoiceNo.toLowerCase().includes(q);
      const patientName = patientMap.get(b.patientId) || "";
      const patMatch = patientName.includes(q) || b.patientId.toLowerCase().includes(q);
      return invMatch || patMatch;
    });
  }

  return bills;
}

export async function getBillById(id) {
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  return bills.find((b) => b.id === id || b.invoiceNo === id) || null;
}

export async function getBillByVisit(visitId) {
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  return bills.find((b) => b.visitId === visitId) || null;
}

export async function getBillsByPatient(patientId) {
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  return bills
    .filter((b) => b.patientId === patientId)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

export async function createBill(billData) {
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  const now = new Date().toISOString();

  const invoiceNo = getNextInvoiceNo();
  const consultFee = Number(billData.consultationFee) || 0;
  const medCharges = Array.isArray(billData.medicineCharges)
    ? billData.medicineCharges.map((m) => ({
        label: m.label.trim(),
        amount: Number(m.amount) || 0,
      }))
    : [];

  const calculatedTotal =
    consultFee + medCharges.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const newBill = {
    id: `B-${invoiceNo.replace("INV-", "")}`,
    invoiceNo,
    visitId: billData.visitId,
    patientId: billData.patientId,
    date: billData.date || now,
    consultationFee: consultFee,
    medicineCharges: medCharges,
    total: calculatedTotal,
    paymentMode: billData.paymentMode || "Cash",
    status: billData.status || "Paid",
    createdAt: now,
  };

  const updated = [newBill, ...bills];
  await saveToStorage(STORAGE_KEYS.BILLS, updated);
  return newBill;
}

export async function updateBillStatus(id, status, paymentMode) {
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  const index = bills.findIndex((b) => b.id === id || b.invoiceNo === id);
  if (index === -1) {
    throw new Error(`Bill ${id} not found`);
  }

  const updated = {
    ...bills[index],
    status: status || bills[index].status,
    paymentMode: paymentMode || bills[index].paymentMode,
  };

  bills[index] = updated;
  await saveToStorage(STORAGE_KEYS.BILLS, bills);
  return updated;
}
