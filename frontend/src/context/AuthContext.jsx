import { createContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/authAPI";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.log(err);
    } finally {
      setUser(null);
    }
  };

  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();

      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
