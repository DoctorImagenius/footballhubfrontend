import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Rating,
  LinearProgress,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PlayerCard({ player }) {
  const positionMap = {
    goalkeeper: "GK",
    defender: "DF",
    midfielder: "MF",
    forward: "ST",
  };

  const isGoalkeeper =
    player.position?.toLowerCase() === "goalkeeper" ||
    positionMap[player.position?.toLowerCase()] === "GK";

  const gkStats = [
    { label: "DIV", value: player.diving ?? 50 },
    { label: "HAN", value: player.handling ?? 50 },
    { label: "KIC", value: player.kicking ?? 50 },
    { label: "REF", value: player.reflexes ?? 50 },
    { label: "POS", value: player.positioning ?? 50 },
    { label: "SPD", value: player.speed ?? 50 },
  ];

  const fieldStats = [
    { label: "PAC", value: player.pace ?? 50 },
    { label: "SHO", value: player.shooting ?? 50 },
    { label: "PAS", value: player.passing ?? 50 },
    { label: "DRI", value: player.dribbling ?? 50 },
    { label: "DEF", value: player.defence ?? 50 },
    { label: "PHY", value: player.physical ?? 50 },
  ];

  const stats = isGoalkeeper ? gkStats : fieldStats;
  const maxStat = Math.max(...stats.map((s) => s.value ?? 0));
  const positionAbbr = positionMap[player.position?.toLowerCase()] || "ST";

  let calculatedOverall = player.overalRating ?? 0;
  if (calculatedOverall === 0) {
    const values = stats.map((s) => s.value ?? 0);
    calculatedOverall = Math.round(
      values.reduce((sum, val) => sum + val, 0) / values.length
    );
  }

  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/players/${player.email}`, { state: { player } });
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        width: "100%",
        minWidth: 300,
        background: "linear-gradient(180deg, #1e1e2f, #2a2a40)",
        color: "white",
        borderRadius: "20px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
        overflow: "hidden",
        position: "relative",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 15px 30px rgba(0,0,0,0.8)",
        },
        textAlign: "center",
      }}
    >
      {/* Avatar Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Avatar
          src={player.imageUrl || "https://via.placeholder.com/150"}
          alt={player.name}
          sx={{
            width: 300,
            height: 300,
            borderRadius: "0px",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        />
      </Box>

      {/* Overall Badge */}
      <Tooltip title={`This is a ${positionAbbr} with an overall skills of ${calculatedOverall}%`}>
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(0, 229, 255, 0.95)",
            color: "#111",
            borderRadius: "15px",
            width: 45,
            height: 45,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            boxShadow: "0 3px 10px rgba(0,0,0,0.7)",
          }}
        >
          <Typography sx={{ fontSize: "1rem" }}>
            {calculatedOverall.toFixed(0)}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>{positionAbbr}</Typography>
        </Box>
      </Tooltip>

      {/* Aura Badge */}
      {player.auraPoints > 0 && (
        <Tooltip title={`This player has ${player.auraPoints}+ Aura`}>
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "radial-gradient(circle at top, #FFD700, #b8860b)",
              color: "#111",
              borderRadius: "15px",
              width: 45,
              height: 45,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              boxShadow: "0 3px 10px rgba(0,0,0,0.7)",
            }}
          >
            <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
              Aura
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
              {player.auraPoints}+
            </Typography>
          </Box>
        </Tooltip>
      )}

      {/* Card Content */}
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ textShadow: "1px 1px 5px rgba(0,0,0,0.7)" }}
        >
          {player.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 1, fontWeight: "bold", color: "#ccc" }}
        >
          ⚽ M: {player.matches ?? 0} | G: {player.goals ?? 0} | A:{" "}
          {player.assists ?? 0}
        </Typography>

        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.15)" }} />

        {/* Compact Stats Bars */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            textAlign: "left",
          }}
        >
          {stats.map((stat, idx) => (
            <Box key={idx}>
              <Typography
                variant="caption"
                sx={{
                  color: stat.value === maxStat ? "#00e5ff" : "#ccc",
                  fontWeight: stat.value === maxStat ? "bold" : "normal",
                }}
              >
                {stat.label}: {stat.value ?? 0}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stat.value ?? 0}
                sx={{
                  height: 6,
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    background:
                      stat.value === maxStat
                        ? "#00e5ff"
                        : "rgba(0,229,255,0.7)",
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Rating
            name="player-rating"
            value={Number(player.ratingAvg) || 0}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography sx={{ color: "#dadadaff", fontSize: "0.9rem" }}>
            {player.ratingCount > 0
              ? `${(Number(player.ratingAvg) || 0).toFixed(1)}/5 (${player.ratingCount} reviews)`
              : "No reviews yet"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
