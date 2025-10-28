import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const FootballContext = createContext();
export const useFootball = () => useContext(FootballContext);

export const FootballProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Detect iPhone or Safari
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    if (isIOS || isSafari) {
      setShowNotice(true);
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://footballhub.azurewebsites.net/profile", {
          withCredentials: true,
        });

        if (res.data.success) {
          setIsLogin(true);
          setCurrentPlayer(res.data.data);
        } else {
          setIsLogin(false);
          setCurrentPlayer(null);
        }
      } catch (err) {
        setIsLogin(false);
        setCurrentPlayer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <FootballContext.Provider
      value={{
        isLogin,
        setIsLogin,
        currentPlayer,
        setCurrentPlayer,
        loading,
        showNotice,
        setShowNotice,
      }}
    >
      {children}
    </FootballContext.Provider>
  );
};
