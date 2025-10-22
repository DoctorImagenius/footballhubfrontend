import { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Button,
  Divider
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TeamCard from "../comp/TeamCard";
import { useFootball } from "../FootballContext";


export default function Teams() {
  const { isLogin } = useFootball();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // 👇 Fetch all teams 
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://footballhub.azurewebsites.net/teams");
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Something went wrong");

      setTeams(data.data); // ✅ direct all teams set
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  // 👇 Search API call
  const searchTeams = async () => {
    if (!searchQuery.trim()) {
      toast.info("Please enter a search query!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://footballhub.azurewebsites.net/teams/search?q=${searchQuery}`
      );
      const data = await res.json();
      setTeams(data.data);
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

      setTeams([]);
    } finally {
      setLoading(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <Box p={3}>
      {/* 🔼 Page Header */}
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, md: 4 },
          mb: 4,
          color: "white",
          textAlign: "center",
          mt: 5
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
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
            Team
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

        {/* 🔍 Search Box */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: { xs: "95%", sm: "80%", md: "60%", lg: "50%" },
            mx: "auto",
            border: "1px solid #1976d2",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            backgroundColor: "#0066ff09",
            p: 0.5,
          }}
        >
          {/* Left Button: Show All */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSearchQuery("");
              fetchTeams();
            }}
            sx={{
              borderRadius: 5,
              minWidth: { xs: 60, sm: 80 },
              px: 2,
              py: { xs: 0.5, sm: 0.7 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              height: "100%",
              textTransform: "none",
            }}
          >
            Show All
          </Button>

          {/* Search Input */}
          <TextField
            placeholder="🔍 Search teams..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchTeams();
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                height: "100%",
                "& fieldset": {
                  border: "none",
                },
                "& input": {
                  py: { xs: 0.5, sm: 0.7 },
                  px: 1,
                  color: "#00ccffff",
                },
              },
            }}
          />

          {/* Right Button: Search */}
          <Button
            variant="contained"
            color="primary"
            onClick={searchTeams}
            sx={{
              borderRadius: 5,
              minWidth: { xs: 60, sm: 80 },
              px: 2,
              py: { xs: 0.5, sm: 0.7 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              height: "100%",
              textTransform: "none",
            }}
          >
            Search
          </Button>
        </Box>


        {isLogin && <Box
          sx={{
            position: "relative",
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => navigate("/create-team")}
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
            👉 Create New Team
          </Button>
        </Box>}
      </Box>

      {/* 🔽 Teams Grid */}
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
            Loading Teams...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {teams.length > 0 ?
            <>
              {teams.map((team) => (
                <Grid
                  item
                  key={team.id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TeamCard
                    team={team}
                    onClick={() => navigate(`/teams/${team.id}`, { state: { team } })}
                  />
                </Grid>
              ))}
            </>
            :
            (<Typography sx={{ textAlign: "center", mt: 5, color: "#888" }}>
              No teams found.
            </Typography>)
          }


        </Grid>
      )}
      <Divider sx={{ my: 8, mb: 10, borderColor: "#003950ff" }} />

    </Box>
  );
}
