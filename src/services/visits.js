// Visits Service (Async API Layer)

import { getFromStorage, saveToStorage, STORAGE_KEYS } from "./storage";
import { getNextVisitId } from "../utils/id";

export async function getVisits() {
  const visits = await getFromStorage(STORAGE_KEYS.VISITS);
  // Sort descending by date
  return visits.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
}

export async function getVisitsByPatient(patientId) {
  const visits = await getFromStorage(STORAGE_KEYS.VISITS);
  return visits
    .filter((v) => v.patientId === patientId)
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
}

export async function getVisitById(id) {
  const visits = await getFromStorage(STORAGE_KEYS.VISITS);
  return visits.find((v) => v.id === id) || null;
}

export async function createVisit(visitData) {
  const visits = await getFromStorage(STORAGE_KEYS.VISITS);
  const now = new Date().toISOString();

  const newVisit = {
    id: getNextVisitId(),
    patientId: visitData.patientId,
    dateTime: visitData.dateTime || now,
    complaint: visitData.complaint.trim(),
    notes: visitData.notes.trim(),
    observations: {
      weight: visitData.observations?.weight || "",
      temperature: visitData.observations?.temperature || "",
      bp: visitData.observations?.bp || "",
      pulse: visitData.observations?.pulse || "",
    },
    createdAt: now,
  };

  const updatedVisits = [newVisit, ...visits];
  await saveToStorage(STORAGE_KEYS.VISITS, updatedVisits);
  return newVisit;
}
