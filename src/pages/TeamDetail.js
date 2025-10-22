import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Rating,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  Modal
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { useFootball } from "../FootballContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchIcon from "@mui/icons-material/Search";


export default function TeamDetail() {
  const { isLogin, currentPlayer } = useFootball();
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState(location.state?.team);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [trophyCounts, setTrophyCounts] = useState({});
  const [trophyDetails, setTrophyDetails] = useState({});
  const [joinLoading, setJoinLoading] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showInviteBox, setShowInviteBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [inviting, setInviting] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoadingSearch(true);
      const res = await axios.get(
        `https://footballhub.azurewebsites.net/players/search?q=${searchQuery}`
      );
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setLoadingSearch(false);
    }
  };

  const handleInvite = async (playerId) => {
    try {
      setInviting(playerId);
      const res = await axios.post(
        `https://footballhub.azurewebsites.net/teams/${team.id}/invite/${playerId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Invite sent successfully!");
        setSearchQuery("");
        setSearchResults((prev) => prev.filter((p) => p.id !== playerId));
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setInviting(null);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      setLeaveLoading(true);

      const res = await axios.delete(
        `https://footballhub.azurewebsites.net/teams/${team.id}/leave`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        // ✅ Refresh team data after leaving
        setTeam((prev) => ({
          ...prev,
          teamPlayers: prev.teamPlayers.filter(
            (p) => p !== currentPlayer.email
          ),
        }));
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (currentPlayer?.email && team?.captain) {
      setCanUpdate(currentPlayer.email === team.captain);
    }
  }, [currentPlayer, team]);

  // ==== Remove Player Function ====
  const handleRemovePlayer = async (email) => {
    try {
      setRemoveLoading(email);
      await axios.put(
        `https://footballhub.azurewebsites.net/teams/${team.id}`,
        { removePlayer: email },
        { withCredentials: true }
      );
      toast.success("Player removed successfully!");
      setPlayers((prev) => prev.filter((p) => p.email !== email));
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setRemoveLoading(null);
    }
  };

  const handleJoinTeam = async () => {
    if (!team?.id) return;
    try {
      setJoinLoading(true);
      const res = await axios.post(`https://footballhub.azurewebsites.net/teams/${team.id}/request`, {}, {
        withCredentials: true, // agar cookie/token auth use ho rahi hai
      });

      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Failed to send request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong, Please try again later!")

    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (!team?.achievements || team.achievements.length === 0) {
      setLoadingAchievements(false);
      return;
    }

    const fetchTrophies = async () => {
      setLoadingAchievements(true);
      try {
        const counts = {};
        const details = {};

        // Filter only trophy IDs (exclude MOTM if present)
        const trophyIds = team.achievements.filter((id) => !id.startsWith("MOTM"));

        const results = await Promise.all(
          trophyIds.map(async (id) => {
            try {
              const res = await axios.get(`https://footballhub.azurewebsites.net/trophies/${id}`);
              return res.data.data || null;
            } catch (err) {
              return null;
            }
          })
        );

        results.forEach((trophy) => {
          if (trophy) {
            counts[trophy.id] = (counts[trophy.id] || 0) + 1;
            details[trophy.id] = trophy;
          }
        });

        setTrophyCounts(counts);
        setTrophyDetails(details);
      } catch (err) {
        toast.error("Something went wrong, Please try again later!")
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchTrophies();
  }, [team]);

  // Fetch all players for this team
  useEffect(() => {
    if (!team?.teamPlayers?.length) {
      setLoadingPlayers(false);
      return;
    }

    const fetchPlayers = async () => {
      try {
        setLoadingPlayers(true);

        const playerPromises = team.teamPlayers.map((email) =>
          axios.get(`https://footballhub.azurewebsites.net/players/${email}`).then((res) => res.data.data)
        );

        const fetchedPlayers = await Promise.all(playerPromises);
        setPlayers(fetchedPlayers);
      } catch (error) {
        toast.error("Something went wrong, Please try again later!")

      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [team]);

  // Handle team loading
  useEffect(() => {
    if (!team) return;
    setLoading(false);
  }, [team]);

  if (!team) {
    return (
      <Typography
        color="error"
        sx={{ mt: 10, textAlign: "center", fontFamily: "Orbitron, sans-serif" }}
      >
        ❌ No team data found.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 15 }}>
        <CircularProgress color="info" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 15,
        px: 3,
        color: "white",
        fontFamily: "Orbitron, sans-serif",
      }}
    >
      {/* TEAM HEADER */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Avatar
          src={team.logoUrl}
          alt={team.name}
          sx={{
            width: 180,
            height: 180,
            mx: "auto",
            mb: 3,
            border: "10px solid #00ccff",
            boxShadow: "0 0 30px rgba(0, 204, 255,0.6)",
            borderRadius: 10,
          }}
        />
        <Typography variant="h3" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
          {team.name}
        </Typography>
        <Typography variant="body1" color="gray" sx={{ mt: 1 }}>
          📍 {team.location} &nbsp; | &nbsp; 🏗 Founded {team.foundedYear}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Rating
            value={Number(team.ratingAvg) || 0}
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
            Avg Rating: {team.ratingAvg?.toFixed(1) || 0}/5 ({team.ratingCount || 0} reviews)
          </Typography>
        </Box>
        {/* ==== Floating Join Team Button (Top Section) ==== */}
        {canUpdate ?
          <EditTeamBox
            team={team}
            onUpdated={(newTeam) => {
              setTeam(newTeam); // Refresh the team data after update
            }}
            players={players}
          />
          :
          <>
            {isLogin && (
              <Box
                sx={{
                  position: "relative",
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {team.teamPlayers.includes(currentPlayer.email) ? (
                  // ✅ Leave Team Button
                  <Button
                    onClick={handleLeaveTeam}
                    disabled={leaveLoading}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: "50px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      color: "#fff",
                      background: "linear-gradient(135deg, #ff4081, #ff1744)",
                      boxShadow: "0 6px 20px rgba(255,23,68,0.4)",
                      transition: "0.3s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ff1744, #ff4081)",
                        boxShadow: "0 8px 25px rgba(255,23,68,0.6)",
                      },
                    }}
                  >
                    {leaveLoading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Leave Team"
                    )}
                  </Button>
                ) : (
                  // ✅ Join Team Button
                  <Button
                    onClick={handleJoinTeam}
                    disabled={joinLoading}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: "50px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      color: "#fff",
                      background: "linear-gradient(135deg, #00e5ff, #0077ff)",
                      boxShadow: "0 6px 20px rgba(0,229,255,0.4)",
                      transition: "0.3s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0077ff, #00e5ff)",
                        boxShadow: "0 8px 25px rgba(0,229,255,0.6)",
                      },
                    }}
                  >
                    {joinLoading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Join Team"
                    )}
                  </Button>
                )}
              </Box>
            )}


          </>
        }
      </Box>
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />
      {/* ==== Team Players Section ==== */}
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 2, textTransform: "uppercase" }}
        >
          🧑‍🤝‍🧑 Team Players 🧑‍🤝‍🧑
        </Typography>
        {canUpdate && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowInviteBox(true)}
            sx={{
              color: "#00e5ff",
              borderRadius: "30px",
              px: 5,
              py: 1.2,
              mb: 5,
              fontWeight: "bold",
              borderColor: "rgba(255,255,255,0.2)",
              "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
            }}
          >
            Invite Player
          </Button>
        )}

        {loadingPlayers ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress color="info" />
          </Box>
        ) : players.length === 0 ? (
          <Typography color="gray" sx={{ mt: 5 }}>
            ⚠️ There is no players in this team.
          </Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {players.map((player) => {
              const handleClick = () => {
                navigate(`/players/${player.email}`, { state: { player } });
              };

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={player.email}>
                  <Card
                    onClick={handleClick}
                    sx={{
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      transition: "0.3s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      overflow: "visible", // 👈 Important so button can overflow outside
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 0 20px rgba(0,229,255,0.3)",
                      },
                    }}
                  >
                    {/* === Floating Remove Icon (Captain Only) === */}
                    {canUpdate && team.captain !== player.email && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlayer(player.email);
                        }}
                        disabled={removeLoading === player.email}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          zIndex: 10,
                          width: 30,
                          height: 30,
                          borderRadius: "8px",
                          background: "rgba(39, 39, 39, 1)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ff5252",
                          boxShadow: "0 0 5px rgba(0, 0, 0, 1)",
                          transition: "0.25s",
                          "&:hover": {
                            background: "rgba(255,0,0,0.3)",
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        {removeLoading === player.email ? (
                          <CircularProgress
                            size={20}
                            thickness={5}
                            sx={{
                              color: "#ff5252",
                            }}
                          />
                        ) : (
                          <CloseIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    )}

                    {/* === Player Details === */}
                    <CardContent sx={{ textAlign: "center", px: 2, pb: 2 }}>
                      {/* Avatar with Captain Chip */}
                      <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                        <Avatar

                          src={player.imageUrl}
                          alt={player.name}
                          sx={{
                            width: 100,
                            height: 100,
                            border: "3px solid #00e5ff",
                          }}
                        />
                        {team.captain === player.email && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 5,
                              right: 5,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #FFD700, #FFA500)",
                              color: "#111",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                            }}
                          >
                            C
                          </Box>
                        )}
                      </Box>

                      {/* Player Info */}
                      <Typography variant="h6" fontWeight="bold" color="white">
                        {player.name}
                      </Typography>
                      <Typography variant="body2" color="gray" sx={{ mb: 1 }}>
                        ⚽ {player.position || "Unknown"}
                      </Typography>

                      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 1 }} />

                      {/* Rating */}
                      <Box sx={{ width: "85%", mx: "auto", mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Number(player.overalRating)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            "& .MuiLinearProgress-bar": {
                              background: "linear-gradient(135deg, #FFD700, #FFA500)",
                            },
                            backgroundColor: "rgba(255,255,255,0.1)",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="gray" sx={{ fontWeight: 600 }}>
                        {player.overalRating?.toFixed(1) || 0}%
                      </Typography>
                      <Box sx={{ height: 8 }} />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />
      {/* ==== Team Performance Stats Section ==== */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 4, textTransform: "uppercase" }}
        >
          📊 Team Performance Stats
        </Typography>

        <Grid container spacing={3} justifyContent="center" textAlign="center">
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎮 Matches Played
            </Typography>
            <Typography variant="h6" color="gray">
              {team.matchesPlayed || 0}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              🏆 Wins
            </Typography>
            <Typography variant="h6" color="gray">
              {team.wins || 0}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              ❌ Losses
            </Typography>
            <Typography variant="h6" color="gray">
              {team.losses || 0}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              🤝 Draws
            </Typography>
            <Typography variant="h6" color="gray">
              {team.draws || 0}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              📈 Win Rate
            </Typography>
            <Typography variant="h6" color="gray">
              {team.matchesPlayed > 0
                ? `${Math.round((team.wins / team.matchesPlayed) * 100)}%`
                : "0%"}
            </Typography>
          </Grid>


        </Grid>

        {/* Optional: Divider for next section */}
      </Box>
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />
      {/* ==== Team Achievements Section ==== */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 4, textTransform: "uppercase", letterSpacing: "2px" }}
        >
          🏆 Team Achievements
        </Typography>

        {loadingAchievements ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 180,
                  height: 200,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.1)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </Box>
        ) : Object.keys(trophyCounts).length === 0 ? (
          <Typography variant="body1" color="gray" align="center">
            No team achievements yet.
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {Object.entries(trophyCounts).map(([trophyId, count]) => {
              const trophy = trophyDetails[trophyId];
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={trophyId}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(12px)",
                      border: "2px solid rgba(255,215,0,0.5)",
                      textAlign: "center",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "scale(1.04)",
                        boxShadow: "0 0 15px 0.1px rgba(255,215,0,0.5)",
                      },
                    }}
                  >
                    <Avatar
                      src={trophy?.icon}
                      alt={trophy?.title}
                      sx={{
                        width: 90,
                        height: 90,
                        mx: "auto",
                        mb: 2,
                        border: "3px solid gold",
                        boxShadow: "0 0 12px rgba(255,215,0,0.7)",
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#FFD700", mb: 1 }}>
                      {trophy?.title}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        px: 2,
                        py: 0.5,
                        display: "inline-block",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #00e5ff, #0077ff)",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        boxShadow: "0 0 8px rgba(0,229,255,0.5)",
                      }}
                    >
                      Won {count} {count > 1 ? "times" : "time"}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}

      </Box>
      <Divider sx={{ my: 5, mb: 10, borderColor: "rgba(255,255,255,0.2)" }} />
      <Dialog
        open={showInviteBox}
        onClose={() => setShowInviteBox(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "rgba(20, 25, 35, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 200, 255, 0.15)",
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#00d8ff",
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          Invite Player
        </DialogTitle>

        <DialogContent>
          {/* 🔍 Search Bar */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Search by name, email or position"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              InputLabelProps={{
                sx: {
                  color: "rgba(255,255,255,0.6)",
                  "&.Mui-focused": { color: "#00d8ff" },
                },
              }}
              InputProps={{
                sx: {
                  borderRadius: 3,

                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00d8ff",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00d8ff",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loadingSearch}
              sx={{
                px: 3,
                fontWeight: 600,
                background: "linear-gradient(135deg, #00bcd4, #007bff)",
                textTransform: "none",
                borderRadius: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #0095c7, #0066cc)",
                },
              }}
            >
              {loadingSearch ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Search"
              )}
            </Button>
          </Box>

          {/* 📜 Results */}
          <Box sx={{ mt: 1, maxHeight: 340, overflowY: "auto" }}>
            {searchResults.length === 0 && !loadingSearch ? (
              <Typography
                sx={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.7)",
                  mt: 3,
                  fontStyle: "italic",
                }}
              >
                No players found.
              </Typography>
            ) : (
              searchResults.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    p: 1.8,
                    mb: 1.2,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "0.3s ease",
                    "&:hover": {
                      background: "rgba(0,216,255,0.1)",
                      borderColor: "rgba(0,216,255,0.4)",
                      //transform: "translateY(-3px)",
                    },
                  }}
                >
                  {/* 👤 Player Info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={p.imageUrl}
                      alt={p.name}
                      sx={{
                        width: 54,
                        height: 54,
                        border: "2px solid rgba(0,216,255,0.5)",
                      }}
                    />
                    <Box>
                      <Typography sx={{ color: "white", fontWeight: 600 }}>
                        {p.name}
                      </Typography>
                      {/* <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {p.email}
                      </Typography> */}
                      <Typography
                        variant="caption"
                        sx={{ color: "#00d8ff", fontWeight: 600 }}
                      >
                        {p.position || "Unknown"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 📨 Invite Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={inviting === p.id}
                    onClick={() => handleInvite(p.id)}
                    sx={{
                      borderColor: "rgba(0,216,255,0.5)",
                      color: "#00d8ff",
                      fontWeight: "bold",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#00d8ff",
                        background: "rgba(0,216,255,0.1)",
                        boxShadow: "0 0 8px rgba(0,216,255,0.3)",
                      },
                    }}
                  >
                    {inviting === p.id ? (
                      <CircularProgress size={18} sx={{ color: "#00d8ff" }} />
                    ) : (
                      "Invite"
                    )}
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}


