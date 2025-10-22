import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Rating,
  Divider
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { useFootball } from "../FootballContext";
import { toast } from "react-toastify";


export default function TrainersPage() {
  const { isLogin, currentPlayer } = useFootball();
  const [isAlreadyTrainer, setIsAlreadyTrainer] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://footballhub.azurewebsites.net/trainers", {
        withCredentials: true,
      });
      const data = res.data.data || [];
      setTrainers(data);

      // ✅ Check if current user is already a trainer
      if (currentPlayer?.email) {
        const found = data.some(
          (t) =>
            t.playerId === currentPlayer.email || // if backend stores email
            t.email === currentPlayer.email || // fallback check
            t.playerEmail === currentPlayer.email
        );
        setIsAlreadyTrainer(found);
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      fetchTrainers();
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `https://footballhub.azurewebsites.net/trainers/search?q=${encodeURIComponent(
          searchText
        )}`,
        { withCredentials: true }
      );
      setTrainers(res.data.data || []);
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, color: "#fff", minHeight: "100vh" }}>
      {/* 🧩 Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mt: 8
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
          Trainer
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
          onClick={fetchTrainers}
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
          placeholder="🔍 Search trainers..."
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
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
          onClick={handleSearch}
          color="primary"
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
      <Box
        sx={{
          position: "relative",
          my: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!loading &&
          (
            <>
              {isLogin ?
                <>
                  {(!isAlreadyTrainer) ?

                    <Button
                      onClick={() => navigate("/create-trainer")}
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
                      startIcon={<PersonAddAltIcon />}
                    >
                      Become a Trainer
                    </Button>
                    :
                    <Button
                      variant="outlined"
                      sx={{
                        color: "#00e5ff",
                        borderRadius: "30px",
                        px: 5,
                        py: 1.2,
                        fontWeight: "bold",
                        borderColor: "rgba(255,255,255,0.2)",
                        "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                      }}
                      onClick={() => {
                        const myTrainerProfile = trainers.find(
                          (t) =>
                            t.playerId === currentPlayer?.email ||
                            t.email === currentPlayer?.email ||
                            t.playerEmail === currentPlayer?.email
                        );

                        if (myTrainerProfile) {
                          navigate("/trainer-detail", { state: { trainer: myTrainerProfile } });
                        } else {
                          toast.error("Your trainer profile could not be found.");
                        }
                      }}
                    >
                      Open Your Trainer Profile
                    </Button>
                  }
                </>
                : ""}
            </>)
        }
      </Box>
      {/* 📋 Trainers List */}
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
            Loading Trainers...
          </Typography>
        </Box>
      ) : trainers.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
            mt: 5,
          }}
        >
          {trainers.map((t, i) => (
            <Card
              key={i}


              sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden",
                transition: "0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  borderColor: "#00e5ff",
                  boxShadow: "0 4px 15px rgba(0,229,255,0.15)",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* 🧑 Trainer Image */}
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={
                    t.imageUrl ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={t.name}
                  sx={{
                    width: "100%",
                    height: 220,
                    borderRadius: 0,
                    objectFit: "cover",
                  }}
                  variant="square"
                />

                {/* ⭐ Points */}
                {Number(t.points) === 0 ? "" : <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "#FFD700",
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 2,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  ⭐ {t.points || 0} pts
                </Box>}

                {/* 🟢 / 🔴 Trainer Status */}
                {t.status && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      bgcolor:
                        t.status === "active"
                          ? "rgba(0,255,0,0.15)" // light green bg
                          : "rgba(255,0,0,0.15)", // light red bg
                      color: t.status === "active" ? "#00ff7f" : "#ff4d4d",
                      px: 1.2,
                      py: 0.3,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {t.status}
                  </Box>
                )}

              </Box>

              {/* 📄 Info */}
              <CardContent sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#00e5ff",
                    textAlign: "center",
                  }}
                >
                  {t.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#aaa",
                    textAlign: "center",
                    fontStyle: "italic",
                    mb: 1,
                  }}
                >
                  {t.title || "Professional Trainer"}
                </Typography>

                {/* 📍 Location */}
                {t.location && (
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "#888",
                      fontSize: 13,
                      mb: 1,
                    }}
                  >
                    📍 {t.location}
                  </Typography>
                )}

                {/* ⭐ Rating */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <Rating
                    value={t.ratingAvg || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#FFD700", // 🟡 filled stars (gold)
                      },
                      "& .MuiRating-iconEmpty": {
                        color: "#444", // ⚫ unselected stars (gray)
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{ textAlign: "center", color: "#999", fontSize: 13 }}
                >
                  ({t.ratingCount || 0} reviews)
                </Typography>
                {/* 💰 Price */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  {Number(t.price) === 0 ? "" :
                    <>
                      <Typography sx={{ color: "#bbb", fontSize: 15 }}>
                        Fee:
                      </Typography>
                      <Typography
                        sx={{
                          color: "#00e5ff",
                          fontWeight: 600,
                          fontSize: 17,
                        }}
                      >
                        Rs {t.price || 0}
                      </Typography>
                    </>
                  }
                </Box>
                <Button
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/trainer-detail", { state: { trainer: t } });
                  }}
                  variant="outlined"
                  sx={{
                    color: "#00e5ff",
                    borderRadius: "10px",
                    px: 5,
                    py: 1.2,
                    fontWeight: "bold",
                    borderColor: "rgba(255,255,255,0.2)",
                    "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                  }}

                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 5, color: "#888" }}>
          No trainers found.
        </Typography>
      )}
      <Divider sx={{ my: 8, mb: 10, borderColor: "#003950ff" }} />

    </Box>
  );
}
