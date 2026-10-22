// Form validation helpers

export function isValidPhone(phone) {
  if (!phone) return false;
  // Clean spaces, hyphens, parentheses, optional leading +
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Must be 10 to 15 digits (optional leading + allowed)
  return /^\+?[0-9]{10,15}$/.test(cleaned);
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePatient(formData, isAgeMode) {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = "Full name is required";
  }

  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = "Please enter a valid phone number (10–15 digits)";
  }

  if (!formData.gender) {
    errors.gender = "Gender is required";
  }

  if (isAgeMode) {
    if (formData.age === "" || formData.age === null || formData.age === undefined) {
      errors.age = "Age is required";
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
        errors.age = "Please enter a valid age between 0 and 130";
      }
    }
  } else {
    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const d = new Date(formData.dob);
      if (isNaN(d.getTime()) || d > new Date()) {
        errors.dob = "Date of birth cannot be in the future";
      }
    }
  }

  return errors;
}

export function validateConsultationStep1(data) {
  const errors = {};
  if (!data.patientId) {
    errors.patientId = "Please select or register a patient";
  }
  if (!data.complaint || !data.complaint.trim()) {
    errors.complaint = "Chief complaint is required";
  }
  if (!data.notes || !data.notes.trim()) {
    errors.notes = "Clinical notes are required";
  }
  return errors;
}

export function validateMedicineRow(med) {
  const errors = {};
  if (!med.name || !med.name.trim()) {
    errors.name = "Medicine name is required";
  }
  if (!med.dosage || !med.dosage.trim()) {
    errors.dosage = "Dosage is required (e.g. 1-0-1)";
  }
  if (!med.frequency || !med.frequency.trim()) {
    errors.frequency = "Frequency is required (e.g. After food)";
  }
  if (!med.duration || !med.duration.trim()) {
    errors.duration = "Duration is required (e.g. 5 days)";
  }
  if (!med.quantity || !String(med.quantity).trim()) {
    errors.quantity = "Quantity is required";
  }
  return errors;
}
