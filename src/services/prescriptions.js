// Prescriptions Service (Async API Layer)

import { getFromStorage, saveToStorage, STORAGE_KEYS } from "./storage";
import { getNextPrescriptionId } from "../utils/id";

export async function getPrescriptions() {
  const rxList = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  return rxList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getPrescriptionById(id) {
  const rxList = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  return rxList.find((r) => r.id === id) || null;
}

export async function getPrescriptionByVisit(visitId) {
  const rxList = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  return rxList.find((r) => r.visitId === visitId) || null;
}

export async function getPrescriptionsByPatient(patientId) {
  const rxList = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  return rxList
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createPrescription(rxData) {
  const rxList = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  const now = new Date().toISOString();

  const newRx = {
    id: getNextPrescriptionId(),
    visitId: rxData.visitId,
    patientId: rxData.patientId,
    medicines: Array.isArray(rxData.medicines)
      ? rxData.medicines.map((m) => ({
          name: m.name.trim(),
          strength: m.strength ? m.strength.trim() : "",
          dosage: m.dosage ? m.dosage.trim() : "",
          frequency: m.frequency ? m.frequency.trim() : "",
          duration: m.duration ? m.duration.trim() : "",
          quantity: m.quantity ? String(m.quantity).trim() : "",
          instructions: m.instructions ? m.instructions.trim() : "",
        }))
      : [],
    createdAt: now,
  };

  const updated = [newRx, ...rxList];
  await saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, updated);
  return newRx;
}