function EditTeamBox({ team, onUpdated, players }) {
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(team.name || "");
  const [location, setLocation] = useState(team.location || "");
  const [captain, setCaptain] = useState(team.captain || "");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(team.logoUrl || "");
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  // ================== Create Match ==================
  const [showMatchBox, setShowMatchBox] = useState(false);
  const [trophies, setTrophies] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTrophy, setSelectedTrophy] = useState("");
  const [opponentTeam, setOpponentTeam] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  //location
  const [openMap, setOpenMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [locationInput, setLocationInput] = useState(""); // ye hi backend me bhejna hai
  const [searchText, setSearchText] = useState("");
  const [mapCenter, setMapCenter] = useState([31.5204, 74.3587]); // Lahore default
  const [locationName, setLocationName] = useState("");
  const [isSearching, setIsSearching] = useState(false);


  function LocationSelector({ onSelect }) {
    useMapEvents({
      click(e) {
        onSelect(e.latlng);
      },
    });
    return null;
  }


  const handleLocationSelect = async (latlng) => {
    setCoordinates(latlng);
    setLocationInput(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    setMapCenter(latlng);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      if (data?.display_name) {
        setLocationName(data.display_name); // 👈 e.g., "Park View City, Lahore, Punjab, Pakistan"
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    }
  };



  // 🧩 Fetch Trophies & Teams when box opens
  useEffect(() => {
    if (showMatchBox) {
      const fetchData = async () => {
        try {
          setFetchingData(true);
          const [trophyRes, teamRes] = await Promise.all([
            axios.get("https://footballhub.azurewebsites.net/trophies"),
            axios.get("https://footballhub.azurewebsites.net/teams"),
          ]);
          setTrophies(trophyRes.data.data || []);
          setTeamsList(teamRes.data.data || []);
        } catch (err) {
          toast.error("Something went wrong, Please try again later!")

        } finally {
          setFetchingData(false);
        }
      };
      fetchData();
    }
  }, [showMatchBox]);

  // 🧮 Fee distribution (add this near your state variables)
  const [teamShare, setTeamShare] = useState(0);
  const [perPlayerShare, setPerPlayerShare] = useState(0);
  const [validPlayers, setValidPlayers] = useState(false);

  // ✅ Auto-calculate when trophy or players change
  useEffect(() => {
    if (!selectedTrophy) return;
    const t = trophies.find((x) => x.id === selectedTrophy);
    if (!t) return;

    const share = Math.floor((t.fee || 0) / 2);
    setTeamShare(share);

    const perPlayer = Math.floor(
      share / (selectedPlayers.length || players.length || 1)
    );
    setPerPlayerShare(perPlayer);
  }, [selectedTrophy, selectedPlayers, players, trophies]);

  // ✅ Select all players by default
  useEffect(() => {
    if (players?.length) setSelectedPlayers(players.map((p) => p.email));
  }, [players]);

  // ✅ Validation: check each player's points
  useEffect(() => {
    if (!players.length || !teamShare) return;
    const perPlayer = Math.floor(teamShare / (selectedPlayers.length || 1));
    const invalid = players.some(
      (p) => selectedPlayers.includes(p.email) && p.points < perPlayer
    );
    setValidPlayers(!invalid);
  }, [selectedPlayers, players, teamShare]);


  // 🧩 Handle Challenge Submit
  const handleCreateMatch = async () => {
    if (!validPlayers)
      return toast.error("Some players don’t have enough points to join this match!");

    if (
      !selectedTrophy ||
      !opponentTeam ||
      selectedPlayers.length === 0 ||
      !coordinates ||  // ✅ changed from locationInput to coordinates
      !startTime ||
      !endTime
    ) {
      toast.error("Please fill all fields before creating the match.");
      return;
    }

    // 🕒 Time & Date Validation
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      toast.error("Start time must be in the future!");
      return;
    }

    if (
      start.getFullYear() !== end.getFullYear() ||
      start.getMonth() !== end.getMonth() ||
      start.getDate() !== end.getDate()
    ) {
      toast.error("Start and end time must be on the same day!");
      return;
    }

    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 30) {
      toast.error("Match duration must be at least 30 minutes.");
      return;
    }
    if (diffMinutes > 90) {
      toast.error("Match duration cannot exceed 90 minutes.");
      return;
    }

    try {
      setLoadingMatch(true);
      const res = await axios.post(
        "https://footballhub.azurewebsites.net/match",
        {
          trophyId: selectedTrophy,
          opponentTeamId: opponentTeam,
          playersSelected: selectedPlayers,
          location: {
            name: locationName || "Unknown location",
            coordinates: {
              lat: coordinates.lat,
              lng: coordinates.lng,
            },
          },
          startTime,
          endTime,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Match created successfully and invitation sent!");
        setShowMatchBox(false);
        setSelectedTrophy("");
        setOpponentTeam("");
        setSelectedPlayers([]);
        setLocationInput("");
        setLocationName(""); // ✅ reset
        setCoordinates(null); // ✅ reset
        setStartTime("");
        setEndTime("");
      } else {
        toast.error(res.data.message || "Failed to create match");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setLoadingMatch(false);
    }
  };


  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await axios.delete(`https://footballhub.azurewebsites.net/teams/${team.id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Team deleted successfully!");
        setShowDeleteConfirm(false);
        setShowEdit(false);
        onUpdated(null);
        navigate("/teams");
      } else {
        toast.error(res.data.message || "Failed to delete team");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!")

    } finally {
      setDeleting(false);
    }
  };


  // Track any change to show Save button
  useEffect(() => {
    const changed =
      name !== team.name ||
      location !== team.location ||
      captain !== team.captain ||
      logo !== null;
    setHasChanges(changed);
  }, [name, location, captain, logo, team]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (name.trim()) formData.append("name", name.trim());
      if (location.trim()) formData.append("location", location.trim());
      if (captain.trim()) formData.append("newCaptain", captain.trim());
      if (logo) formData.append("logo", logo);

      const res = await axios.put(
        `https://footballhub.azurewebsites.net/teams/${team.id}`,
        formData,
        {
          withCredentials: true
        }
      );
      if (res.data.success) {
        toast.success("Team updated successfully!");
        onUpdated(res.data.data); // refresh parent
        setLogo(null);
        setHasChanges(false);
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong, Please try again later!")
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 5, textAlign: "center" }}>
      {/* ====== Action Buttons (Edit + Delete) ====== */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          onClick={() => setShowEdit(!showEdit)}
          sx={{
            color: "#00e5ff",
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },

          }}
        >
          {showEdit ? "Cancel Edit" : "Edit Your Team"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          sx={{
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            color: "#ff5252",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "&:hover": { borderColor: "#ff5252", background: "rgba(255,0,0,0.1)" },
          }}
        >
          {deleting ? (
            <>
              <CircularProgress size={20} sx={{ color: "#ff5252" }} />
              <span >Deleting...</span>
            </>
          ) : (
            "Delete Team"
          )}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowMatchBox(!showMatchBox)}
          sx={{
            color: "#00e5ff",
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
          }}
        >
          {showMatchBox ? "Cancel Match" : "Create Match"}
        </Button>
      </Box>

      {/* ====== Editable Box ====== */}
      {showEdit && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: "16px",
            background: "rgba(0, 46, 65, 0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: 500,
            mx: "auto",
            transition: "0.4s ease",
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold", color: "#00e5ff" }}
          >
            ✏️ Edit Team Info
          </Typography>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 130,
                height: 130,
                mx: "auto",
                borderRadius: "20px",
                border: "3px solid #00e5ff",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <Avatar
                src={preview}
                alt="Team Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "0px",
                  objectFit: "cover",
                }}
              />
            </Box>

            <Button
              variant="outlined"
              component="label"
              sx={{
                mt: 2.5,
                color: "#00e5ff",
                borderColor: "rgba(255,255,255,0.2)",
                fontWeight: 600,
                borderRadius: "25px",
                px: 4,
                "&:hover": {
                  borderColor: "#00e5ff",
                  background: "rgba(0,229,255,0.08)",
                },
              }}
            >
              Change Logo
              <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
            </Button>
          </Box>

          {/* ==== Input Fields ==== */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                sx: {
                  color: "gray",
                  "&.Mui-focused": { color: "#00e5ff" },
                },
              }}
              sx={{
                input: { color: "white" },
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.15)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00e5ff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00e5ff",
                },
              }}
            />

            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                sx: {
                  color: "gray",
                  "&.Mui-focused": { color: "#00e5ff" },
                },
              }}
              sx={{
                input: { color: "white" },
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.15)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00e5ff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00e5ff",
                },
              }}
            />

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel
                sx={{
                  color: "gray",
                  "&.Mui-focused": { color: "#00e5ff" },
                }}
              >
                Select Captain
              </InputLabel>

              <Select
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                label="Select Captain"
                displayEmpty
                renderValue={(selected) => {
                  const selectedPlayer = players?.find((p) => p.email === selected);
                  if (!selectedPlayer)
                    return <Typography sx={{ color: "gray" }}>Select Captain</Typography>;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={selectedPlayer.imageUrl}
                        alt={selectedPlayer.name}
                        sx={{
                          width: 28,
                          height: 28,
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      />
                      <Typography sx={{ fontSize: 15, color: "#fff" }}>
                        {selectedPlayer.name}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  color: "#fff",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.15)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00e5ff",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00e5ff",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "rgba(15,25,35,0.95)",
                      color: "white",
                      backdropFilter: "blur(8px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      mt: 1,
                    },
                  },
                }}
              >
                {players?.map((p) => (
                  <MenuItem
                    key={p.email}
                    value={p.email}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1,
                      px: 1.5,
                      m: 1,
                      borderRadius: "10px",
                      transition: "0.2s",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, rgba(0,229,255,0.15), rgba(0,119,255,0.15))",
                      },
                    }}
                  >
                    <Avatar
                      src={p.imageUrl}
                      alt={p.name}
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid rgba(0,229,255,0.3)",
                      }}
                    />
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                      {p.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>



          </Box>

          {/* ==== Save Button ==== */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="contained"
              sx={{
                mt: 4,
                px: 6,
                py: 1.3,
                borderRadius: "30px",
                fontWeight: "bold",
                background: "linear-gradient(135deg,#00e5ff,#0077ff)",
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </Box>
      )}
      {showMatchBox && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: "16px",
            background: "rgba(0, 46, 65, 0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: 600,
            mx: "auto",
            transition: "0.4s ease",
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold", color: "#00e5ff", textAlign: "center" }}
          >
            Create Match
          </Typography>

          {fetchingData ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress sx={{ color: "#00e5ff" }} />
              <Typography sx={{ color: "gray", mt: 1 }}>Loading data...</Typography>
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel
                  sx={{
                    color: "gray",
                    "&.Mui-focused": { color: "#00e5ff" },
                  }}
                >
                  Select Trophy
                </InputLabel>
                <Select
                  value={selectedTrophy}
                  onChange={(e) => setSelectedTrophy(e.target.value)}
                  label="Select Trophy"
                  renderValue={(selected) => {
                    const t = trophies.find((x) => x.id === selected);
                    if (!t) return "Select Trophy";
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={t.icon} sx={{ width: 30, height: 30, borderRadius: 2 }} />
                        <Typography sx={{ color: "#ffffffff", fontWeight: "bold" }}>{t.title}</Typography>
                      </Box>
                    );
                  }}
                  sx={{
                    color: "#fff",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#00e5ff" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00e5ff" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "rgba(0, 30, 45, 1)",
                        color: "#fff",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        maxHeight: 340,
                        "& .MuiMenuItem-root:hover": {
                          background: "rgba(0,229,255,0.15)",
                        },
                      },
                    },
                  }}
                >
                  {trophies.map((t) => (
                    <MenuItem
                      key={t.id}
                      value={t.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.7,
                        py: 1.5,
                        m: 1,
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={t.icon} sx={{ width: 30, height: 30, borderRadius: 2 }} />
                        <Typography sx={{ color: "#ffffffff", fontWeight: "bold" }}>{t.title}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        💰 <b>{t.fee}</b> points
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        🏅 Win: <b>{t.distribution.win}%</b> | ❌ Lose: <b>{t.distribution.lose}%</b>
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        ⚽ +{t.bonuses.goal} | 🎯 +{t.bonuses.assist} | 🧤 +{t.bonuses.motm}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>



              {/* ⚔️ Opponent Team */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel
                  sx={{
                    color: "gray",
                    "&.Mui-focused": { color: "#00e5ff" },
                  }}
                >
                  Select Opponent Team
                </InputLabel>
                <Select
                  value={opponentTeam}
                  onChange={(e) => setOpponentTeam(e.target.value)}
                  label="Select Opponent Team"
                  sx={{
                    color: "#fff",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#00e5ff" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00e5ff" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "rgba(0, 46, 65, 0.95)",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        maxHeight: 400,
                        "& .MuiMenuItem-root:hover": {
                          background: "rgba(0,229,255,0.15)",
                        },
                      },
                    },
                  }}
                >
                  {teamsList
                    .filter((t) => t.id !== team.id) // exclude current team
                    .map((t) => (
                      <MenuItem
                        key={t.id}
                        value={t.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          py: 1.5,
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar src={t.logoUrl} sx={{ width: 30, height: 30, borderRadius: 2 }} />
                          <Typography sx={{ color: "#ffffffff", fontWeight: "bold" }}>{t.name}</Typography>
                          <Typography sx={{ color: "#a1a1a1ff" }}>
                            Players: {t.teamPlayers?.length || 0}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>


              {/* 👥 Player Selection */}
              <Typography sx={{ color: "#00e5ff", mb: 1 }}>
                Select Your Players
              </Typography>

              {teamShare > 0 && (
                <Typography sx={{ color: "#aaa", mb: 1 }}>
                  💰 Your team needs <b>{teamShare}</b> pts — Each player will pay <b>{perPlayerShare}</b> pts
                </Typography>
              )}

              <Box
                sx={{
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  p: 1,
                  mb: 2,
                  mt: 2,
                }}
              >
                {players?.map((p) => {
                  const isSelected = selectedPlayers.includes(p.email);
                  const canAfford = p.points >= perPlayerShare;

                  return (
                    <Box
                      key={p.email}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        mb: 1,
                        borderRadius: "8px",
                        border: `1px solid ${isSelected ? (canAfford ? "#00ff88" : "#ff4444") : "rgba(255,255,255,0.1)"
                          }`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={p.imageUrl} sx={{ width: 32, height: 32 }} />
                        <Typography sx={{ color: "white" }}>{p.name}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                          sx={{
                            color: canAfford ? "#00e5ffaa" : "#ff7777",
                            fontSize: 13,
                            fontStyle: canAfford ? "normal" : "italic",
                          }}
                        >
                          {canAfford ? "" : "Not enough pts"}
                        </Typography>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedPlayers((prev) =>
                              checked
                                ? [...prev, p.email]
                                : prev.filter((id) => id !== p.email)
                            );
                          }}
                          sx={{
                            color: "#00e5ff",
                            "&.Mui-checked": { color: "#00ff88" },
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>


              {/* 📍 Location */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenMap(true)}
                sx={{
                  mb: 2,
                  color: "#e0f7fa",
                  borderColor: "rgba(255,255,255,0.15)",
                  "&:hover": { borderColor: "#00e5ff", color: "#00e5ff" },
                }}
              >
                {locationInput
                  ? `📍 Location Marked`
                  : "📍 Set Match Location"}
              </Button>


              {/* 🕒 Start & End Time */}
              <TextField
                label="🕒 Start Time"
                type="datetime-local"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                sx={{
                  mb: 2,
                  input: { color: "#e0f7fa" },
                  label: { color: "rgba(255,255,255,0.6)" },
                  "& label.Mui-focused": { color: "#00e5ff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "#00e5ff" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00e5ff",
                      boxShadow: "0 0 8px rgba(0,229,255,0.4)",
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="🏁 End Time"
                type="datetime-local"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                sx={{
                  mb: 3,
                  input: { color: "#e0f7fa" },
                  label: { color: "rgba(255,255,255,0.6)" },
                  "& label.Mui-focused": { color: "#00e5ff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "#00e5ff" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00e5ff",
                      boxShadow: "0 0 8px rgba(0,229,255,0.4)",
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />


              {/* ✅ Create Match Button */}
              <Button
                onClick={handleCreateMatch}
                disabled={loadingMatch || !validPlayers}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.3,
                  borderRadius: "30px",
                  fontWeight: "bold",
                  background: validPlayers
                    ? "linear-gradient(135deg,#00e5ff,#0077ff)"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                {loadingMatch ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Send Challenge"
                )}
              </Button>
            </>
          )}
        </Box>
      )}

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: "rgba(20,25,35,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,200,255,0.15)",
            borderRadius: 4,
            textAlign: "center",
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#00d8ff",
            fontWeight: 700,
            fontSize: "1.2rem",
            textAlign: "center",
            pb: 0,
          }}
        >
          Confirm Deletion
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              mt: 1,
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            Are you sure you want to delete this team? <br />
            <span style={{ color: "#ff6b6b" }}>
              This action cannot be undone.
            </span>
          </Typography>

          {/* 🧩 Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 3,
              mb: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setShowDeleteConfirm(false)} // ✅ Close only
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                borderRadius: 3,
                px: 3,
                "&:hover": {
                  borderColor: "#00d8ff",
                  color: "#00d8ff",
                  background: "rgba(0,216,255,0.08)",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={deleting}
              onClick={handleDelete} // ✅ clean direct call
              sx={{
                background: "linear-gradient(135deg, #ff4d4d, #d60000)",
                borderRadius: 3,
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #d60000, #ff4d4d)",
                  boxShadow: "0 0 12px rgba(255,77,77,0.4)",
                },
              }}
            >
              {deleting ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Delete"
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Modal open={openMap} onClose={() => setOpenMap(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95%",
            maxWidth: 700,
            height: 450,
            bgcolor: "#0a1929",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 🔍 Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <TextField
              placeholder="Search location (e.g., Park View City, Lahore)"
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}

              fullWidth
              sx={{

                input: {
                  color: "#e0f7fa",
                  fontSize: 14,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "#00e5ff" },
                },
              }}
            />
            <IconButton
              onClick={async () => {
                if (!searchText.trim()) return;
                setIsSearching(true); // 🔄 Start loading
                try {
                  // 🌍 Step 1: Forward Geocoding (search by name)
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`
                  );
                  const data = await res.json();

                  if (data?.length > 0) {
                    const { lat, lon } = data[0];
                    const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };

                    // 🗺️ Step 2: Reverse Geocoding (get readable address)
                    const reverseRes = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
                    );
                    const reverseData = await reverseRes.json();

                    const locationName = reverseData?.display_name || "Unknown Location";

                    // ✅ Step 3: Update States
                    setCoordinates(latlng);
                    setLocationInput(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
                    setLocationName(locationName);
                    setMapCenter(latlng);
                  } else {
                    alert("Location not found!");
                  }
                } catch (err) {
                  toast.error("Something went wrong, Please try again later!")

                } finally {
                  setIsSearching(false); // ✅ Stop loading
                }
              }}
              sx={{ color: "#00e5ff", ml: 1 }}
            >
              {isSearching ? (
                <CircularProgress size={22} sx={{ color: "#00e5ff" }} />
              ) : (
                <SearchIcon />
              )}
            </IconButton>
          </Box>

          {locationName && (
            <Typography sx={{ color: "#00e5ff", fontSize: 13, p: 1 }}>
              📍 {locationName}
            </Typography>
          )}




          {/* 🗺️ Map Container */}
          <Box sx={{ flexGrow: 1 }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
              key={JSON.stringify(mapCenter)} // ensures re-render
            >
              {/* 🌑 Dark Theme Tiles */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              //attribution="Tiles © Esri"
              />
              <LocationSelector
                onSelect={(latlng) => handleLocationSelect(latlng)}
              />
              {coordinates && (
                <Marker
                  position={coordinates}
                  icon={L.icon({
                    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    iconSize: [32, 32],
                    className: "drop-marker",
                  })}
                />
              )}
            </MapContainer>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}



