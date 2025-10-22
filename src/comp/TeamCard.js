import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  Grid,
  Chip,
  Rating,
  Stack,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Wins
import CloseIcon from "@mui/icons-material/Close";             // Losses
import HandshakeIcon from "@mui/icons-material/Handshake";     // Draws
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"; // Matches

export default function TeamCardHorizontal({ team, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 1,
        pr: 2,
        background: "linear-gradient(135deg, #141E30, #243B55)",
        borderRadius: 4,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "0.3s ease",
        "&:hover": { transform: "translateY(-6px)", boxShadow: 6 },
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "5px",
          height: "100%",
          background: "linear-gradient(180deg, #00e5ff, #0073e6)",
        },
      }}
    >
      <CardContent sx={{ flex: 1, width: "100%", p: { xs: 1.5, sm: 2 } }}>
        {/* Top Section */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
          sx={{ mb: 1 }}
        >
          <Avatar
            src={team.logoUrl}
            alt={team.name}
            sx={{
              width: { xs: 60, md: 70 },
              height: { xs: 60, md: 70 },
              borderRadius: 3,
              bgcolor: "#1a237e",
              boxShadow: 5,
            }}
          />
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#00e5ff" }}
            >
              {team.name}
            </Typography>
            <Typography variant="body2" color="rgba(141, 141, 141, 1)">
              📍 {team.location} | Founded {team.foundedYear}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 0.8 }} />

        {/* Stats Section */}
        <Grid container spacing={1.2} sx={{ mb: 1 }}>
          <Grid item xs={6} sm="auto">
            <Chip
              icon={<EmojiEventsIcon />}
              label={`Wins: ${team.wins}`}
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
          <Grid item xs={6} sm="auto">
            <Chip
              icon={<CloseIcon />}
              label={`Losses: ${team.losses}`}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
          <Grid item xs={6} sm="auto">
            <Chip
              icon={<HandshakeIcon />}
              label={`Draws: ${team.draws}`}
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
          <Grid item xs={6} sm="auto">
            <Chip
              icon={<SportsSoccerIcon />}
              label={`M: ${team.matchesPlayed}`}
              variant="outlined"
              size="small"
              sx={{
                color: "#00e5ff",
                borderColor: "#00e5ff",
                fontWeight: 600,
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 0.8 }} />

        {/* Rating Section */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "center", sm: "flex-start" }}
          spacing={1}
          sx={{ mt: 0.5 }}
        >
          <Rating
            value={team.ratingAvg || 0}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography
            variant="body2"
            sx={{ color: "#ccc", fontWeight: 500 }}
          >
            {team.ratingAvg
              ? `${team.ratingAvg.toFixed(1)}/5 (${team.ratingCount || 0})`
              : "No Rating"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
