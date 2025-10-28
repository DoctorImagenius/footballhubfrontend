import { useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
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
  Star,
  Notifications,
  Timeline,
  MilitaryTech,
  Event,
  AccountBalanceWallet,
  Work,
  Chat,
  Settings,
  SignalCellularAlt,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: <PersonSearch sx={{ fontSize: 60 }} />,
    title: "Player Registration",
    text: "Create your football profile with stats, skills, position, and photo to join the FootballHub community.",
    gradient: "linear-gradient(135deg, #00e5ff, #00ff88)",
  },
  {
    icon: <Groups sx={{ fontSize: 60 }} />,
    title: "Find & Contact Players",
    text: "Search for players nearby, check their profiles, and connect for matches or training.",
    gradient: "linear-gradient(135deg, #ff0080, #ff8c00)",
  },
  {
    icon: <SportsSoccer sx={{ fontSize: 60 }} />,
    title: "Track Your Performance",
    text: "View your football journey — goals, assists, matches, and win/loss records — all in one dashboard.",
    gradient: "linear-gradient(135deg, #8e2de2, #4a00e0)",
  },
  {
    icon: <Groups sx={{ fontSize: 60 }} />,
    title: "Create or Join Teams",
    text: "Build your own team or join others to compete in local and online matches.",
    gradient: "linear-gradient(135deg, #ff4e50, #f9d423)",
  },
  {
    icon: <SportsHandball sx={{ fontSize: 60 }} />,
    title: "Play & Organize Matches",
    text: "Host football matches, invite teams, and manage live match results and player stats.",
    gradient: "linear-gradient(135deg, #00c6ff, #0072ff)",
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 60 }} />,
    title: "Tournaments & Trophies",
    text: "Participate in tournaments, win virtual and real trophies, and climb the FootballHub leaderboard.",
    gradient: "linear-gradient(135deg, #ff4500, #ffcc00)",
  },
  {
    icon: <School sx={{ fontSize: 60 }} />,
    title: "Become a Trainer",
    text: "Offer training sessions, build your reputation, and earn points or income as a certified trainer.",
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    icon: <LocalActivity sx={{ fontSize: 60 }} />,
    title: "Book Training Sessions",
    text: "Book expert trainers to improve your skills and fitness through customized sessions.",
    gradient: "linear-gradient(135deg, #ff00ff, #ff99ff)",
  },
  {
    icon: <Storefront sx={{ fontSize: 60 }} />,
    title: "Marketplace (Buy & Sell)",
    text: "Trade football gear, kits, and equipment using money or FootballHub points.",
    gradient: "linear-gradient(135deg, #00ff99, #00ccff)",
  },
  {
    icon: <Handshake sx={{ fontSize: 60 }} />,
    title: "Talent Discovery",
    text: "Get discovered by scouts or clubs based on your performance and rating history.",
    gradient: "linear-gradient(135deg, #ff1493, #ff69b4)",
  },
  {
    icon: <Sports sx={{ fontSize: 60 }} />,
    title: "Live Match Updates",
    text: "Stay updated with live scores, match highlights, and player stats in real time.",
    gradient: "linear-gradient(135deg, #00ffcc, #0099ff)",
  },
  {
    icon: <Star sx={{ fontSize: 60 }} />,
    title: "Player Ranking System",
    text: "Compete for higher aura points, ratings, and ranks based on your match performance.",
    gradient: "linear-gradient(135deg, #ff7e5f, #feb47b)",
  },
  {
    icon: <Notifications sx={{ fontSize: 60 }} />,
    title: "Smart Notifications",
    text: "Get instant alerts for match invites, messages, achievements, and updates.",
    gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
  },
  {
    icon: <Timeline sx={{ fontSize: 60 }} />,
    title: "Match History & Analytics",
    text: "Access detailed match reports, analyze your stats, and see your progress over time.",
    gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
  },
  {
    icon: <MilitaryTech sx={{ fontSize: 60 }} />,
    title: "Achievements & Rewards",
    text: "Unlock medals, badges, and trophies as you progress through your football journey.",
    gradient: "linear-gradient(135deg, #f953c6, #b91d73)",
  },
  {
    icon: <Event sx={{ fontSize: 60 }} />,
    title: "Event Management",
    text: "Organize football events, matches, and training camps with just a few clicks.",
    gradient: "linear-gradient(135deg, #ff9966, #ff5e62)",
  },
  {
    icon: <AccountBalanceWallet sx={{ fontSize: 60 }} />,
    title: "Wallet & Points System",
    text: "Earn and spend points across training, matches, and store purchases.",
    gradient: "linear-gradient(135deg, #00f260, #0575e6)",
  },
  {
    icon: <Work sx={{ fontSize: 60 }} />,
    title: "Career Growth",
    text: "Build your football career portfolio and get noticed by clubs and sponsors.",
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    icon: <Chat sx={{ fontSize: 60 }} />,
    title: "Chat & Communication",
    text: "Stay connected with players, teams, and trainers through built-in messaging.",
    gradient: "linear-gradient(135deg, #00b09b, #96c93d)",
  },
  {
    icon: <Settings sx={{ fontSize: 60 }} />,
    title: "Personalized Experience",
    text: "Customize your profile, privacy, and notifications for a smooth FootballHub experience.",
    gradient: "linear-gradient(135deg, #8360c3, #2ebf91)",
  },
  {
    icon: <SignalCellularAlt sx={{ fontSize: 60 }} />,
    title: "Performance Insights",
    text: "Get AI-powered analytics to improve your techniques and overall gameplay.",
    gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  },
];

const FeaturesSection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleFeatures = showAll ? features : features.slice(0, 9);

  return (
    <Box
      sx={{
        background: "rgba(0, 140, 255, 0.05)",
        color: "white",
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 8 },
        textAlign: "center",
      }}
    >
      {/* Animated Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontFamily: "'Montserrat', sans-serif",
          background:
            "linear-gradient(270deg,  #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000 )",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 20s ease-in-out infinite alternate",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "0% 50%" },
            "100%": { backgroundPosition: "100% 50%" },
          },
          mb: 1,
        }}
      >
        What You Can Do Here
      </Typography>

      {/* Subheading Tagline */}
      <Typography
        variant="subtitle1"
        sx={{
          color: "rgba(255,255,255,0.7)",
          mb: 6,
          maxWidth: 700,
          mx: "auto",
          fontSize: "1.05rem",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Explore everything FootballHub has to offer — from building your profile and managing teams
        to joining matches, earning rewards, and growing your football career.
      </Typography>

      {/* Features Grid */}
      <Grid container spacing={4} justifyContent="center">
        <AnimatePresence>
          {visibleFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.4 }}
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
        </AnimatePresence>
      </Grid>

      {/* Show More / Less Button */}
      <Button
        onClick={() => setShowAll(!showAll)}
        sx={{
          mt: 5,
          px: 4,
          py: 1,
          borderRadius: "30px",
          fontWeight: "bold",
          fontSize: "1rem",
          textTransform: "none",
          background: "linear-gradient(135deg, #00e5ff, #00ff88)",
          color: "#000",
          "&:hover": {
            background: "linear-gradient(135deg, #00c6ff, #0072ff)",
          },
        }}
      >
        {showAll ? "Show Less Features" : "Show More Features"}
      </Button>
    </Box>
  );
};

export default FeaturesSection;
