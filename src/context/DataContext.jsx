// DataContext with useReducer for app notifications, clinic info, and data synchronization
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getClinicConfig, saveClinicConfig } from "../config/clinic";
import { seedStorageIfEmpty } from "../services/storage";

const DataContext = createContext(null);

const initialState = {
  clinicConfig: getClinicConfig(),
  toasts: [],
  dataVersion: 1, // incremented when records change to notify subscribers
};

function dataReducer(state, action) {
  switch (action.type) {
    case "SET_CLINIC_CONFIG":
      return { ...state, clinicConfig: action.payload };
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now() + Math.random(), ...action.payload }],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    case "TRIGGER_REFRESH":
      return { ...state, dataVersion: state.dataVersion + 1 };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  useEffect(() => {
    // Ensure demo mock data is seeded on first load
    seedStorageIfEmpty();
  }, []);

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", payload: id });
    }, 4000);
  };

  const removeToast = (id) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  const updateClinic = (newConfig) => {
    saveClinicConfig(newConfig);
    dispatch({ type: "SET_CLINIC_CONFIG", payload: newConfig });
    showToast("Clinic settings updated successfully");
  };

  const refreshData = () => {
    dispatch({ type: "TRIGGER_REFRESH" });
  };

  return (
    <DataContext.Provider
      value={{
        clinicConfig: state.clinicConfig,
        toasts: state.toasts,
        dataVersion: state.dataVersion,
        showToast,
        removeToast,
        updateClinic,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
