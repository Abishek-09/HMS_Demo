// Patients Service (Async API Layer)

import { getFromStorage, saveToStorage, STORAGE_KEYS } from "./storage";
import { getNextPatientId } from "../utils/id";
import { calculateAge } from "../utils/format";

export async function getPatients(query = "") {
  const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
  if (!query || !query.trim()) {
    return patients;
  }
  const q = query.toLowerCase().trim();
  return patients.filter((p) => {
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });
}

export async function getPatientById(id) {
  const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
  return patients.find((p) => p.id === id) || null;
}

export async function createPatient(patientData) {
  const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
  const now = new Date().toISOString();

  // If DOB provided, ensure age is calculated or synced
  let age = patientData.age;
  if (patientData.dob && !age) {
    age = calculateAge(patientData.dob);
  }

  const newPatient = {
    id: getNextPatientId(),
    name: patientData.name.trim(),
    phone: patientData.phone.trim(),
    gender: patientData.gender,
    dob: patientData.dob || null,
    age: age ? Number(age) : null,
    address: patientData.address ? patientData.address.trim() : "",
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newPatient, ...patients];
  await saveToStorage(STORAGE_KEYS.PATIENTS, updatedList);
  return newPatient;
}

export async function updatePatient(id, patientData) {
  const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Patient ${id} not found`);
  }

  let age = patientData.age;
  if (patientData.dob && !age) {
    age = calculateAge(patientData.dob);
  }

  const updatedPatient = {
    ...patients[index],
    name: patientData.name.trim(),
    phone: patientData.phone.trim(),
    gender: patientData.gender,
    dob: patientData.dob || null,
    age: age ? Number(age) : null,
    address: patientData.address ? patientData.address.trim() : "",
    updatedAt: new Date().toISOString(),
  };

  patients[index] = updatedPatient;
  await saveToStorage(STORAGE_KEYS.PATIENTS, patients);
  return updatedPatient;
}
