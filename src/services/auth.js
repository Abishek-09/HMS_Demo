// Mock Authentication Service

const SESSION_KEY = "clinic_auth_session";
const DEMO_EMAIL = "doctor@clinic.test";
const DEMO_PASS = "demo1234";

export async function login(email, password) {
  // Simulate network delay of 300ms
  await new Promise((res) => setTimeout(res, 300));

  if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASS) {
    const sessionData = {
      doctorEmail: DEMO_EMAIL,
      doctorName: "Dr. A. Sharma",
      loggedInAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  } else {
    throw new Error("Invalid email or password. Please use the demo credentials.");
  }
}

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error reading auth session:", e);
    return null;
  }
}

export async function logout() {
  await new Promise((res) => setTimeout(res, 100));
  sessionStorage.removeItem(SESSION_KEY);
  return true;
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
