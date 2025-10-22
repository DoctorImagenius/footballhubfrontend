import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion } from "framer-motion";

export default function TeamSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const team = location.state?.team;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/teams");
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, rgba(0,183,255,0.1), rgba(0,183,255,0.03))",
        color: "white",
        textAlign: "center",
        p: 3,
      }}
    >
      {/* ✅ Success Icon Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      >
        <CheckCircleOutlineIcon
          sx={{ fontSize: 100, color: "#00eaff", mb: 2 }}
        />
      </motion.div>

      {/* 🖼️ Team Logo */}
      {team?.logoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Avatar
            src={team.logoUrl}
            sx={{
              width: 100,
              height: 100,
              border: "2px solid #00eaff",
              mb: 2,
              boxShadow: "0 0 20px rgba(0, 234, 255, 0.3)",
            }}
          />
        </motion.div>
      )}

      {/* 🎉 Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(90deg, #00eaff, #007bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Team Created Successfully!
        </Typography>

        <Typography variant="h6" sx={{ color: "#bbb", mb: 3 }}>
          {team?.name ? `Welcome, ${team.name} ⚽` : "Welcome to Football Hub!"}
        </Typography>

        <Typography sx={{ color: "#00eaff", fontSize: "0.95rem", mb: 4 }}>
          Redirecting to Teams page...
        </Typography>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #00eaff, #007bff)",
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              background: "linear-gradient(90deg, #007bff, #00eaff)",
            },
          }}
          onClick={() => navigate("/teams")}
        >
          Go to Teams Now
        </Button>
      </motion.div>
    </Box>
  );
}
