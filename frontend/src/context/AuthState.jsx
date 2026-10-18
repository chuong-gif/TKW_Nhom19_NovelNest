import { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const AuthState = (props) => {
  const [loggedUser, setLoggedUser] = useState({});
  const [reload, setReload] = useState(false);

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    Cookies.remove("userId");
    setLoggedUser({});
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = Cookies.get("token");
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.exp) return false;
      // If token is about to expire (less than 5 minutes), consider invalid
      if (decoded.exp - Date.now() / 1000 < 300) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // Check token expiration periodically and clear expired tokens
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (!decoded || !decoded.exp || decoded.exp - Date.now() / 1000 < 300) {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, [handleLogout]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = Cookies.get("token");
        if (token && isAuthenticated()) {
          const response = await api.get("/users/me");
          setLoggedUser(response.data);
        } else {
          setLoggedUser({});
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUser();
  }, [reload, isAuthenticated]);

  const update = async () => {
    setReload(!reload);
  };

  return (
    <AuthContext.Provider
      value={{ loggedUser, update, isAuthenticated, handleLogout }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
