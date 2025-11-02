import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Rating,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useFootball } from "../FootballContext";

export default function RatePlayers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentPlayer } = useFootball()
  const { opponentPlayers = [], opponentTeam, playerEmail, notifId } = location.state || {};
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  if (!opponentTeam || !opponentPlayers.length) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Typography variant="h6">No opponent players found!</Typography>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            mt: 2,
            border: "1px solid #00eaffff",
            color: "#00eaffff",
            "&:hover": { background: "#00eaff0e" },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const handleRatingChange = (email, value) => {
    setRatings((prev) => ({ ...prev, [email]: value }));
  };

  const allRated =
    opponentPlayers.length > 0 &&
    opponentPlayers.every((p) => ratings[p.email] !== undefined);

  const handleSubmitRatings = async () => {
    try {
      setLoading(true);

      // ✅ Correct property name ("value" instead of "rating")
      const ratingData = Object.entries(ratings).map(([email, value]) => ({
        email,
        value,
      }));

      const res = await axios.post("https://footballhub.azurewebsites.net/players/rate", {
        ratings: ratingData,
      }, { withCredentials: true });

      if (res.data.success) {
        await axios.post(`https://footballhub.azurewebsites.net/players/${playerEmail}/notifications/${notifId}`,{},{ withCredentials: true });
        // ✅ Update currentPlayer state (remove from notifications)
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notifId),
        }));
        navigate("/notification");
        toast.success("All ratings submitted successfully!");

      } else {
        throw new Error(res.data.message || "Failed to submit ratings");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, color: "#fff" }}>
      {/* 🏆 Team Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Avatar
          src={opponentTeam.logoUrl}
          alt={opponentTeam.name}
          sx={{
            width: 150,
            height: 150,
            mx: "auto",
            mb: 3,
            border: "10px solid #00ccff",
            boxShadow: "0 0 30px rgba(0, 204, 255,0.6)",
            borderRadius: 10,
          }}
        />
        <Typography variant="h4" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
          {opponentTeam.name}
        </Typography>
        <Typography variant="body1" color="gray" sx={{ mt: 1 }}>
          📍 {opponentTeam.location} &nbsp; | &nbsp; 🏗 Founded {opponentTeam.foundedYear}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Rating
            value={Number(opponentTeam.ratingAvg) || 0}
            precision={0.5}
            readOnly
            sx={{
              "& .MuiRating-iconFilled": { color: "#FFD700" },
              "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.3)" },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "#FFD700",
              mt: 0.5,
              textShadow: "0 0 6px rgba(255,215,0,0.6)",
            }}
          >
            Avg Rating: {opponentTeam.ratingAvg?.toFixed(1) || 0}/5 ({opponentTeam.ratingCount || 0} reviews)
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />


      {/* ✨ Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{
          textAlign: "center",

          mb: 5,
          fontWeight: 600,
          color: "#ffffffff",
          textShadow: "0 0 8px #00000066",
        }}
      >
        ⭐ Rate These Players
      </Typography>

      {/* 👥 Players List */}
      <Box sx={{ display: "grid", gap: 3 }}>
        {opponentPlayers.map((player, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              sx={{
                background: "#111",
                borderRadius: 3,
                border: "1px solid #2e2e2eff",
                //boxShadow: "0 0 15px #00eaff20",
                "&:hover": {
                  //transform: "scale(1.01)",
                  //boxShadow: "0 0 25px #00eaff30",
                  border: "1px solid #00eaff98",

                },
                transition: "0.25s",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={player.imageUrl}
                    alt={player.name}
                    sx={{
                      width: 60,
                      height: 60,
                      border: "1px solid #b3b3b3ff",
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 16, color: "#fff" }}>
                      {player.name}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                      {player.position || "Unknown"}
                    </Typography>

                  </Box>
                </Box>

                <Box sx={{ textAlign: "center", minWidth: 120 }}>
                  <Rating
                    value={ratings[player.email] || 0}
                    precision={0.5}
                    onChange={(e, newValue) =>
                      handleRatingChange(player.email, newValue)
                    }
                    sx={{
                      "& .MuiRating-iconEmpty": { color: "#444" },
                      "& .MuiRating-iconFilled": { color: "#FFD700" },
                    }}
                  />
                  <Typography sx={{ fontSize: 13, color: "#ccc", mt: 0.3 }}>
                    {ratings[player.email]
                      ? `${ratings[player.email]}/5`
                      : "Not Rated"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* 🚀 Submit Button */}
      <Box sx={{ mt: 5, textAlign: "center" }}>
        {!allRated && (
          <Typography sx={{ color: "#ff6f6f", mb: 1, fontSize: 14 }}>
            Please rate all players before submitting.
          </Typography>
        )}
        <Button
          onClick={handleSubmitRatings}
          disabled={!allRated || loading}
          sx={{
            px: 5,
            py: 1.2,
            fontWeight: 600,
            border: "1px solid #00eaff",
            color: "#00eaff",
            borderRadius: "50px",
            textTransform: "uppercase",
            "&:hover": { background: "#00eaff15" },
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: "#00eaff" }} />
          ) : (
            "Submit Ratings"
          )}
        </Button>
      </Box>
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />

    </Box>
  );
}
