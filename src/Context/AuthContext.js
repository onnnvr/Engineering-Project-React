import { createContext, useContext, useEffect, useState } from "react";
import { Axios } from "../Api/Axios";
import { MYUSER } from "../Api/Api";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("e-commerce");

    if (!token) {
      setLoading(false);
      return;
    }

    Axios.get(`${MYUSER}?populate=*`)
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("e-commerce");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  console.log(user)

  const logout = () => {
    localStorage.removeItem("e-commerce"); // نمسح التوكن
    setUser(null); // نصفر بيانات المستخدم في الـ State
    window.location.pathname = "/"; 
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
