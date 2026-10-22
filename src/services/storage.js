// Storage Service & Data Seeding
// Encapsulates localStorage persistence with async Promise interfaces

import { initSequences } from "../utils/id";

export const STORAGE_KEYS = {
  PATIENTS: "clinic_patients",
  VISITS: "clinic_visits",
  PRESCRIPTIONS: "clinic_prescriptions",
  BILLS: "clinic_bills",
  INITIALIZED: "clinic_initialized_v1",
};

// Generates relative dates for demo data so "today" visits always appear on today's calendar
function getDateOffset(daysAgo, hours = 10, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function getSeedData() {
  const patients = [
    {
      id: "PT-0001",
      name: "Rajesh Kumar",
      phone: "+91 98112 34567",
      gender: "Male",
      dob: "1980-04-15",
      age: 45,
      address: "14 MG Road, Sector 3, Springfield",
      createdAt: getDateOffset(25, 9, 0),
      updatedAt: getDateOffset(0, 9, 30),
    },
    {
      id: "PT-0002",
      name: "Priya Sundaram",
      phone: "+91 98450 12345",
      gender: "Female",
      dob: "1993-08-22",
      age: 32,
      address: "52 Indiranagar, Springfield",
      createdAt: getDateOffset(20, 11, 0),
      updatedAt: getDateOffset(0, 11, 15),
    },
    {
      id: "PT-0003",
      name: "Amit Patel",
      phone: "+91 97234 56789",
      gender: "Male",
      dob: null,
      age: 28,
      address: "7 Brigade Road, Springfield",
      createdAt: getDateOffset(15, 14, 0),
      updatedAt: getDateOffset(10, 16, 0),
    },
    {
      id: "PT-0004",
      name: "Sunita Devi",
      phone: "+91 94321 09876",
      gender: "Female",
      dob: "1965-01-10",
      age: 60,
      address: "108 Koramangala 4th Block, Springfield",
      createdAt: getDateOffset(12, 10, 0),
      updatedAt: getDateOffset(7, 10, 30),
    },
    {
      id: "PT-0005",
      name: "Rohan Mehta",
      phone: "+91 91234 56780",
      gender: "Male",
      dob: "2006-11-05",
      age: 19,
      address: "22 Whitefield Enclave, Springfield",
      createdAt: getDateOffset(5, 12, 0),
      updatedAt: getDateOffset(3, 17, 0),
    },
    {
      id: "PT-0006",
      name: "Ananya Rao",
      phone: "+91 99887 76655",
      gender: "Female",
      dob: "1987-03-30",
      age: 38,
      address: "34 Jayanagar 7th Phase, Springfield",
      createdAt: getDateOffset(3, 10, 0),
      updatedAt: getDateOffset(1, 15, 30),
    },
  ];

  const visits = [
    {
      id: "V-0001",
      patientId: "PT-0001",
      dateTime: getDateOffset(21, 10, 30),
      complaint: "Severe throat ache, high grade fever for 2 days and dry cough",
      notes: "Pharyngeal erythema observed. Bilateral tonsillar enlargement without exudates. Clear chest on auscultation.",
      observations: {
        weight: "72",
        temperature: "101.2",
        bp: "124/82",
        pulse: "88",
      },
      createdAt: getDateOffset(21, 10, 30),
    },
    {
      id: "V-0002",
      patientId: "PT-0002",
      dateTime: getDateOffset(14, 11, 45),
      complaint: "Throbbing unilateral headache, nausea and photophobia for 24 hours",
      notes: "Diagnosed with acute migraine episode with aura. Recommended hydration, dark room rest, and trigger diary.",
      observations: {
        weight: "58",
        temperature: "98.4",
        bp: "116/74",
        pulse: "76",
      },
      createdAt: getDateOffset(14, 11, 45),
    },
    {
      id: "V-0003",
      patientId: "PT-0003",
      dateTime: getDateOffset(10, 16, 15),
      complaint: "Watery diarrhea, abdominal cramps and nausea since yesterday evening",
      notes: "Acute infectious gastroenteritis. Mild dehydration. Prescribed oral rehydration salts, probiotics, and antispasmodic.",
      observations: {
        weight: "68",
        temperature: "99.1",
        bp: "112/70",
        pulse: "82",
      },
      createdAt: getDateOffset(10, 16, 15),
    },
    {
      id: "V-0004",
      patientId: "PT-0004",
      dateTime: getDateOffset(7, 10, 15),
      complaint: "Routine monthly checkup for essential hypertension and occasional morning dizziness",
      notes: "BP slightly elevated despite current medication compliance. Adjusted Telmisartan dose. Advised low sodium diet.",
      observations: {
        weight: "64",
        temperature: "98.6",
        bp: "148/92",
        pulse: "74",
      },
      createdAt: getDateOffset(7, 10, 15),
    },
    {
      id: "V-0005",
      patientId: "PT-0005",
      dateTime: getDateOffset(3, 17, 30),
      complaint: "Twisted right ankle during football practice, localized lateral swelling",
      notes: "Grade 1 lateral ankle ligament sprain. No bony tenderness along malleoli. Advised R.I.C.E protocol and crepe bandage support.",
      observations: {
        weight: "70",
        temperature: "98.4",
        bp: "120/80",
        pulse: "80",
      },
      createdAt: getDateOffset(3, 17, 30),
    },
    {
      id: "V-0006",
      patientId: "PT-0006",
      dateTime: getDateOffset(1, 15, 0),
      complaint: "Seasonal sneezing bouts, itchy watery eyes, and post-nasal drip",
      notes: "Allergic rhinitis aggravated by pollen/dust. Turbinates swollen and pale. Prescribed non-sedating antihistamine and nasal spray.",
      observations: {
        weight: "55",
        temperature: "98.6",
        bp: "118/76",
        pulse: "72",
      },
      createdAt: getDateOffset(1, 15, 0),
    },
    {
      id: "V-0007",
      patientId: "PT-0001",
      dateTime: getDateOffset(0, 9, 30),
      complaint: "Follow-up visit for chest congestion; throat pain resolved, mild morning phlegm remains",
      notes: "Chest clear bilaterally. Vitals completely stable. Continue steam inhalation for 3 more days.",
      observations: {
        weight: "72",
        temperature: "98.6",
        bp: "120/80",
        pulse: "74",
      },
      createdAt: getDateOffset(0, 9, 30),
    },
    {
      id: "V-0008",
      patientId: "PT-0002",
      dateTime: getDateOffset(0, 11, 15),
      complaint: "General wellness consultation and blood test report review (CBC & Vitamin D)",
      notes: "Mild Vitamin D3 deficiency (18 ng/mL). Prescribed weekly cholecalciferol sachets. All other routine parameters normal.",
      observations: {
        weight: "58",
        temperature: "98.5",
        bp: "114/72",
        pulse: "70",
      },
      createdAt: getDateOffset(0, 11, 15),
    },
  ];

  const prescriptions = [
    {
      id: "RX-0001",
      visitId: "V-0001",
      patientId: "PT-0001",
      medicines: [
        {
          name: "Amoxicillin + Clavulanate",
          strength: "625 mg",
          dosage: "1-0-1",
          frequency: "After food",
          duration: "5 days",
          quantity: "10 tabs",
          instructions: "Complete entire course even if feeling better",
        },
        {
          name: "Paracetamol",
          strength: "650 mg",
          dosage: "1-1-1 (SOS)",
          frequency: "After food",
          duration: "3 days",
          quantity: "9 tabs",
          instructions: "Take when body temperature exceeds 100°F",
        },
        {
          name: "Levocetirizine",
          strength: "5 mg",
          dosage: "0-0-1",
          frequency: "Bedtime",
          duration: "5 days",
          quantity: "5 tabs",
          instructions: "May cause mild drowsiness",
        },
      ],
      createdAt: getDateOffset(21, 10, 45),
    },
    {
      id: "RX-0002",
      visitId: "V-0002",
      patientId: "PT-0002",
      medicines: [
        {
          name: "Naproxen Sodium",
          strength: "500 mg",
          dosage: "1-0-1",
          frequency: "After food",
          duration: "3 days",
          quantity: "6 tabs",
          instructions: "Take with large glass of water",
        },
        {
          name: "Domperidone",
          strength: "10 mg",
          dosage: "1-0-0",
          frequency: "Before food",
          duration: "3 days",
          quantity: "3 tabs",
          instructions: "30 minutes before morning meal",
        },
      ],
      createdAt: getDateOffset(14, 12, 0),
    },
    {
      id: "RX-0003",
      visitId: "V-0003",
      patientId: "PT-0003",
      medicines: [
        {
          name: "ORS Sachet",
          strength: "21.8 g",
          dosage: "1-1-1",
          frequency: "Throughout day",
          duration: "3 days",
          quantity: "6 packs",
          instructions: "Dissolve 1 sachet in 1 litre boiled cool water",
        },
        {
          name: "Bacillus clausii Probiotic",
          strength: "2 Billion Spores",
          dosage: "1-0-1",
          frequency: "Between meals",
          duration: "5 days",
          quantity: "10 mini bottles",
          instructions: "Shake well before drinking",
        },
        {
          name: "Dicyclomine + Paracetamol",
          strength: "20mg / 325mg",
          dosage: "1-0-1 (SOS)",
          frequency: "After food",
          duration: "2 days",
          quantity: "4 tabs",
          instructions: "For severe spasmodic stomach cramps",
        },
      ],
      createdAt: getDateOffset(10, 16, 30),
    },
    {
      id: "RX-0004",
      visitId: "V-0004",
      patientId: "PT-0004",
      medicines: [
        {
          name: "Telmisartan",
          strength: "40 mg",
          dosage: "1-0-0",
          frequency: "Morning with water",
          duration: "30 days",
          quantity: "30 tabs",
          instructions: "Take regularly at same time daily",
        },
        {
          name: "Amlodipine",
          strength: "2.5 mg",
          dosage: "0-0-1",
          frequency: "Night",
          duration: "30 days",
          quantity: "30 tabs",
          instructions: "Monitor blood pressure weekly",
        },
      ],
      createdAt: getDateOffset(7, 10, 30),
    },
    {
      id: "RX-0005",
      visitId: "V-0006",
      patientId: "PT-0006",
      medicines: [
        {
          name: "Bilastine",
          strength: "20 mg",
          dosage: "1-0-0",
          frequency: "Empty stomach",
          duration: "10 days",
          quantity: "10 tabs",
          instructions: "Take 1 hour before breakfast",
        },
        {
          name: "Fluticasone Furoate Nasal Spray",
          strength: "27.5 mcg",
          dosage: "1 spray each nostril",
          frequency: "Once daily morning",
          duration: "14 days",
          quantity: "1 bottle",
          instructions: "Blow nose gently before use",
        },
      ],
      createdAt: getDateOffset(1, 15, 20),
    },
    {
      id: "RX-0006",
      visitId: "V-0007",
      patientId: "PT-0001",
      medicines: [
        {
          name: "Ambroxol + Guaifenesin Syrup",
          strength: "100 ml",
          dosage: "10 ml BD",
          frequency: "After food",
          duration: "5 days",
          quantity: "1 bottle",
          instructions: "Warm water gargles twice daily",
        },
      ],
      createdAt: getDateOffset(0, 9, 45),
    },
  ];

  const bills = [
    {
      id: "B-0001",
      invoiceNo: "INV-2025-0001",
      visitId: "V-0001",
      patientId: "PT-0001",
      date: getDateOffset(21, 10, 50),
      consultationFee: 500,
      medicineCharges: [{ label: "Amoxicillin 625mg + Paracetamol", amount: 150 }],
      total: 650,
      paymentMode: "Cash",
      status: "Paid",
      createdAt: getDateOffset(21, 10, 50),
    },
    {
      id: "B-0002",
      invoiceNo: "INV-2025-0002",
      visitId: "V-0002",
      patientId: "PT-0002",
      date: getDateOffset(14, 12, 10),
      consultationFee: 500,
      medicineCharges: [],
      total: 500,
      paymentMode: "Online",
      status: "Paid",
      createdAt: getDateOffset(14, 12, 10),
    },
    {
      id: "B-0003",
      invoiceNo: "INV-2025-0003",
      visitId: "V-0003",
      patientId: "PT-0003",
      date: getDateOffset(10, 16, 40),
      consultationFee: 500,
      medicineCharges: [
        { label: "ORS Sachets (6)", amount: 120 },
        { label: "Probiotic Mini Bottles", amount: 160 },
      ],
      total: 780,
      paymentMode: "Online",
      status: "Paid",
      createdAt: getDateOffset(10, 16, 40),
    },
    {
      id: "B-0004",
      invoiceNo: "INV-2025-0004",
      visitId: "V-0004",
      patientId: "PT-0004",
      date: getDateOffset(7, 10, 45),
      consultationFee: 500,
      medicineCharges: [],
      total: 500,
      paymentMode: "Cash",
      status: "Unpaid",
      createdAt: getDateOffset(7, 10, 45),
    },
    {
      id: "B-0005",
      invoiceNo: "INV-2025-0005",
      visitId: "V-0005",
      patientId: "PT-0005",
      date: getDateOffset(3, 17, 45),
      consultationFee: 500,
      medicineCharges: [{ label: "Crepe Bandage & Pain Relief Gel", amount: 120 }],
      total: 620,
      paymentMode: "Cash",
      status: "Paid",
      createdAt: getDateOffset(3, 17, 45),
    },
    {
      id: "B-0006",
      invoiceNo: "INV-2025-0006",
      visitId: "V-0006",
      patientId: "PT-0006",
      date: getDateOffset(1, 15, 30),
      consultationFee: 500,
      medicineCharges: [{ label: "Nasal Spray & Antihistamine", amount: 250 }],
      total: 750,
      paymentMode: "Online",
      status: "Unpaid",
      createdAt: getDateOffset(1, 15, 30),
    },
    {
      id: "B-0007",
      invoiceNo: "INV-2025-0007",
      visitId: "V-0007",
      patientId: "PT-0001",
      date: getDateOffset(0, 9, 50),
      consultationFee: 500,
      medicineCharges: [],
      total: 500,
      paymentMode: "Online",
      status: "Paid",
      createdAt: getDateOffset(0, 9, 50),
    },
    {
      id: "B-0008",
      invoiceNo: "INV-2025-0008",
      visitId: "V-0008",
      patientId: "PT-0002",
      date: getDateOffset(0, 11, 30),
      consultationFee: 500,
      medicineCharges: [],
      total: 500,
      paymentMode: "Cash",
      status: "Unpaid",
      createdAt: getDateOffset(0, 11, 30),
    },
  ];

  return { patients, visits, prescriptions, bills };
}

// Seed mock data if not initialized
export function seedStorageIfEmpty() {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized || !localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const seed = getSeedData();
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(seed.patients));
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(seed.visits));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(seed.prescriptions));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(seed.bills));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    initSequences({ patient: 6, visit: 8, prescription: 6, bill: 8 });
  }
}

