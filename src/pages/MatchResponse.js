import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Button,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFootball } from "../FootballContext";

export default function MatchResponse() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setCurrentPlayer } = useFootball()
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  // 🔹 Extract data
  const {
    match = null,
    trophy = {},
    myTeam = {},
    opponentTeam = {},
    myPlayers = [],
    oppTeamPlayers = [],
    notifId = null,
    playerEmail = null
  } = state || {};

  // 🧮 Fee distribution
  const teamShare = Math.floor((trophy.fee || 0) / 2);
  const perPlayerShare = Math.floor(
    teamShare / (selectedPlayers.length || myPlayers.length || 1)
  );

  // ✅ Default selection
  useEffect(() => {
    if (myPlayers.length) setSelectedPlayers(myPlayers.map((p) => p.email));
  }, [myPlayers]);

  // ✅ Validation (includes duplicate check)
  useEffect(() => {
    if (!myPlayers.length) return;

    const perPlayer = Math.floor(teamShare / (selectedPlayers.length || 1));

    const invalid = myPlayers.some((p) => {
      const isSelected = selectedPlayers.includes(p.email);
      const isDuplicate = oppTeamPlayers.some((opp) => opp.email === p.email);
      return isSelected && (p.points < perPlayer || isDuplicate);
    });

    setValid(!invalid && selectedPlayers.length > 0);
  }, [selectedPlayers, myPlayers, teamShare, oppTeamPlayers]);

  // ✅ Toggle selection
  const toggleSelect = (email) => {
    setSelectedPlayers((prev) =>
      prev.includes(email)
        ? prev.filter((id) => id !== email)
        : [...prev, email]
    );
  };

  // ✅ Handle Done
  const handleDone = async () => {
    if (!valid) return toast.error("Some players don’t have enough points!");
    try {
      setLoading(true);
      const res = await axios.put(
        `https://footballhub.azurewebsites.net/matches/${match.id}/response`,
        { action: "accept", playersSelected: selectedPlayers },
        { withCredentials: true }
      );

      if (res.data.success) {
        await axios.delete(`https://footballhub.azurewebsites.net/players/${playerEmail}/notifications/${notifId}`, { withCredentials: true });
        // ✅ Update currentPlayer state (remove from notifications)
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notifId),
        }));
        navigate("/notification");
        toast.success("Match has been Scheduled!");
      } else {
        toast.error("Failed to accept match");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/notification");

  // ⚠️ Fallback
  if (!state || !match) {
    return (
      <Box sx={{ color: "#fff", textAlign: "center", mt: 15 }}>
        <Typography>No match data found.</Typography>
        <Button
          onClick={() => navigate("/notification")}
          variant="outlined"
          sx={{ mt: 2, borderColor: "#00eaff", color: "#00eaff" }}
        >
          Back
        </Button>
      </Box>
    );
  }

  // 🎨 UI
  return (
    <Box sx={{ color: "#fff", p: { xs: 2, md: 4 } }}>
      {/* 🏆 TROPHY SECTION */}
      <Box
        sx={{
          textAlign: "center",
          mb: 5,
          p: 3,
          borderRadius: "16px",
          //border: "1px solid #00eaff55",
          //background: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <Avatar
          src={trophy.icon}
          sx={{
            width: 110,
            height: 110,
            mx: "auto",
            boxShadow: "0 0 20px #00eaffaa",
            borderRadius: 5,
            border: "5px solid #00e1ffff"
          }}
        />
        <Typography
          variant="h4"
          sx={{
            mt: 2,
            fontWeight: "bold",
            color: "#ffffffff",
            letterSpacing: 1,
          }}
        >
          {trophy.title || "Match Trophy"}
        </Typography>
        <Typography sx={{ color: "#aaa", mt: 1 }}>
          💰 Total Fee: <b>{trophy.fee || 0} pts</b> (Each team pays{" "}
          <b>{teamShare}</b>)
        </Typography>
        <Typography sx={{ color: "#aaa", mt: 0.5 }}>
          ⚖️ Win: <b>{trophy.distribution?.win}%</b> | Lose:{" "}
          <b>{trophy.distribution?.lose}%</b>
        </Typography>

        {/* Bonuses */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(trophy.bonuses || {}).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                background: "#00eaff22",
                px: 2,
                py: 0.6,
                borderRadius: "10px",
                minWidth: 100,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#00eaff",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {key}
              </Typography>
              <Typography sx={{ color: "#fff" }}>+{value} pts</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Divider sx={{ my: 5, mb: 8, borderColor: "#00eaff55" }} />

      {/* ⚔ TEAM COMPARISON */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        direction={{ xs: "column", md: "row" }} // 👈 mobile = vertical, desktop = horizontal
      >
        {/* 🟢 MY TEAM */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              background: "#111",
              border: "1px solid #00ff8855",
              borderRadius: "16px",
              width: "100%",
              height: 350,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar src={myTeam.logoUrl} sx={{ mr: 2, width: 50, height: 50 }} />
                <Typography sx={{ color: "#00ff88", fontWeight: "bold", fontSize: 18 }}>
                  {myTeam.name}
                </Typography>
              </Box>

              {/* 👇 NEW LINE ADDED */}
              <Typography sx={{ color: "#929292ff", mb: 2 }}>
                💰 Per Player Share: <b>{perPlayerShare}</b> pts
              </Typography>

              {/* Player List */}
              <Box
                sx={{
                  height: 250,
                  minWidth: 250,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#00eaff66",
                    borderRadius: 3,
                  },
                }}
              >
                {myPlayers.map((p) => {
                  const isSelected = selectedPlayers.includes(p.email);
                  const perPlayer = Math.floor(teamShare / (selectedPlayers.length || 1));
                  const canAfford = p.points >= perPlayer;
                  const isCaptain = p.email === myTeam.captain;
                  const isDuplicate = oppTeamPlayers.some((opp) => opp.email === p.email);

                  return (
                    <Box
                      key={p.email}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.2,
                        p: 1,
                        borderRadius: "8px",
                        border: `1px solid ${isSelected
                          ? isDuplicate
                            ? "#ff4444"
                            : canAfford
                              ? "#00ff88"
                              : "#ff4444"
                          : isDuplicate
                            ? "#ff4444"
                            : "#00eaff33"
                          }`,

                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={p.imageUrl} sx={{ width: 40, height: 40, mr: 1.5 }} />
                        <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                          {p.name}
                          {isCaptain && (
                            <Typography
                              component="span"
                              sx={{
                                color: "#FFD700",
                                fontSize: 13,
                                ml: 0.5,
                                fontWeight: "bold",
                              }}
                            >
                              (c)
                            </Typography>
                          )}
                        </Typography>
                      </Box>

                      <Typography sx={{ color: "#00eaffaa", fontSize: 13 }}>
                        {p.position}
                      </Typography>

                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelect(p.email)}
                        sx={{
                          color: "#00ff88",
                          "&.Mui-checked": { color: "#00ff88" },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ⚔ VS */}
        <Grid
          item
          xs={12}
          md={2}
          sx={{
            textAlign: "center",
            my: { xs: 2, md: 0 }, // space between boxes on mobile
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#00eaff",
              fontWeight: "bold",
              textShadow: "0 0 8px #00eaff",
            }}
          >
            ⚔ VS ⚔
          </Typography>
        </Grid>

        {/* 🔴 OPPONENT TEAM */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              background: "#111",
              border: "1px solid #ff555555",
              borderRadius: "16px",
              width: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar src={opponentTeam.logoUrl} sx={{ mr: 2, width: 50, height: 50 }} />
                <Typography sx={{ color: "#ff4444", fontWeight: "bold", fontSize: 18 }}>
                  {opponentTeam.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: 250,
                  minWidth: 250,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#ff444466",
                    borderRadius: 3,
                  },
                }}
              >
                {oppTeamPlayers.map((p) => {
                  const isCaptain = p.email === opponentTeam.captain;
                  return (
                    <Box
                      key={p.email}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.2,
                        p: 1,
                        borderRadius: "8px",
                        border: "1px solid #ff444433",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={p.imageUrl} sx={{ width: 40, height: 40, mr: 1.5 }} />
                        <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                          {p.name}
                          {isCaptain && (
                            <Typography
                              component="span"
                              sx={{
                                color: "#FFD700",
                                fontSize: 13,
                                ml: 0.5,
                                fontWeight: "bold",
                              }}
                            >
                              (c)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: "#ff8888aa", fontSize: 13 }}>
                        {p.position}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🎯 BUTTONS */}
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            borderColor: "#ff4444",
            color: "#ff4444",
            mr: 2,
            "&:hover": { borderColor: "#ff6666", background: "#ff000011" },
          }}
        >
          Back
        </Button>

        <Button
          onClick={handleDone}
          disabled={!valid || loading}
          variant="contained"
          sx={{
            background: valid ? "#00ff88" : "#555",
            color: "#000000ff",
            "&:hover": { background: "#00cc77" },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#ffffffff" }} /> : "Schedule Match"}
        </Button>
      </Box>
      <Divider sx={{ my: 5, mb: 10, borderColor: "#00eaff55" }} />
    </Box>
  );
}
