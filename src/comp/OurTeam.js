import { Box, Typography, Grid, Card, Avatar } from "@mui/material";
import { motion } from "framer-motion";

const teamMembers = [
  { name: "Haroon", role: "Founder & CEO", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.24%20AM.jpeg?updatedAt=1760735661318" },
  { name: "Haroon", role: "Frontend Developer", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.22%20AM.jpeg?updatedAt=1760735661343" },
  { name: "Haroon", role: "Backend Engineer", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.23%20AM%20(1).jpeg?updatedAt=1760735661325" },
  { name: "Haroon", role: "UI/UX Designer", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.25%20AM.jpeg?updatedAt=1760735661365" },
  { name: "Haroon", role: "Database Manager", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.24%20AM%20(1).jpeg?updatedAt=1760735661393" },
  { name: "Haroon", role: "App Developer", img: "https://ik.imagekit.io/footballhub/WhatsApp%20Image%202025-10-18%20at%202.12.23%20AM.jpeg?updatedAt=1760735661353" },
];

const OurTeam = () => {
  return (
    <Box
      sx={{
        py: 10,
        px: 3,
        textAlign: "center",
        color: "white",
      }}
    >
      {/* 🔹 Section Heading */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontFamily: "'Montserrat', sans-serif",
          background:
            "linear-gradient(270deg,  #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ffffff, #00ff99, #ff1493, #ff4500, #7fff00, #1e90ff, #ff0000)",
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
        Our Team
      </Typography>

      {/* 🔹 Team Grid */}
      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((m, i) => (
          <Grid item key={i}>
            <motion.div>
              <Card
                sx={{
                  width: 100, // ✅ Fixed width
                  minHeight: 200, // ✅ Same height
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "20px",
                  p: 2,
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: "0 0 10px rgba(0, 229, 255, 0.55)",
                  },
                }}
              >
                <Avatar
                  src={m.img}
                  alt={m.name}
                  sx={{
                    width: 90,
                    height: 90,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid rgba(0,229,255,0.6)",
                  }}
                />
                <Typography variant="h6" fontWeight="bold" color="white">
                  {m.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mt: 0.5,
                  }}
                >
                  {m.role}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OurTeam;
