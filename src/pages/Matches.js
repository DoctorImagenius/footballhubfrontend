import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tab,
  Divider,
  Modal,
  Tabs
} from "@mui/material";
import { toast } from "react-toastify";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("final");
  const [teamCache, setTeamCache] = useState({});
  const [trophyCache, setTrophyCache] = useState({});
  const statuses = ["upcoming", "live", "completed", "final"];
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [allPlayers, setAllPlayers] = useState({});


  useEffect(() => {
    fetchMatches(activeStatus);
  }, [activeStatus]);

  useEffect(() => {
    if (activeStatus === "final" && matches.length > 0) {
      preloadPlayers(matches);
    }
  }, [matches, activeStatus]);

  const fetchMatches = async (status) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://footballhub.azurewebsites.net/matches?status=${status}`);
      if (res.data.success) {
        const matchesData = res.data.matches;
        setMatches(matchesData);
        await preloadData(matchesData);
      } else {
        setMatches([]);
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");
    } finally {
      setLoading(false);
    }
  };

  const preloadData = async (matchesData) => {
    const teamIds = [...new Set(matchesData.flatMap((m) => [m.myTeamId, m.opponentTeamId]))];
    const trophyIds = [...new Set(matchesData.map((m) => m.trophyId))];
    const teamCacheTemp = {};
    const trophyCacheTemp = {};

    await Promise.all([
      ...teamIds.map(async (id) => {
        try {
          const res = await axios.get(`https://footballhub.azurewebsites.net/teams/${id}`);
          if (res.data.success) {
            teamCacheTemp[id] = res.data.data;
          } else {
            teamCacheTemp[id] = {
              id,
              name: "Deleted Team",
              logoUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097110.png",
              location: "Unknown",
              captain: null,
            };
          }

        } catch {
          teamCacheTemp[id] = {
            id,
            name: "Deleted Team",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097110.png",
            location: "Unknown",
            captain: null,
          };
        }

      }),
      ...trophyIds.map(async (id) => {
        try {
          const res = await axios.get(`https://footballhub.azurewebsites.net/trophies/${id}`);
          if (res.data.success) trophyCacheTemp[id] = res.data.data;
        } catch {
          trophyCacheTemp[id] = {
            id,
            title: "Unknown",
            description: "This trophy record no longer exists.",
          };
        }

      }),
    ]);

    setTeamCache(teamCacheTemp);
    setTrophyCache(trophyCacheTemp);
  };

  const formatDateTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const preloadPlayers = async (matchesData) => {
    const playerIds = [
      ...new Set(
        matchesData.flatMap((m) => [
          ...(m.myTeamStats || []).map((p) => p.playerId),
          ...(m.oppTeamStats || []).map((p) => p.playerId),
          m.result?.motm,
        ])
      ),
    ].filter(Boolean);

    const temp = {};
    await Promise.all(
      playerIds.map(async (id) => {
        try {
          const res = await axios.get(`https://footballhub.azurewebsites.net/players/${id}`);
          if (res.data.success) {
            temp[id] = res.data.data;
          } else {
            temp[id] = {
              email: id,
              name: "Anonymous Player",
              imageUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
              position: "Unknown",
            };
          }

        } catch {
          temp[id] = {
            email: id,
            name: "Anonymous Player",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
            position: "Unknown",
          };
        }

      })
    );
    setAllPlayers(temp);
  };

  const renderMatchCard = (match) => {
    const myTeam = teamCache[match.myTeamId] || { name: "Deleted Team", logoUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097110.png" };
    const oppTeam = teamCache[match.opponentTeamId] || { name: "Deleted Team", logoUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097110.png" };
    const trophy = trophyCache[match.trophyId];

    if (!myTeam || !oppTeam || !trophy)
      return (
        <Box
          key={match.id}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 180,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      );

    const statusColor = {
      upcoming: "info",
      live: "error",
      completed: "secondary",
      final: "success",
    }[match.status];

    return (
      <Card
        key={match.id}
        sx={{
          p: 2,
          background: "linear-gradient(135deg,  #00b7ff18)",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          color: "white",
          cursor: "pointer",
          transition: "0.3s ease",
          "&:hover": { transform: "translateY(-5px)", boxShadow: "0 0 15px #00b7ff77" },
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "5px",
            height: "100%",
          },
        }}
      >
        <CardContent>
          {/* Header (Trophy) */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            {/* Left side – Trophy info */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmojiEventsIcon sx={{ fontSize: 18, color: "#FFD700" }} />
              <Typography sx={{ fontWeight: 600, color: "#FFD700" }}>
                {trophy.title}
              </Typography>
            </Stack>

            {/* Right side – Status Chip */}
            <Chip
              label={match.status.toUpperCase()}
              color={statusColor}
              size="small"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                height: 24,
                px: 0.8,
              }}
            />
          </Stack>

          <Divider sx={{ my: 1, borderColor: "#003950ff" }} />

          <Grid container spacing={2} alignItems="center" justifyContent="center" flexWrap="nowrap">

            <Grid item xs={5} textAlign="center">
              <Avatar
                src={myTeam.logoUrl}
                alt={myTeam.name}
                sx={{
                  width: 65,
                  height: 65,
                  mx: "auto",
                  mb: 0.5,
                }}
              />
              <Typography sx={{ fontWeight: 600 }}>{myTeam.name}</Typography>
            </Grid>

            <Grid item xs={2} textAlign="center">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#00e5ff",
                }}
              >
                VS
              </Typography>
            </Grid>

            <Grid item xs={5} textAlign="center">
              <Avatar
                src={oppTeam.logoUrl}
                alt={oppTeam.name}
                sx={{
                  width: 65,
                  height: 65,
                  mx: "auto",
                  mb: 0.5,
                  bgcolor: "#1a237e",
                }}
              />
              <Typography sx={{ fontWeight: 600 }}>{oppTeam.name}</Typography>
            </Grid>
          </Grid>


          <Divider sx={{ my: 1, borderColor: "#003950ff" }} />

          {/* Match Info Section */}
          <Box
            sx={{
              mt: 1.5,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              p: 1.2,
            }}
          >
            {/* 📍 Location + 🕒 Time */}
            <Stack
              direction={{ xs: "column", sm: "row" }} // 👈 mobile me column, desktop me row
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ flexWrap: "wrap" }}
            >
              {/* 📍 Location */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  color: "#bbb",
                  cursor: "pointer",
                  "&:hover": { color: "#00e5ff" },
                }}
                onClick={() => setSelectedMatch(match)}
              >
                <LocationOnIcon sx={{ fontSize: 18, color: "#4FC3F7" }} />
                <Typography variant="body2">
                  {match.location?.name?.split(",")[0] || "Unknown"}
                </Typography>
              </Box>

              {/* Divider — responsive */}
              <Divider
                orientation={{ xs: "horizontal", sm: "vertical" }} // 👈 change based on screen size
                flexItem
                sx={{
                  borderColor: "#4b4b4b81",
                  height: { sm: 18, xs: "1px" },
                  width: { sm: "auto" }, // 👈 little line in center when horizontal
                }}
              />

              {/* 🕒 Time */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "#bbb" }}>
                <AccessTimeIcon sx={{ fontSize: 18, color: "#4FC3F7" }} />
                <Typography variant="body2">{formatDateTime(match.startTime)}</Typography>
              </Box>
            </Stack>
            {/* 🌍 Location Preview Modal */}
            <Modal open={!!selectedMatch} onClose={() => setSelectedMatch(null)}>
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
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* 🧭 Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background:
                      "linear-gradient(90deg, rgba(0,229,255,0.15), rgba(0,229,255,0.05))",
                    borderBottom: "1px solid rgba(0,229,255,0.2)",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: "#4FC3F7", fontWeight: 600 }}>
                    📍 {selectedMatch?.location?.name || "Unknown Location"}
                  </Typography>
                  <Box
                    onClick={() => setSelectedMatch(null)}
                    sx={{ cursor: "pointer", color: "#bbb", "&:hover": { color: "#4FC3F7" } }}
                  >
                    ✖
                  </Box>
                </Box>

                {/* 🗺️ Map */}
                <Box sx={{ flex: 1 }}>
                  <MapContainer
                    center={[
                      selectedMatch?.location?.coordinates?.lat || 31.5204,
                      selectedMatch?.location?.coordinates?.lng || 74.3587,
                    ]}
                    zoom={14}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    {selectedMatch?.location?.coordinates && (
                      <Marker
                        position={[
                          selectedMatch.location.coordinates.lat,
                          selectedMatch.location.coordinates.lng,
                        ]}
                        icon={L.icon({
                          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                          iconSize: [32, 32],
                        })}
                      />
                    )}
                  </MapContainer>
                </Box>
              </Box>
            </Modal>
          </Box>
        </CardContent>
      </Card>
    );
  };

  function FinalMatchCard({ match, teamCache, trophyCache, allPlayers, formatDateTime }) {
    const [showDetails, setShowDetails] = useState(false);
    const [tab, setTab] = useState("my");
    const [openMapPreview, setOpenMapPreview] = useState(false);


    const myTeam = teamCache[match.myTeamId];
    const oppTeam = teamCache[match.opponentTeamId];
    const trophy = trophyCache[match.trophyId];

    if (!myTeam || !oppTeam || !trophy)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180 }}>
          <CircularProgress size={30} />
        </Box>
      );

    const isMyTeamWinner = match.result?.winner === match.myTeamId;
    const winnerTeam = isMyTeamWinner ? myTeam : oppTeam;
    const motm = allPlayers[match.result?.motm];

    return (
      <Card
        sx={{
          p: 1,
          background: "linear-gradient(135deg,  #00b7ff18)",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          color: "white",
          //cursor: "pointer",
          transition: "0.3s ease",
          "&:hover": { transform: "translateY(-5px)", boxShadow: "0 0 15px #00b7ff77" },
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "5px",
            height: "100%",
          },
        }}
      >
        <CardContent>
          {/* 🏆 Trophy Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" >
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmojiEventsIcon sx={{ color: "#FFD700" }} />
              <Typography sx={{ fontWeight: 600, color: "#FFD700" }}>{trophy.title}</Typography>
            </Stack>
            <Chip label="FINALIZED" color="success" size="small" sx={{ fontWeight: 700 }} />
          </Stack>
          <Divider sx={{ my: 1, borderColor: "#003950ff" }} />

          {/* 🏟 Team Section */}
          <Stack direction={{ xs: "row", sm: "row" }} justifyContent="space-around" alignItems="center" mb={1}>
            <Box textAlign="center">
              <Avatar src={myTeam.logoUrl} sx={{ width: 65, height: 65, mx: "auto", mb: 0.5 }} />
              <Typography sx={{ fontWeight: 600 }}>{myTeam.name}</Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#00e5ff" }}>
              {match.result?.myGoals} - {match.result?.oppGoals}
            </Typography>

            <Box textAlign="center">
              <Avatar src={oppTeam.logoUrl} sx={{ width: 65, height: 65, mx: "auto", mb: 0.5 }} />
              <Typography sx={{ fontWeight: 600 }}>{oppTeam.name}</Typography>
            </Box>
          </Stack>
          {/* <Divider sx={{ my: 1, borderColor: "#003950ff" }} /> */}


          <Typography align="center" sx={{ color: "gold", fontWeight: 600, mt: 1 }}>
            🏆 Winner: {winnerTeam.name}
          </Typography>
          <Typography align="center" sx={{ color: "#80deea", fontWeight: 600 }}>
            👑 MOTM: {motm?.name || match.result?.motm}
          </Typography>

          {/* Match Info Section */}
          <Box
            sx={{
              mt: 1.5,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              p: 1.2,
            }}
          >
            {/* 📍 Location + 🕒 Time */}
            <Stack
              direction={{ xs: "column", sm: "row" }} // 👈 mobile me column, desktop me row
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ flexWrap: "wrap" }}
            >
              {/* 📍 Location */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  color: "#bbb",
                  cursor: "pointer",
                  "&:hover": { color: "#00e5ff" },
                }}
                onClick={() => setOpenMapPreview(true)}
              >
                <LocationOnIcon sx={{ fontSize: 18, color: "#4FC3F7" }} />
                <Typography variant="body2">
                  {match.location?.name?.split(",")[0] || "Unknown"}
                </Typography>
              </Box>

              {/* Divider — responsive */}
              <Divider
                orientation={{ xs: "horizontal", sm: "vertical" }} // 👈 change based on screen size
                flexItem
                sx={{
                  borderColor: "#4b4b4b81",
                  height: { sm: 18, xs: "1px" },
                  width: { sm: "auto" }, // 👈 little line in center when horizontal
                }}
              />

              {/* 🕒 Time */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "#bbb" }}>
                <AccessTimeIcon sx={{ fontSize: 18, color: "#4FC3F7" }} />
                <Typography variant="body2">{formatDateTime(match.startTime)}</Typography>
              </Box>
            </Stack>


          </Box>

          {/* 🔘 Toggle Button */}
          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              color="info"
              onClick={() => setShowDetails(!showDetails)}
              sx={{
                borderRadius: "20px",
                textTransform: "capitalize",
                fontWeight: 600,
                borderColor: "#4FC3F7",
                color: "#4FC3F7",
                "&:hover": {
                  background: "linear-gradient(135deg, #0288D1, #4FC3F7)",
                  color: "white",
                },
              }}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </Button>
          </Box>

          {/* 📊 Details Section */}
          {showDetails && (
            <Box
              sx={{
                mt: 3,
                borderRadius: 3,
              }}
            >
              {/* 🧩 Tabs for Teams */}
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                centered
                sx={{
                  "& .MuiTab-root": {
                    color: "white",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  },
                  "& .Mui-selected": {
                    color: "#00e5ff !important",
                  },
                }}
              >
                <Tab value="my" label={myTeam.name} />
                <Tab value="opp" label={oppTeam.name} />
              </Tabs>

              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

              {/* 👥 Player Stats Section */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 1.5,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {(tab === "my" ? match.myTeamStats : match.oppTeamStats).map((ps, i) => {
                  const player = allPlayers?.[ps.playerId] || {
                    name: "Anonymous Player",
                    imageUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
                    position: "---",
                    age: "---"
                  };
                  return (
                    <Box
                      onClick={() => {
                        navigate(`/players/${player.email}`, { state: { player } });
                      }}
                      key={i}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "#00b7ff18",
                        borderRadius: 3,
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { border: "1px solid #00eeff33" },
                      }}
                    >

                      {/* 👤 Player Avatar */}
                      <Avatar
                        src={player.imageUrl || player.photoUrl}
                        alt={player.name}
                        sx={{
                          width: 60,
                          height: 60,
                          mb: 1,
                          border: "1px solid rgba(0,229,255,0.6)",
                        }}
                      />

                      {/* 🧾 Name */}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#fff",
                          fontSize: 15,
                          textAlign: "center",
                        }}
                      >
                        {player.name || ps.playerId}
                      </Typography>

                      {/* 🎯 Extra Info */}
                      <Typography sx={{ color: "#aaa", fontSize: 13, mb: 1 }}>
                        {player.position || "Unknown"} • Age {player.age || "?"}
                      </Typography>

                      {/* ⚽ Stats */}
                      <Stack
                        direction="row"
                        spacing={1.2}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ color: "#00e5ff", fontWeight: 600, fontSize: 14 }}
                      >
                        <Typography>⚽ {ps.goals || 0}</Typography>
                        <Typography>🎯 {ps.assists || 0}</Typography>
                        {ps.yellowCards && (
                          <Typography sx={{ color: "#FFD700" }}>
                            🟨 {ps.yellowCards}
                          </Typography>
                        )}

                        {ps.redCards && (
                          <Typography sx={{ color: "#FF5252" }}>
                            🟥 {ps.redCards}
                          </Typography>
                        )}

                      </Stack>
                    </Box>

                  );
                })}
              </Box>
            </Box>
          )}

        </CardContent>
        <Modal open={openMapPreview} onClose={() => setOpenMapPreview(false)}>
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
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 🧭 Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  "linear-gradient(90deg, rgba(0,229,255,0.15), rgba(0,229,255,0.05))",
                backdropFilter: "blur(6px)",
                borderBottom: "1px solid rgba(0,229,255,0.2)",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: "#4FC3F7", fontWeight: 600, fontSize: 16 }}
              >
                📍 {match.location?.name || "Unknown Location"}
              </Typography>

              <Box
                onClick={() => setOpenMapPreview(false)}
                sx={{
                  cursor: "pointer",
                  color: "#bbb",
                  transition: "0.3s",
                  "&:hover": { color: "#4FC3F7", transform: "scale(1.2)" },
                }}
              >
                ✖
              </Box>
            </Box>

            {/* 🗺️ Map Container */}
            <Box sx={{ flex: 1 }}>
              <MapContainer
                center={[
                  match.location?.coordinates?.lat || 31.5204,
                  match.location?.coordinates?.lng || 74.3587,
                ]}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                {match.location?.coordinates && (
                  <Marker
                    position={[
                      match.location.coordinates.lat,
                      match.location.coordinates.lng,
                    ]}
                    icon={L.icon({
                      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                      iconSize: [32, 32],
                    })}
                  />
                )}
              </MapContainer>
            </Box>
          </Box>
        </Modal>
      </Card>
    );
  }

  return (
    <Box p={3}>
      {/* 🔼 Header Section */}
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, md: 4 },
          mb: 4,
          color: "white",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mt: 5

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
            Match
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

        {/* 🟢 Status Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ mt: 4 }}
        >
          {statuses.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "contained" : "outlined"}
              color="info"
              onClick={() => setActiveStatus(status)}
              sx={{
                borderRadius: "25px",
                px: 4,
                py: 1.2,
                fontWeight: 600,
                width: { xs: "80%", sm: "auto" },
                textTransform: "capitalize",
                borderColor: "#4FC3F7",
                background:
                  activeStatus === status
                    ? "linear-gradient(135deg, #4FC3F7, #0288D1)"
                    : "transparent",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #0288D1, #4FC3F7)",
                },
              }}
            >
              {status === "final" ? "FINALIZED" : status.toUpperCase()}

            </Button>
          ))}
        </Stack>
      </Box>


      {/* 🔽 Matches Grid */}
      {loading ? (
        <Box
          sx={{
            height: "20vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <CircularProgress sx={{ color: "#00e5ff", mb: 2 }} />
          <Typography variant="h6" color="gray">
            Loading Matches...
          </Typography>
        </Box>
      ) : matches.length === 0 ? (
        <Typography sx={{ color: "gray", textAlign: "center", mt: 10 }}>
          No matches found
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {matches.map((match) => (
            <Grid item key={match.id} xs={12} sm={6} md={4} lg={3}>
              {match.status === "final" ? (
                <FinalMatchCard
                  match={match}
                  teamCache={teamCache}
                  trophyCache={trophyCache}
                  allPlayers={allPlayers}
                  formatDateTime={formatDateTime}
                />
              ) : (
                renderMatchCard(match)
              )}
            </Grid>
          ))}
        </Grid>
      )}
      <Divider sx={{ my: 8, mb: 10, borderColor: "#003950ff" }} />
    </Box>
  );
}
