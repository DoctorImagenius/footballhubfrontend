import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useFootball } from "../FootballContext";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaidIcon from "@mui/icons-material/Paid"; // Coins / Points icon


export default function Header() {
  const { isLogin, loading, currentPlayer } = useFootball();
  const [vibrateNotif, setVibrateNotif] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const menuItems = !isLogin
    ? [
      { icon: <LoginIcon fontSize="small" />, text: "Login" },
      { icon: <HowToRegIcon fontSize="small" />, text: "Signup" },
    ]
    : [];

  const triggerVibrate = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 300);
  };

  const vibrateAnimation = {
    animation: "vibrate 0.3s",
    "@keyframes vibrate": {
      "0%": { transform: "translate(0)" },
      "20%": { transform: "translate(-2px, 2px)" },
      "40%": { transform: "translate(-2px, -2px)" },
      "60%": { transform: "translate(2px, 2px)" },
      "80%": { transform: "translate(2px, -2px)" },
      "100%": { transform: "translate(0)" },
    },
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        width: "100%",
        background: "#10121580",
        backdropFilter: "blur(12px)",
        boxShadow: "0 5px 30px #101215",
        overflow: "hidden",
        zIndex: 2000,
        ":hover": { boxShadow: "0 5px 20px #0066ff62" },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "1px",
          background:
            "linear-gradient(90deg, blue, white, blue, white, blue, white, blue)",
          backgroundSize: "300% 100%",
          animation: "rgbBorder 10s linear infinite",
        },
        "@keyframes rgbBorder": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 3 },
          minHeight: { xs: 55, md: 65 },
        }}
      >
        {/* Left: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "800",
              fontFamily: "'Montserrat', sans-serif",
              background: "linear-gradient(270deg, #FFFFFF, #68b0ddff, #FFFFFF)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 6s ease-in-out infinite alternate",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "0% 50%" },
                "100%": { backgroundPosition: "100% 50%" },
              },
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            Football
          </Typography>
          <Box
            sx={{
              background: "linear-gradient(135deg, #0073E6, #FFFFFF, #0073E6)",
              borderRadius: "6px",
              px: { xs: 0.8, md: 1.2 },
              py: { xs: 0.1, md: 0.2 },
              ml: 0.3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "800",
                color: "#0B0F0D",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
              }}
            >
              Hub
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        {loading ? (
          <CircularProgress sx={{ color: "#00e5ff" }} size={28} />
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, md: 2 },
              alignItems: "center",
            }}
          >
            {/* Not logged in */}
            {!isLogin &&
              menuItems.map((btn, idx) => (
                <Button
                  key={idx}
                  startIcon={btn.icon}
                  component={Link}
                  to={btn.text.toLowerCase()}
                  variant="outlined"
                  sx={{
                    px: { xs: 1.5, md: 3 },
                    py: { xs: 0.5, md: 1 },
                    fontWeight: 900,
                    color: "#00aeff",
                    fontSize: { xs: "0.7rem", md: "0.8rem" },
                    borderRadius: "10px",
                    border: "1px solid #00aeff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.01)",
                      boxShadow: "0 5px 15px #00aeff73",
                    },
                  }}
                >
                  {btn.text}
                </Button>
              ))}

            {/* Logged in */}
            {isLogin && (
              <>
                {/* Points */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: { xs: 1, md: 1.5 },
                    py: { xs: 0.3, md: 0.5 },
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #00f7ffff, #00ccffff)",
                    boxShadow: "0 0 6px rgba(0, 255, 242, 0.6)",
                  }}
                >
                  <PaidIcon sx={{ color: "#000000ff", fontSize: 20 }} />
                  <Typography
                    sx={{
                      color: "#000",
                      fontWeight: "bold",
                      fontSize: { xs: "0.7rem", md: "0.85rem" },
                    }}
                  >
                    {currentPlayer.points}
                  </Typography>
                </Box>

                {/* Notifications */}
                <Tooltip title="Notifications">
                  <IconButton
                    component={Link}
                    to="/notification"
                    sx={{
                      color: "#00aeff",
                      p: { xs: 0.5, md: 1 },
                      ...(vibrateNotif && vibrateAnimation),
                    }}
                    onClick={() => triggerVibrate(setVibrateNotif)}
                  >
                    <Badge
                      badgeContent={currentPlayer?.notifications?.length || 0}
                      color="error"
                    >
                      <NotificationsIcon
                        sx={{ fontSize: { xs: "1.3rem", md: "1.7rem" } }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Profile */}
                <Tooltip title="Profile">
                  <IconButton component={Link} to="/profile" sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        borderRadius: "50%",
                        background:
                          "conic-gradient(from 180deg, #ff0057, #ff7a00, #ffdd00, #00eaff, #ff0057)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        src={currentPlayer?.imageUrl || ""}
                        sx={{
                          width: { xs: 34, md: 42 },
                          height: { xs: 34, md: 42 },
                          bgcolor: currentPlayer?.imageUrl
                            ? "transparent"
                            : "#0d6efd",
                          fontWeight: "bold",
                          fontSize: { xs: "0.8rem", md: "0.95rem" },
                          color: "#fff",
                        }}
                      >
                        {!currentPlayer?.imageUrl &&
                          (currentPlayer?.name?.[0]?.toUpperCase() || "P")}
                      </Avatar>
                    </Box>
                  </IconButton>
                </Tooltip>

                {/* Name */}
                {!isMobile && (
                  <Typography
                    sx={{
                      color: "#00aeff",
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", md: "1.5rem" },
                      textShadow: "0px 0px 1px rgba(0, 0, 0, 1)",
                    }}
                  >
                    {currentPlayer.name}
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
