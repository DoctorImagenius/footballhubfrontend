import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Divider,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useFootball } from "../FootballContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";


// Bar color based on result
const getBarColor = (result) => {
  switch (result) {
    case "win":
      return "#4CAF50"; // green
    case "lose":
      return "#F44336"; // red
    case "draw":
      return "#FFC107"; // yellow
    default:
      return "#8884d8";
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hovered = payload[0].payload;
    const date = new Date(label);

    // Format: Oct 3, 2025 11:44 AM
    const formattedDate = date.toLocaleString("en-US", {
      month: "short",    // Oct
      day: "numeric",    // 3
      year: "numeric",   // 2025
      hour: "2-digit",   // 11
      minute: "2-digit", // 44
      hour12: true       // AM/PM
    });

    return (
      <Box
        sx={{
          backgroundColor: "white",
          color: "black",
          p: 2,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          minWidth: 180,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {formattedDate}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Result:</Typography>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={
              hovered.result === "win"
                ? "green"
                : hovered.result === "lose"
                  ? "red"
                  : "orange"
            }
          >
            {hovered.result.toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Performance:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {parseFloat(hovered.overallPerformance.toFixed(1))}%
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};


export default function PlayerDetail() {
  const { isLogin, currentPlayer, setCurrentPlayer, setIsLogin } = useFootball();
  const player = currentPlayer;
  const navigate = useNavigate();
  const [teamsData, setTeamsData] = useState([]);
  const [matchHistory] = useState(player?.matchHistory || []);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [motmCount, setMotmCount] = useState(0);
  const [trophyCounts, setTrophyCounts] = useState({});
  const [trophyDetails, setTrophyDetails] = useState({});
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);



  const handleLogout = async () => {
    try {
      setLoadingOut(true);
      const res = await axios.post("https://footballhub.azurewebsites.net/logout", {}, { withCredentials: true });
      if (res.data.message) {
        //navigate("/login");
        localStorage.removeItem("player");
        sessionStorage.removeItem("player");
        setCurrentPlayer(null);
        toast.success("Logged out successfully!");
        setIsLogin(false);
      } else {
        toast.error("Logout failed, please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoadingOut(false);
    }
  };

  const handleDelete = async () => {

    try {
      setLoadingDel(true);
      const res = await axios.delete("https://footballhub.azurewebsites.net/profile", {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Profile deleted successfully!");
        // 🧹 Clear all local data
        localStorage.removeItem("player");
        sessionStorage.removeItem("player");
        setCurrentPlayer(null);
        setIsLogin(false);
        // 🔁 Redirect to login page
        navigate("/login");
      } else {
        toast.error("Something went wrong, Please try again later!");

      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoadingDel(false);
    }
  };

  // === Fetch Teams ===
  useEffect(() => {
    const fetchTeams = async () => {
      if (!player?.teams?.length) return;

      setLoadingTeams(true);
      try {
        const results = await Promise.all(
          player.teams.map(async (teamId) => {
            try {
              const res = await axios.get(`https://footballhub.azurewebsites.net/teams/${teamId}`);
              return res.data;
            } catch (err) {
              return null; // skip invalid team
            }
          })
        );

        const validTeams = results
          .filter((res) => res?.success && res.data)
          .map((res) => res.data);

        setTeamsData(validTeams);
      } catch (err) {
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [player]);

  // === Fetch Achievements ===
  useEffect(() => {
    if (!player?.achievements) return;

    const fetchAchievements = async () => {
      setLoadingAchievements(true);
      try {
        let motm = 0;
        const normalIds = [];

        player.achievements.forEach((id) => {
          if (id.startsWith("MOTM")) {
            motm++;
          } else {
            normalIds.push(id);
          }
        });

        setMotmCount(motm);

        if (normalIds.length > 0) {
          const counts = {};
          const details = {};

          const results = await Promise.all(
            normalIds.map(async (id) => {
              try {
                const res = await axios.get(`https://footballhub.azurewebsites.net/trophies/${id}`);
                return res.data;
              } catch (err) {
                return null;
              }
            })
          );

          results.forEach((res) => {
            if (res?.success && res.data) {
              const trophy = res.data;
              counts[trophy.id] = (counts[trophy.id] || 0) + 1;
              details[trophy.id] = trophy;
            }
          });

          setTrophyCounts(counts);
          setTrophyDetails(details);
        }
      } catch (err) {
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [player]);

  if (!isLogin) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#00bfff" }}
        >
          Please login to view your profile
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            backgroundColor: "#00bfff",
            color: "white",
            textTransform: "none",
            fontSize: "16px",
            px: 3,
            py: 1,
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "#009ad6",
            },
          }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  const barData = matchHistory.map((match) => ({
    ...match,
    barColor: getBarColor(match.result),
  }));

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 15,
        px: 2,
        color: "white",
        fontFamily: "Orbitron, sans-serif", // ✅ gaming-style font
      }}
    >
      {/* ==== Player Header Section ==== */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        {/* Avatar */}
        <Avatar
          src={player.imageUrl}
          alt={player.name}
          sx={{
            width: 180,
            height: 180,
            mx: "auto",
            mb: 3,
            border: "10px solid #00ccff",
            boxShadow: "0 0 30px rgba(0, 204, 255, 0.6)",
          }}
        />

        {/* Player Name */}
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {player.name}
        </Typography>

        {/* 👑 Captain Badge with Team Logos */}
        {(() => {
          const captainTeams = teamsData.filter(
            (team) => team.captain === player.email
          );

          if (captainTeams.length === 0) return null;

          return (
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                p: 1.2,
                borderRadius: "16px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#FFD700",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  letterSpacing: 0.3,
                }}
              >
                👑 Captain Of
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                  mt: 0.5,
                }}
              >
                {captainTeams.map((team) => (
                  <Box
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`, { state: { team } })}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 0.5,
                      py: 0.5,
                      pr: 1,
                      borderRadius: "30px",
                      background: "linear-gradient(135deg,#FFD700,#FFA500)",
                      color: "#111",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      transition: "0.3s ease",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <Avatar
                      src={team.logoUrl}
                      alt={team.name}
                      sx={{
                        width: 22,
                        height: 22,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                    />
                    {team.name}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })()}

        {/* Info Grid */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ mt: 3, textAlign: "center" }}
        >
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              ⚽ Position
            </Typography>
            <Typography variant="body1" color="gray">
              {player.position}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              🦶 Foot
            </Typography>
            <Typography variant="body1" color="gray">
              {player.foot}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              📧 Email
            </Typography>
            <Typography variant="body1" color="gray">
              {player.email}
            </Typography>
          </Grid>

          {/* ✅ Age */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              🎂 Age
            </Typography>
            <Typography variant="body1" color="gray">
              {player.age ?? "N/A"}
            </Typography>
          </Grid>

          {/* ✅ Location */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              📍 Location
            </Typography>
            <Typography variant="body1" color="gray">
              {player.location ?? "N/A"}
            </Typography>
          </Grid>

          {/* ✅ Mobile */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#00e5ff" }}>
              📱 Mobile
            </Typography>
            <Typography variant="body1" color="gray">
              {player.mobileNumber ?? "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      {/* ====== Action Buttons (Edit + Delete) ====== */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2, flexWrap: "wrap", flexDirection: { xs: "column", sm: "row" }, }}>
        <Button
          variant="outlined"
          onClick={handleLogout}
          disabled={loadingOut}
          sx={{
            color: "#00e5ff",
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
            opacity: loadingOut ? 0.7 : 1,
          }}
        >
          {loadingOut ? (
            <CircularProgress size={22} sx={{ color: "#00e5ff" }} />
          ) : (
            "Log Out"
          )}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setOpenDeleteConfirm(true);
          }}
          sx={{
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            color: "#ff5252",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "&:hover": { borderColor: "#ff5252", background: "rgba(255,0,0,0.1)" },
          }}
        >
          Delete profile
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowEdit(!showEdit)}
          sx={{
            color: "#00e5ff",
            borderRadius: "30px",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderColor: "rgba(255,255,255,0.2)",
            "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
          }}
        >
          {showEdit ? "Cancel" : "Edit Profile"}
        </Button>
      </Box>
      <Modal open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 480,
            bgcolor: "#0a1929",
            borderRadius: 3,
            p: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "60vh",
          }}
        >
          {/* Header */}
          <Typography
            variant="h6"
            sx={{
              color: "#00e5ff",
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            ⚠️ Confirm Profile Deletion
          </Typography>

          {/* Scrollable Content */}
          <Box
            sx={{
              overflowY: "auto",
              pr: 1,
              mb: 3,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
              },
            }}
          >
            <Typography
              sx={{
                color: "#ff8a65",
                fontSize: "0.95rem",
                fontWeight: 500,
                background: "rgba(255,82,82,0.08)",
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(255,82,82,0.3)",
                lineHeight: 1.6,
              }}
            >
              <b>Warning:</b> Deleting your profile is <b>permanent</b> and cannot be undone.

              This action will also:
              <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                <li>Remove all your <b>selling items</b> from the store</li>
                <li>Delete your <b>trainer profile</b> (if any)</li>
                <li>Remove you from all <b>teams</b> you’ve joined</li>
                <li>Delete any <b>team</b> where you are the only player</li>
                <li>If you are a <b>captain</b>, another player will be automatically assigned as captain</li>
                <li>Delete your <b>profile image</b> and personal data permanently</li>
              </ul>
              Please make sure you really want to continue.
            </Typography>
          </Box>

          {/* Footer Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: "auto",
            }}
          >
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              variant="outlined"
              sx={{
                color: "#00e5ff",
                borderColor: "rgba(255,255,255,0.2)",
                "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                px: 4,
                borderRadius: "30px",
                fontWeight: "bold",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={loadingDel}
              sx={{
                background: "#ff5252",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#ff1744" },
                px: 4,
                borderRadius: "30px",
                position: "relative",
              }}
            >
              {loadingDel ? (
                <>
                  <CircularProgress
                    size={22}
                    thickness={5}
                    sx={{
                      color: "#fff",
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <span style={{ visibility: "hidden" }}>Delete</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      {showEdit && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: "16px",
            background: "rgba(0, 46, 65, 0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: 500,
            mx: "auto",
            transition: "0.4s ease",
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold", color: "#00e5ff" }}
          >
            ✏️ Edit Profile
          </Typography>

          {/* 🧍 Avatar Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 130,
                height: 130,
                mx: "auto",
                borderRadius: "20px",
                border: "3px solid #00e5ff",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <Avatar
                src={preview || currentPlayer.imageUrl}
                alt="Profile Image"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "0px",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Button
              variant="outlined"
              component="label"
              sx={{
                mt: 2.5,
                color: "#00e5ff",
                borderColor: "rgba(255,255,255,0.2)",
                fontWeight: 600,
                borderRadius: "25px",
                px: 4,
                "&:hover": {
                  borderColor: "#00e5ff",
                  background: "rgba(0,229,255,0.08)",
                },
              }}
            >
              {(selectedFile) ? "Image Selected" : " Change Image"}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file); // ✅ store file in state
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Button>

          </Box>

          {/* ==== Input Fields ==== */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const formFields = new FormData(e.target);
              const data = new FormData();

              // get values
              const name = formFields.get("name")?.trim();
              const age = Number(formFields.get("age"));
              const mobileNumber = formFields.get("mobileNumber")?.trim();
              const password = formFields.get("password")?.trim();

              // ✅ Validation checks
              if (!name) return toast.error("Full name is required.");
              if (isNaN(age) || age < 3 || age > 60)
                return toast.error("Age must be between 10 and 50.");
              if (!/^\d{11}$/.test(mobileNumber))
                return toast.error("Mobile number must be exactly 11 digits.");
              if (password && password.length < 8)
                return toast.error("Password must be at least 8 characters.");

              // ✅ append all fields
              for (let [key, value] of formFields.entries()) {
                data.append(key, value);
              }

              // ✅ append selected image if any
              if (selectedFile) data.append("file", selectedFile);

              setLoading(true);
              try {
                const res = await axios.put("https://footballhub.azurewebsites.net/profile", data, {
                  withCredentials: true,
                  headers: { "Content-Type": "multipart/form-data" },
                });

                if (res.data.success) {
                  toast.success("Profile updated successfully!");
                  setCurrentPlayer(res.data.data);
                  setPreview(null);
                  setShowEdit(false);
                } else {
                  toast.error(res.data.message || "Something went wrong, please try again!");
                }
              } catch (err) {
                toast.error(err?.response?.data?.message || "Something went wrong, Please try again later!")
              } finally {
                setLoading(false);
              }
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Full Name", name: "name", value: currentPlayer.name },
                { label: "Age", name: "age", value: currentPlayer.age, type: "number" },
                { label: "Mobile Number", name: "mobileNumber", value: currentPlayer.mobileNumber },
                { label: "Location", name: "location", value: currentPlayer.location },
              ].map((field) => (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  defaultValue={field.value}
                  type={field.type || "text"}
                  fullWidth
                  InputLabelProps={{
                    sx: { color: "gray", "&.Mui-focused": { color: "#00e5ff" } },
                  }}
                  sx={{
                    input: { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00e5ff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00e5ff",
                    },
                  }}
                />
              ))}

              {/* 🦶 Foot - Radio Buttons */}
              <Box>
                <Typography sx={{ color: "gray", mb: 1 }}>Preferred Foot</Typography>
                <RadioGroup row name="foot" defaultValue={currentPlayer.foot || ""}>
                  {["Left", "Right", "Both"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio sx={{ color: "#00e5ff" }} />}
                      label={<Typography sx={{ color: "white" }}>{opt}</Typography>}
                    />
                  ))}
                </RadioGroup>
              </Box>

              {/* ⚽ Position - Radio Buttons (hidden for Goalkeeper) */}
              {currentPlayer.position !== "Goalkeeper" && (
                <Box>
                  <Typography sx={{ color: "gray", mb: 1 }}>Position</Typography>
                  <RadioGroup row name="position" defaultValue={currentPlayer.position || ""}>
                    {["Defender", "Midfielder", "Forward"].map((opt) => (
                      <FormControlLabel
                        key={opt}
                        value={opt}
                        control={<Radio sx={{ color: "#00e5ff" }} />}
                        label={<Typography sx={{ color: "white" }}>{opt}</Typography>}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}

              {/* 🔐 Password with Toggle */}
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="New Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  placeholder="Enter new password (optional)"
                  InputLabelProps={{
                    sx: { color: "gray", "&.Mui-focused": { color: "#00e5ff" } },
                  }}
                  sx={{
                    input: { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.15)",

                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00e5ff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00e5ff",
                    },
                  }}
                  inputProps={{ minLength: 8 }}
                />
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#00e5ff",
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>
            </Box>

            {/* ==== Save Button with Spinner ==== */}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                px: 6,
                py: 1.3,
                borderRadius: "30px",
                fontWeight: "bold",
                background: "linear-gradient(135deg,#00e5ff,#0077ff)",
                display: "flex",
                alignItems: "center",
                mx: "auto",
                justifyContent: "center",
              }}
            >
              {loading ? (

                <CircularProgress size={20} sx={{ color: "white" }} />

              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Box>
      )}

      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />
      {/* ==== Performance Stats Section ==== */}
      <Box sx={{ mt: 5 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 4, textTransform: "uppercase" }}
        >
          📊 Performance Stats
        </Typography>

        <Grid container spacing={3} justifyContent="center" textAlign="center">
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">🎮 Matches</Typography>
            <Typography variant="h6" color="gray">{player.matches}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">⚽ Goals</Typography>
            <Typography variant="h6" color="gray">{player.goals}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">🎯 Assists</Typography>
            <Typography variant="h6" color="gray">{player.assists}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">🏆 Wins</Typography>
            <Typography variant="h6" color="gray">{player.wins}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">🤝 Draws</Typography>
            <Typography variant="h6" color="gray">{player.draws}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">❌ Losses</Typography>
            <Typography variant="h6" color="gray">{player.losses}</Typography>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">📈 Win Rate</Typography>
            <Typography variant="h6" color="gray">
              {player.matches > 0
                ? `${Math.round((player.wins / player.matches) * 100)}%`
                : "0%"}
            </Typography>
          </Grid>
        </Grid>

        {/* Aura Points Highlight */}
        {player.auraPoints > 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{
                letterSpacing: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span style={{ fontSize: "1.2em" }}>👑</span>
              {/* Number with glow */}
              <span
                style={{
                  color: "#FFD700",
                  textShadow:
                    "0 0 8px rgba(255, 215, 0, 0.8), 0 0 16px rgba(255, 165, 0, 0.6)",
                  animation: "softPulse 2s infinite",
                }}
              >
                {player.auraPoints}+
              </span>

              {/* Aura text with subtle glow */}
              <Typography
                component="span"
                variant="h5"
                sx={{
                  ml: 1,
                  color: "#FFA500",
                  textShadow: "0 0 6px rgba(255,165,0,0.8)",
                }}
              >
                Aura
              </Typography>
            </Typography>
          </Box>
        )}


        {/* Keyframes for subtle glowing effect */}
        <style>
          {`
    @keyframes softPulse {
      0%   { text-shadow: 0 0 6px rgba(255, 215, 0, 0.6), 0 0 12px rgba(255,165,0,0.4); }
      50%  { text-shadow: 0 0 12px rgba(255, 215, 0, 1), 0 0 24px rgba(255,165,0,0.8); }
      100% { text-shadow: 0 0 6px rgba(255, 215, 0, 0.6), 0 0 12px rgba(255,165,0,0.4); }
    }
  `}
        </style>


      </Box>
      {/* Divider for next section */}
      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* ==== Skill Breakdown Section ==== */}
      <Box sx={{ mt: 10 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 5, textTransform: "uppercase" }}
        >
          ⚡ Skill Breakdown
        </Typography>

        {/* Overall Rating */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          {(() => {
            let overall = player.overalRating;

            if (overall === 0) {
              if (player.position?.toLowerCase() === "goalkeeper") {
                const gkSkills = [
                  player.diving,
                  player.handling,
                  player.kicking,
                  player.reflexes,
                  player.positioning,
                  player.speed,
                ];
                overall = Math.round(
                  gkSkills.reduce((sum, val) => sum + (val || 0), 0) / gkSkills.length
                );
              } else {
                const fieldSkills = [
                  player.pace,
                  player.shooting,
                  player.passing,
                  player.dribbling,
                  player.defence,
                  player.physical,
                ];
                overall = Math.round(
                  fieldSkills.reduce((sum, val) => sum + (val || 0), 0) / fieldSkills.length
                );
              }
            }

            return (
              <>
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 2,
                    letterSpacing: 2,
                    color: "#00e5ff",
                    textShadow:
                      "0 0 12px rgba(0,229,255,0.8), 0 0 24px rgba(0,229,255,0.6)",
                  }}
                >
                  {overall}/100
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "gray" }}>
                  Overall Rating
                </Typography>
              </>
            );
          })()}
        </Box>

        {/* Skills List */}
        <Grid container spacing={3} direction="column">
          {(player.position?.toLowerCase() === "goalkeeper"
            ? [
              { label: "🧤 Diving", value: player.diving },
              { label: "✋ Handling", value: player.handling },
              { label: "🦵 Kicking", value: player.kicking },
              { label: "⚡ Reflexes", value: player.reflexes },
              { label: "📍 Positioning", value: player.positioning },
              { label: "🚀 Speed", value: player.speed },
            ]
            : [
              { label: "⚡ Pace", value: player.pace },
              { label: "🎯 Shooting", value: player.shooting },
              { label: "📡 Passing", value: player.passing },
              { label: "🤹 Dribbling", value: player.dribbling },
              { label: "🛡 Defence", value: player.defence },
              { label: "💪 Physical", value: player.physical },
            ]
          ).map((skill, idx) => (
            <Grid item xs={12} key={idx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Label */}
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ minWidth: 120 }}
                >
                  {skill.label}
                </Typography>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={skill.value}
                  sx={{
                    flexGrow: 1,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      background:
                        player.position?.toLowerCase() === "goalkeeper"
                          ? "linear-gradient(90deg, #00e5ff, #00ff88)"
                          : "linear-gradient(90deg, #ff0080, #ff8c00)",
                      boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                    },
                  }}
                />

                {/* Value */}
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 50,
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#ccc",
                  }}
                >
                  {skill.value}/100
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Divider for next section */}
      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* ==== Ratings & Discipline Section ==== */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 4, textTransform: "uppercase" }}
        >
          ⭐ Ratings & Discipline
        </Typography>

        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {/* Average Rating */}
          <Grid item xs={12} md={4} textAlign="center">
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: "#00e5ff",
                textShadow: "0 0 12px rgba(0,229,255,0.8)",
                mb: 1,
              }}
            >
              {player.ratingAvg?.toFixed(1)} / 5
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "gray" }}>
              Average Player Rating
            </Typography>

            <Box sx={{ mt: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = player.ratingAvg || 0;
                const fullStar = i + 1 <= Math.floor(rating);
                const halfStar = !fullStar && i < rating && rating % 1 >= 0.25 && rating % 1 < 0.75;

                return (
                  <span
                    key={i}
                    style={{
                      fontSize: "2rem",
                      margin: "0 3px",
                      color: fullStar ? "#FFD700" : halfStar ? "#FFC107" : "gray",
                    }}
                  >
                    {halfStar ? "⯨" : "★"}
                  </span>
                );
              })}
            </Box>

          </Grid>

          {/* Discipline - Both Cards together */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap", // ensures they wrap on small screens if needed
            }}
          >
            {/* Yellow Cards */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 3,
                py: 3,
                borderRadius: "15px",
                background: "rgba(255, 215, 0, 0.1)",
                border: "2px solid #FFD700",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 15px rgba(255,215,0,0.6)",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
                minWidth: "120px",
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ color: "#FFD700" }}>
                🟨 {player.yellowCards || 0}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#FFD700", mt: 1 }}>
                Yellow Cards
              </Typography>
            </Box>

            {/* Red Cards */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 3,
                py: 3,
                borderRadius: "15px",
                background: "rgba(255, 0, 0, 0.1)",
                border: "2px solid #FF0000",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 15px rgba(255,0,0,0.6)",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
                minWidth: "120px",
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ color: "#FF0000" }}>
                🟥 {player.redCards || 0}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#FF4E50", mt: 1 }}>
                Red Cards
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Fair Play Index */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            ⚡ Fair Play Index
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.max(
              0,
              100 - ((player.yellowCards || 0) * 5 + (player.redCards || 0) * 15)
            )}
            sx={{
              width: "60%",
              mx: "auto",
              height: 14,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #00ff88, #00e5ff)",
                boxShadow: "0 0 8px rgba(0,255,136,0.8)",
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "gray", fontStyle: "italic" }}
          >
            Higher = Better Discipline
          </Typography>
        </Box>
      </Box>

      {/* Divider for next section */}
      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* ==== Teams Section ==== */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 4, textTransform: "uppercase" }}
        >
          🏟 Teams
        </Typography>

        {loadingTeams ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress color="info" />
          </Box>
        ) : teamsData.length === 0 ? (
          <Typography variant="body1" color="gray" align="center">
            This player has not joined any team yet.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              borderRadius: "12px",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Logo</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Location</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Founded</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Captain</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Matches</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>W-D-L</TableCell>
                  <TableCell sx={{ color: "#00e5ff", fontWeight: "bold" }}>Avg Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamsData.map((team) => (
                  <TableRow
                    key={team.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover td": {
                        backgroundColor: "rgba(0, 23, 65, 0.47)", // cells ka bg change hoga
                      },
                    }}
                    onClick={() => navigate(`/teams/${team.id}`, { state: { team } })}
                  >
                    <TableCell>
                      <Avatar src={team.logoUrl} alt={team.name} />
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      {team.name}
                    </TableCell>
                    <TableCell sx={{ color: "gray" }}>{team.location}</TableCell>
                    <TableCell sx={{ color: "gray" }}>{team.foundedYear}</TableCell>
                    <TableCell sx={{ color: "gray" }}>{team.captain}</TableCell>
                    <TableCell sx={{ color: "gray" }}>{team.matchesPlayed}</TableCell>
                    <TableCell sx={{ color: "gray" }}>
                      {team.wins}-{team.draws}-{team.losses}
                    </TableCell>
                    <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                      {team.ratingAvg?.toFixed(1) || 0}/5
                    </TableCell>
                  </TableRow>

                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Divider Teams Section */}
      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* // ==== Achievements Section ==== */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          🏆 Achievements
        </Typography>

        {loadingAchievements ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 180,
                  height: 200,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.1)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </Box>
        ) : !player?.achievements || player.achievements.length === 0 ? (
          <Typography variant="body1" color="gray" align="center">
            No achievements yet.
          </Typography>
        ) : (
          <>
            {/* MOTM Counter */}
            {motmCount === 0 ? "" :
              <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
                <Box
                  sx={{
                    px: 4,
                    py: 3,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #FFD700, #FFA500)",
                    color: "#000",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: "220px",
                    boxShadow: "0 0 15px 0.1px  rgba(172, 249, 255, 1)",
                  }}
                >
                  <Typography variant="h3" fontWeight="bold">
                    🥇 {motmCount}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Man of the Match
                  </Typography>
                </Box>
              </Box>
            }


            {/* Trophy Grid */}
            <Grid container spacing={3} justifyContent="center">
              {Object.entries(trophyCounts).map(([trophyId, count]) => {
                const trophy = trophyDetails[trophyId];
                return (
                  <Grid item xs={12} sm={6} md={4} key={trophyId}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: "20px",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid rgba(255,215,0,0.5)",
                        textAlign: "center",
                        position: "relative",
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "scale(1.04)",
                          boxShadow: "0 0 15px 0.1px rgba(255,215,0,0.5)",
                        },
                      }}
                    >
                      {/* Trophy Icon */}
                      <Avatar
                        src={trophy?.icon}
                        alt={trophy?.title}
                        sx={{
                          width: 90,
                          height: 90,
                          mx: "auto",
                          mb: 2,
                          border: "3px solid gold",
                          //boxShadow: "0 0 15px rgba(255,215,0,0.7)",
                        }}
                      />

                      {/* Trophy Title */}
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: "#FFD700" }}
                      >
                        {trophy?.title}
                      </Typography>

                      {/* Count Badge */}
                      <Box
                        sx={{
                          mt: 1,
                          px: 2,
                          py: 0.5,
                          display: "inline-block",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #00e5ff, #0077ff)",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          //boxShadow: "0 0 10px rgba(0,229,255,0.7)",
                        }}
                      >
                        Won {count} {count > 1 ? "times" : "time"}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>

      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      <div className="p-6 rounded-xl shadow-lg" >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "#fff",
            textShadow: "1px 1px 6px rgba(0,0,0,0.5)"
          }}
        >
          🚀 Matches Performance
        </Typography>

        {matchHistory.length === 0 ? (
          <p align="center" style={{ color: "#ddd", fontStyle: "italic" }}>No match history available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr) => {
                  const d = new Date(dateStr);
                  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                }}
                tick={{ fill: "#ffffffcc" }}
              />
              <YAxis domain={[0, 100]} tick={{ fill: "#ffffffcc", fontWeight: "bold" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#ffffffcc" }} />

              {/* Bars - Gradient color */}
              <Bar dataKey="overallPerformance" barSize={30} name="Result" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#grad-${index})`}
                  />
                ))}
              </Bar>

              <defs>
                {barData.map((entry, index) => (
                  <linearGradient key={index} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.barColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={entry.barColor} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>

              {/* Line - glow effect */}
              <Line
                type="monotone"
                dataKey="overallPerformance"
                stroke="#00a2ffff"
                strokeWidth={3}
                dot={{ r: 6, fill: "#ffd700" }}
                activeDot={{ r: 8, fill: "#ffdd59", stroke: "#fff", strokeWidth: 2 }}
                name="Performance"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <Divider
        sx={{
          my: 5,
          mb: 8,

          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

    </Box>

  );
}