// Low-level async storage helpers returning Promises
export async function getFromStorage(key) {
  seedStorageIfEmpty();
  return new Promise((resolve) => {
    try {
      const data = localStorage.getItem(key);
      resolve(data ? JSON.parse(data) : []);
    } catch (err) {
      console.error(`Error reading ${key}:`, err);
      resolve([]);
    }
  });
}

export async function saveToStorage(key, value) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Update backup timestamp
      localStorage.setItem("clinic_last_saved", new Date().toISOString());
      resolve(value);
    } catch (err) {
      console.error(`Error writing ${key}:`, err);
      reject(err);
    }
  });
}

// Export / Import Backup Helpers
export async function exportAllData() {
  const patients = await getFromStorage(STORAGE_KEYS.PATIENTS);
  const visits = await getFromStorage(STORAGE_KEYS.VISITS);
  const prescriptions = await getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  const bills = await getFromStorage(STORAGE_KEYS.BILLS);
  const sequences = localStorage.getItem("clinic_sequences");
  const settings = localStorage.getItem("clinic_settings");

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      patients,
      visits,
      prescriptions,
      bills,
      sequences: sequences ? JSON.parse(sequences) : null,
      settings: settings ? JSON.parse(settings) : null,
    },
  };
}

export async function importAllData(backupJson) {
  if (!backupJson || !backupJson.data) {
    throw new Error("Invalid backup file structure");
  }

  const { patients, visits, prescriptions, bills, sequences, settings } = backupJson.data;

  if (Array.isArray(patients)) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  if (Array.isArray(visits)) localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  if (Array.isArray(prescriptions)) localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  if (Array.isArray(bills)) localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  if (sequences) localStorage.setItem("clinic_sequences", JSON.stringify(sequences));
  if (settings) localStorage.setItem("clinic_settings", JSON.stringify(settings));

  localStorage.setItem("clinic_last_saved", new Date().toISOString());
  return true;
}

export function getLastSavedTimestamp() {
  return localStorage.getItem("clinic_last_saved") || new Date().toISOString();
}
