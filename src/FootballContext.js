import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const FootballContext = createContext();
export const useFootball = () => useContext(FootballContext);

export const FootballProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
      }}
    >
      {children}
    </FootballContext.Provider>
  );
};
