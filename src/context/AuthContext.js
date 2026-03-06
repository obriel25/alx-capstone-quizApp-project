"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("quizUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Demo authentication - in production, this would call an API
    const users = JSON.parse(localStorage.getItem("quizUsers") || "[]");
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      localStorage.setItem("quizUser", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const signup = (name, email, password) => {
    // Demo authentication - in production, this would call an API
    const users = JSON.parse(localStorage.getItem("quizUsers") || "[]");

    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem("quizUsers", JSON.stringify(users));

    // Auto-login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem("quizUser", JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("quizUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
