// Clinic Identity Configuration
// Edit this file to customize the clinic's branding and doctor details

export const DEFAULT_CLINIC_CONFIG = {
  name: "Greenleaf Family Clinic",
  doctor: "Dr. A. Sharma",
  quals: "MBBS, MD (General Medicine)",
  regNo: "Reg. No. 12345",
  address: "12 Park Road, Sector 4, Springfield – 560001",
  phone: "+91 98765 43210",
  email: "care@greenleafclinic.test",
  timings: "Mon–Sat, 9:00 AM – 1:00 PM, 5:00 PM – 8:00 PM",
  consultFee: 500,
  // SVG Monogram logo for Greenleaf Family ("GF")
  logoText: "GF",
};

export const CLINIC_STORAGE_KEY = "clinic_settings";

export function getClinicConfig() {
  try {
    const stored = localStorage.getItem(CLINIC_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CLINIC_CONFIG, ...JSON.parse(stored) };
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
