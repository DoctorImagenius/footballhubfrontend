import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import {
  SportsSoccer,
  Groups,
  School,
  Storefront,
  PersonSearch,
  Sports,
  SportsHandball,
  EmojiEvents,
  LocalActivity,
  Handshake,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const features = [
  {
    icon: <PersonSearch sx={{ fontSize: 60 }} />,
    title: "Player Signup",
    text: "Sign up as a player and create your profile with skills and stats.",
    gradient: "linear-gradient(135deg, #00e5ff, #00ff88)",
  },
  {
    icon: <Groups sx={{ fontSize: 60 }} />,
    title: "Find Players & Contact",
    text: "Discover players, connect, and collaborate with real stats.",
    gradient: "linear-gradient(135deg, #ff0080, #ff8c00)",
  },
  {
    icon: <SportsSoccer sx={{ fontSize: 60 }} />,
    title: "Track Your Stats",
    text: "Monitor your real performance, matches, and skill improvements.",
    gradient: "linear-gradient(135deg, #8e2de2, #4a00e0)",
  },
  {
    icon: <Groups sx={{ fontSize: 60 }} />,
    title: "Join or Create Teams",
    text: "Become part of a team or start your own squad effortlessly.",
    gradient: "linear-gradient(135deg, #ff4e50, #f9d423)",
  },
  {
    icon: <SportsHandball sx={{ fontSize: 60 }} />,
    title: "Play Matches",
    text: "Compete in matches and track all activities in your football journey.",
    gradient: "linear-gradient(135deg, #00c6ff, #0072ff)",
  },
  {
    icon: <School sx={{ fontSize: 60 }} />,
    title: "Become a Trainer",
    text: "Coach players, earn points or money, and grow your football network.",
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    icon: <LocalActivity sx={{ fontSize: 60 }} />,
    title: "Training & Booking",
    text: "Book trainers, attend training sessions, and improve your skills.",
    gradient: "linear-gradient(135deg, #ff00ff, #ff99ff)",
  },
  {
    icon: <Storefront sx={{ fontSize: 60 }} />,
    title: "Buy & Sell Gear",
    text: "Trade football kits, gear, and accessories with real money or points.",
    gradient: "linear-gradient(135deg, #00ff99, #00ccff)",
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 60 }} />,
    title: "Earn Rewards",
    text: "Collect badges, points, and get recognized for your achievements.",
    gradient: "linear-gradient(135deg, #ff4500, #ffcc00)",
  },
  {
    icon: <Sports sx={{ fontSize: 60 }} />,
    title: "Live Matches",
    text: "View live matches, follow scores, and track ongoing performances.",
    gradient: "linear-gradient(135deg, #00ffcc, #0099ff)",
  },
  {
    icon: <Handshake sx={{ fontSize: 60 }} />,
    title: "Talent Discovery",
    text: "Find hidden talents and top performers in your football community.",
    gradient: "linear-gradient(135deg, #ff1493, #ff69b4)",
  },
];

const FeaturesSection = () => {
  return (
    <Box
      sx={{
        background: "rgba(0, 140, 255, 0.05)",
        color: "white",
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 8 },
      }}
    >
      <Typography
        variant="h4"
        textAlign="center"
        sx={{
          fontWeight: 800,
          fontFamily: "'Montserrat', sans-serif",
          background: "linear-gradient(270deg,  #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000 )",
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
        What You Can Do Here
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  textAlign: "center",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0,229,255,0.25)",
                    borderColor: "rgba(0,229,255,0.25)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: feature.gradient,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.6,
                      maxWidth: 260,
                      mx: "auto",
                    }}
                  >
                    {feature.text}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
