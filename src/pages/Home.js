import { useRef } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  IconButton
} from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Counter from "../comp/Counter";
import FeaturesSection from "../comp/FeaturesSection";
import OurTeam from "../comp/OurTeam";
import Footer from "../comp/Footer";
import CloseIcon from "@mui/icons-material/Close";
import { useFootball } from "../FootballContext";


export default function Home() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.3]); // Parallax zoom effect
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 📱 Detect mobile
  const { showNotice, setShowNotice } = useFootball();

  return (
    <Box sx={{ color: "white", overflowX: "hidden" }}>
      {/* =================== HERO SECTION =================== */}
      {/* Desktop / Laptop Hero */}
      {!isMobile && (
        <>
          {showNotice && (
            <Box
              sx={{
                position: "fixed", // stays on top
                top: 70,
                left: "50%",
                transform: "translateX(-50%)",
                mx: "auto",
                mt: 1.5,
                width: { xs: "90%", sm: "70%", md: "55%" }, // ✅ proper full responsive width
                border: "1.2px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
                py: { xs: 0.8, sm: 1 },
                px: { xs: 1.5, sm: 2.5 },
                textAlign: "center",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.8rem" },
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.05)",
                zIndex: 9999,
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 300,
                  width: "90%", // ✅ takes full width for text
                }}
              >
                ⚠️ Some features like{" "}
                <strong style={{ color: "#00e5ff" }}>update</strong> and{" "}
                <strong style={{ color: "#00e5ff" }}>delete</strong> may not work properly
                on <strong>iPhone</strong> or <strong>Safari</strong>. We're fixing it soon! 🙏
              </Typography>

              <IconButton
                onClick={() => setShowNotice(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#00e5ff",
                  "&:hover": { color: "#00bcd4" },
                }}
              >
                <CloseIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Box>
          )}
          <Box
            ref={ref}
            sx={{
              position: "relative",
              height: "100vh",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "white",
            }}
          >
            {/* 🎥 Background Image with Smooth Zoom */}
            <motion.div
              style={{
                backgroundImage:
                  "url('https://ik.imagekit.io/footballhub/heroSec.jpg?updatedAt=1760700469123')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
                scale, // 👈 zoom effect
              }}
            />

            {/* Dark Overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.6)",
                zIndex: 1,
              }}
            />

            {/* Content */}
            <Box sx={{ zIndex: 2, px: 3 }}>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 5
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                    background:
                      "linear-gradient(270deg, #FFFFFF, #68b0ddff, #FFFFFF)",
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 6s ease-in-out infinite alternate",
                    "@keyframes shimmer": {
                      "0%": { backgroundPosition: "0% 50%" },
                      "100%": { backgroundPosition: "100% 50%" },
                    },
                  }}
                >
                  Wellcome To Football
                </Typography>

                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #0073E6, #FFFFFF, #0073E6)",
                    borderRadius: { xs: "10px", sm: "15px", md: "20px" },
                    px: { xs: 0.8, sm: 1, md: 1.5 },
                    py: { xs: 0.1, sm: 0.25, md: 0.4 },
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                      background:
                        "linear-gradient(270deg, #000000ff, #001455ff, #000000ff)",
                      backgroundSize: "300% 300%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "shimmer 6s ease-in-out infinite alternate",
                      "@keyframes shimmer": {
                        "0%": { backgroundPosition: "0% 50%" },
                        "100%": { backgroundPosition: "100% 50%" },
                      },
                    }}
                  >
                    Hub
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Montserrat', sans-serif",
                  background:
                    "linear-gradient(270deg,  #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 20s ease-in-out infinite alternate",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                  },
                }}
              >
                — From Streets to Stadiums —
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  color: "rgba(255,255,255,0.85)",
                  maxWidth: "700px",
                  mx: "auto",
                }}
              >
                A platform where every footballer gets a chance to shine
              </Typography>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="outlined"
                  sx={{
                    borderRadius: "30px",
                    px: 5,
                    py: 1.5,
                    fontWeight: "bold",
                    color: "#00e5ff",
                    borderColor: "#00e5ff",
                    boxShadow: "0 0 20px rgba(0,229,255,0.4)",
                    background: "transparent",
                    "&:hover": {
                      background: "rgba(0,229,255,0.1)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 0 25px rgba(0,229,255,0.7)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Become a Player Now
                </Button>
              </Box>
            </Box>
          </Box>
        </>

      )}

      {/* Mobile Hero (📱) */}
      {isMobile && (
        <>
          {showNotice && (
            <Box
              sx={{
                position: "fixed", // stays on top
                top: { xs: 50, sm: 20 },
                left: "50%",
                transform: "translateX(-50%)",
                mx: "auto",
                mt: 1.5,
                width: { xs: "90%", sm: "70%", md: "55%" }, // ✅ proper full responsive width
                border: "1.2px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
                py: { xs: 0.8, sm: 1 },
                px: { xs: 1.5, sm: 2.5 },
                textAlign: "center",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.8rem" },
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.05)",
                zIndex: 9999,
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 300,
                  width: "90%", // ✅ takes full width for text
                }}
              >
                ⚠️ Some features like{" "}
                <strong style={{ color: "#00e5ff" }}>update</strong> and{" "}
                <strong style={{ color: "#00e5ff" }}>delete</strong> may not work properly
                on <strong>iPhone</strong> or <strong>Safari</strong>. We're fixing it soon! 🙏
              </Typography>

              <IconButton
                onClick={() => setShowNotice(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#00e5ff",
                  "&:hover": { color: "#00bcd4" },
                }}
              >
                <CloseIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Box>
          )}

          <Box
            ref={ref}
            sx={{
              py: 10,
              px: 4,
              position: "relative",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {/* 🌀 Background with Zoom */}
            <motion.div
              style={{
                backgroundImage:
                  "url('https://ik.imagekit.io/footballhub/heroSec.jpg?updatedAt=1760700469123')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                scale, // 👈 same zoom effect
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.6)",
                zIndex: 1,
              }}
            />
            <Box sx={{ position: "relative", zIndex: 2, maxWidth: "900px", mx: "auto" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Montserrat', sans-serif",
                  background:
                    "linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 20s ease-in-out infinite alternate",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                  },
                }}
              >
                From Streets to Stadiums
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  color: "rgba(255,255,255,0.85)",
                  maxWidth: "700px",
                  mx: "auto",
                }}
              >
                A platform where every footballer gets a chance to shine
              </Typography>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="outlined"
                  sx={{
                    borderRadius: "30px",
                    px: 5,
                    py: 1.5,
                    fontWeight: "bold",
                    color: "#00e5ff",
                    borderColor: "#00e5ff",
                    boxShadow: "0 0 20px rgba(0,229,255,0.4)",
                    background: "transparent",
                    "&:hover": {
                      background: "rgba(0,229,255,0.1)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 0 25px rgba(0,229,255,0.7)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Become a Player Now
                </Button>
              </Box>
            </Box>
          </Box>
        </>

      )}

      {/* 🌍 ABOUT SECTION */}
      <Box
        sx={{
          py: 10,
          px: 4,
          backgroundImage:
            "url('https://ik.imagekit.io/footballhub/ourMission.jpg?updatedAt=1760725976436')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          textAlign: "center",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)" }} />
        <Box sx={{ position: "relative", zIndex: 2, maxWidth: "900px", mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: "'Montserrat', sans-serif",
              background:
                "linear-gradient(270deg,  #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 20s ease-in-out infinite alternate",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "0% 50%" },
                "100%": { backgroundPosition: "100% 50%" },
              },
              mb: 6,
            }}
          >
            Our Mission
          </Typography>
          <Typography
            variant="body1"
            color="rgba(255,255,255,0.9)"
            lineHeight={1.9}
            sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
          >
            Every street hides a story, and every player holds a dream. Yet, countless footballers go unnoticed —
            not because they lack talent, but because they lack a platform.
            <br />
            <br />
            <strong>Football Hub</strong> exists to change that.
            We connect passionate players, visionary coaches, and rising teams to real opportunities.
            Whether you want to <strong>play, coach, compete, or grow</strong> — this is your home of football dreams.
            <br />
            <br />
            Together, we’re turning <strong>passion into purpose</strong> and <strong>streets into stadiums.</strong>
          </Typography>
        </Box>
      </Box>

      {/* 📈 STATS COUNTER */}
      <Counter />

      {/* 💎 FEATURES */}
      <FeaturesSection />

      {/* 👥 OUR TEAM */}
      <OurTeam />

      {/* 🌐 FOOTER */}
      <Footer />
    </Box>
  );
}
