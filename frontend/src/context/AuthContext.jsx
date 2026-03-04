import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
const [theme, setTheme] = useState("light");

const toggleTheme = () => {
  setTheme(prev => prev === "light" ? "dark" : "light");
};
  const login = (email) => {
    // Simple role logic
    const role = email === "admin@nitkkr.ac.in" ? "admin" : "student";

    const userData = { email, role };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;