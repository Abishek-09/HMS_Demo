// Clinic Identity Configuration
// Updated to Santosh Child Care per practitioner card

export const DEFAULT_CLINIC_CONFIG = {
  name: "Santosh Child Care",
  doctor: "Dr. B. Sivakumar",
  quals: "M.B.B.S., M.D. (PEDS)",
  designation: "Consultant Pediatrician",
  regNo: "Reg. No. 12345",
  address: "7, College Road, Ambai",
  phone: "+91 83004 42584",
  email: "care@santoshchildcare.test",
  timings: "1:00 PM – 9:00 PM",
  consultFee: 500,
  // SVG Monogram logo for Santosh Child Care ("SC")
  logoText: "SC",
};

export const CLINIC_STORAGE_KEY = "clinic_settings";

export function getClinicConfig() {
  try {
    const stored = localStorage.getItem(CLINIC_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Automatically migrate from old template default if present
      if (parsed.name === "Greenleaf Family Clinic" || parsed.doctor === "Dr. A. Sharma") {
        localStorage.setItem(CLINIC_STORAGE_KEY, JSON.stringify(DEFAULT_CLINIC_CONFIG));
        return DEFAULT_CLINIC_CONFIG;
      }
      return { ...DEFAULT_CLINIC_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Error reading clinic config:", err);
  }
  return DEFAULT_CLINIC_CONFIG;
}

export function saveClinicConfig(config) {
  try {
    localStorage.setItem(CLINIC_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error("Error saving clinic config:", err);
    return false;
  }
}
