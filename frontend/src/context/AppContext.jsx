"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

axios.defaults.baseURL = API_BASE_URL;

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (storedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    return storedToken;
  });
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [equipmentsLoading, setEquipmentsLoading] = useState(true);
  const [equipmentsError, setEquipmentsError] = useState(null);
  const [equipmentsFetchedAt, setEquipmentsFetchedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("equipment"); // "equipment" | "fertilizer"

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const startTime = Date.now();

      if (!token) {
        setUser(null);
      } else {
        try {
          const response = await axios.get("/users/profile");
          const currentUser = response?.data?.data || null;
          if (isMounted) {
            setUser(currentUser);
          }
        } catch (err) {
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      }

      const elapsed = Date.now() - startTime;
      const minimumDelay = 900;
      const waitMs = Math.max(0, minimumDelay - elapsed);

      setTimeout(() => {
        if (isMounted) {
          setAuthReady(true);
        }
      }, waitMs);
    };

    setAuthReady(false);
    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const fetchEquipments = async () => {
      try {
        if (isMounted) {
          setEquipmentsLoading(true);
          setEquipmentsError(null);
        }

        const response = await axios.get("/equipments");
        const list = response?.data?.equipments || [];

        if (isMounted) {
          setEquipments(Array.isArray(list) ? list : []);
          setEquipmentsFetchedAt(Date.now());
        }
      } catch (err) {
        if (isMounted) {
          setEquipmentsError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load equipment list",
          );
        }
      } finally {
        if (isMounted) {
          setEquipmentsLoading(false);
        }
      }
    };

    fetchEquipments();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshEquipments = useCallback(async () => {
    setEquipmentsLoading(true);
    setEquipmentsError(null);
    try {
      const response = await axios.get("/equipments");
      const list = response?.data?.equipments || [];
      setEquipments(Array.isArray(list) ? list : []);
      setEquipmentsFetchedAt(Date.now());
      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load equipment list";
      setEquipmentsError(message);
      return { ok: false, message };
    } finally {
      setEquipmentsLoading(false);
    }
  }, []);

  const setAuth = useCallback(({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || null);
    setUser(nextUser || null);
    setError(null);
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post("/users/logout");
      }
    } catch (err) {
      // Logout should always clear client auth state even if server call fails.
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const deleteAccount = useCallback(async () => {
    await axios.delete("/users/profile");
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      axiosInstance: axios,
      token,
      setToken,
      user,
      setUser,
      loading,
      setLoading,
      error,
      setError,
      setAuth,
      clearAuth,
      logout,
      deleteAccount,
      isAuthenticated: Boolean(token),
      authReady,
      apiBaseUrl: API_BASE_URL,
      equipments,
      setEquipments,
      equipmentsLoading,
      equipmentsError,
      equipmentsFetchedAt,
      refreshEquipments,
      activeTab,
      setActiveTab,
    }),
    [
      token,
      user,
      loading,
      error,
      authReady,
      equipments,
      equipmentsLoading,
      equipmentsError,
      equipmentsFetchedAt,
      activeTab,
      setActiveTab,
      setAuth,
      clearAuth,
      logout,
      deleteAccount,
      refreshEquipments,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
