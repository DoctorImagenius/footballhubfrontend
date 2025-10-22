import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  LinearProgress,
  Rating,
} from "@mui/material";
import {
  SportsSoccer,
  EmojiEvents,
  Star,
  Shield,
  GroupWork,
  SportsKabaddi,
  Sports,
  Groups2,
  MilitaryTech,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://footballhub.azurewebsites.net/leaderboard");
        if (res.data?.data) setData(res.data.data);
        else setData(null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Rank visuals
  const getRankStyle = (index, statType) => {
    if (statType !== "goals") return {};
    if (index === 0) return { border: "3px solid gold", boxShadow: "0 0 25px rgba(255,215,0,0.7)" };
    if (index === 1) return { border: "3px solid silver", boxShadow: "0 0 25px rgba(192,192,192,0.6)" };
    if (index === 2) return { border: "3px solid #cd7f32", boxShadow: "0 0 25px rgba(205,127,50,0.6)" };
    return { border: "3px solid #00e5ff", boxShadow: "0 0 15px rgba(0,229,255,0.4)" };
  };

  const getRankBadge = (index, statType) => {
    if (statType !== "goals") return null;
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  // Reusable section
  const renderSection = (title, icon, players, type, statType) => {
    if (!players || players.length === 0)
      return (
        <Box sx={{ textAlign: "center", mb: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#00e5ff",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
              letterSpacing: 2,
              textShadow: "0 0 12px rgba(0,229,255,0.5)",
            }}
          >
            {icon}
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic", mt: 2 }}>
            No data available at this time.
          </Typography>
        </Box>
      );

    const isSingle = players.length === 1;

    return (
      <Box sx={{ textAlign: "center", mb: 10 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#ffffffff",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 4,
              letterSpacing: { xs: 1, sm: 2 },
              fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2rem" },
              textAlign: "center",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
              <Box sx={{ fontSize: { xs: "1.6rem", sm: "2rem", color: "#fffb00ff" } }}>{icon}</Box>
              <Box component="span" sx={{ color: "#00ffffff" }} >{title}</Box>
            </Box>
          </Typography>
        </motion.div>

        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 3 }}>
          {players.map((p, i) => {
            const displayName = p.name || p.teamName || "Unknown";
            const image = p.imageUrl || p.logoUrl || "https://via.placeholder.com/150";
            const winRate = type === "team" && p.matchesPlayed ? ((p.wins / p.matchesPlayed) * 100).toFixed(1) : null;
            const handleClick = () => {
              if (type === "team") {
                navigate(`/teams/${p.id}`, { state: { team: p } });
              } else {
                navigate(`/players/${p.email}`, { state: { player: p } });
              }
            };

            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ scale: 1.05 }}>
                <Card
                  onClick={handleClick}
                  sx={{
                    cursor: "pointer",
                    width: { xs: "100%", sm: isSingle ? 280 : 230 },
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid rgba(0, 247, 255, 0.2)",
                    background: "rgba(0, 225, 255, 0.01)", // 🌫️ Transparent gray glass
                    backdropFilter: "blur(1px)", // Glassmorphism effect
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Subtle depth
                    transition: "0.2s ease",
                    position: "relative",
                    "&:hover": {
                      boxShadow: "0 6px 25px rgba(0, 229, 255, 0.25)", // Gentle glow
                    },
                  }}
                >

                  {getRankBadge(i, statType) && (
                    <Box sx={{ position: "absolute", top: 8, right: 8, fontSize: "1.8rem" }}>
                      {getRankBadge(i, statType)}
                    </Box>
                  )}

                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar src={image} alt={displayName} sx={{ width: isSingle ? 90 : 70, height: isSingle ? 90 : 70, mx: "auto", mb: 1.5, ...getRankStyle(i, statType) }} />

                    <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 0.5, textShadow: "0 0 8px rgba(255,255,255,0.3)" }}>
                      {displayName}
                    </Typography>

                    {/* ---- Show Position if Player ---- */}
                    {type === "player" && p.position && (
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 1, fontStyle: "italic" }}>
                        {p.position}
                      </Typography>
                    )}

                    {/* ---- Dynamic Stats Section ---- */}
                    {(() => {
                      if (type === "player" && statType === "rating")
                        return <Rating name="player-rating" value={p.ratingAvg || 0} precision={0.1} readOnly sx={{ color: "#ffc400ff", mb: 1 }} />;

                      if (type === "team" && statType === "ratingTeam")
                        return <Rating name="team-rating" value={p.ratingAvg || 0} precision={0.1} readOnly sx={{ color: "#ffc400ff", mb: 1 }} />;

                      if (["def", "mid", "for", "gk"].includes(statType))
                        return (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: "#00e5ff", mb: 0.5 }}>
                              {`Overall: ${p.overalRating || 0}/100`}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={p.overalRating || 0}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                "& .MuiLinearProgress-bar": { backgroundColor: "#00e5ff" },
                              }}
                            />
                          </Box>
                        );

                      if (type === "team" && statType === "winRate")
                        return (
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={winRate || 0}
                              size={60}
                              thickness={4}
                              sx={{
                                color: "#73ff00ff",
                                mb: 1,
                                "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                              }}
                            />
                            <Typography variant="body2" sx={{ color: "#00e5ff", fontWeight: "bold" }}>
                              {winRate || 0}%
                            </Typography>
                          </Box>
                        );

                      return (
                        <Typography variant="body2" sx={{ color: "#00e5ff", fontWeight: "bold", fontSize: "0.9rem" }}>
                          {type === "player"
                            ? statType === "goals"
                              ? `Goals: ${p.goals || 0}`
                              : statType === "assists"
                                ? `Assists: ${p.assists || 0}`
                                : statType === "motm"
                                  ? `MOTM Awards: ${p.motmCount || 0}`
                                  : ""
                            : ""}
                        </Typography>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 5, sm: 8 }, px: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mb: 5,
          mt: 5

        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
            background: "linear-gradient(270deg, #FFFFFF, #68b0ddff, #FFFFFF)",
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
          Leaderboard
        </Typography>

        <Box
          sx={{
            background: "linear-gradient(135deg, #0073E6, #FFFFFF, #0073E6)",
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
      {loading ?
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
            Loading Data...
          </Typography>
        </Box>
        :
        <>
          {data ?
            <>
              {renderSection("Top Goal Scorers", <SportsSoccer />, data.players.topScorers, "player", "goals")}
              {renderSection("Top Assist Provider", <GroupWork />, data.players.topAssist, "player", "assists")}
              {renderSection("Top Rated Player", <Star />, data.players.topRatedPlayer, "player", "rating")}
              {renderSection("Top Defender", <Shield />, data.players.topDefender, "player", "def")}
              {renderSection("Top Midfielder", <SportsKabaddi />, data.players.topMidfielder, "player", "mid")}
              {renderSection("Top Forward", <Sports />, data.players.topForward, "player", "for")}
              {renderSection("Top Goalkeeper", <MilitaryTech />, data.players.topGoalkeeper, "player", "gk")}
              {renderSection("Top MOTM Player", <EmojiEvents />, data.players.topMOTMPlayers, "player", "motm")}
              {renderSection("Top Team by Win Rate", <Groups2 />, data.teams.topTeamByWinRate, "team", "winRate")}
              {renderSection("Top Rated Team", <Star />, data.teams.topRatedTeam, "team", "ratingTeam")}
            </>
            : <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "40vh", color: "#00e5ff", textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 2 }}>⚠️ No Leaderboard Data Available</Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Please check back later — stats will appear once matches are played.
              </Typography>
            </Box>}

        </>
      }
    </Box>
  );
}
