import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { motion, useInView } from "framer-motion";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

const CountUp = ({ target, active }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 30);

    return () => clearInterval(timer);
  }, [target, active]);

  return <>{count.toLocaleString()}+</>;
};

const CounterCard = ({ value, label, Icon, active }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={active ? { opacity: 1, y: 0 } : {}}
  >
    <Box
      sx={{
        textAlign: "center",
        px: 4,
        py: 4,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        borderRadius: "16px",
        minWidth: "180px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 0 20px rgba(0,229,255,0.3)",
          borderColor: "rgba(0,229,255,0.3)",
        },
      }}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={active ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <Icon sx={{ fontSize: 50, color: "#00e5ff", mb: 1 }} />
      </motion.div>

      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          color: "#00e5ff",
        }}
      >
        <CountUp target={value} active={active} />
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          color: "rgba(255,255,255,0.85)",
          mt: 1,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </Box>
  </motion.div>
);

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://footballhub.azurewebsites.net/stats");
        if (res.data.success && res.data.data) {
          setStats(res.data.data);
        } else {
          setStats({
            players: 100,
            teams: 20,
            trainers: 15,
            matches: 50,
          });
        }
      } catch (err) {
        setStats({
          players: 100,
          teams: 20,
          trainers: 15,
          matches: 50,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        py: 10,
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontFamily: "'Montserrat', sans-serif",
          background: "linear-gradient(270deg,  #ff0000, #ff7f00,   #ffff00,    #00ff00,  #00ffff,    #0000ff,   #8b00ff,   #ff00ff,    #ffffff,  #00ff99,    #ff1493,   #ff4500,    #7fff00,   #1e90ff,  #ff0000 )",
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
        Our Community Stats
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "#00e5ff" }} />
      ) : (
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item>
            <CounterCard
              value={stats.players}
              label="Players"
              Icon={SportsSoccerIcon}
              active={isInView}
            />
          </Grid>
          <Grid item>
            <CounterCard
              value={stats.teams}
              label="Teams"
              Icon={GroupsIcon}
              active={isInView}
            />
          </Grid>
          <Grid item>
            <CounterCard
              value={stats.trainers}
              label="Coaches"
              Icon={SportsKabaddiIcon}
              active={isInView}
            />
          </Grid>
          <Grid item>
            <CounterCard
              value={stats.matches}
              label="Matches Played"
              Icon={EmojiEventsIcon}
              active={isInView}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatsSection;
