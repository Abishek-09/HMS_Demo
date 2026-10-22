// AuthContext with useReducer
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getCurrentUser, login as authLogin, logout as authLogout } from "../services/auth";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check initial session
    const current = getCurrentUser();
    if (current) {
      dispatch({ type: "AUTH_SUCCESS", payload: current });
    } else {
      dispatch({ type: "AUTH_FAILURE", payload: null });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await authLogin(email, password);
      dispatch({ type: "AUTH_SUCCESS", payload: res.user });
      return res;
    } catch (err) {
      dispatch({ type: "AUTH_FAILURE", payload: err.message });
      throw err;
    }
  };

  const logout = async () => {
    await authLogout();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
