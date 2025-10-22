import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  TextField,
  Grid,
  Divider,
  Rating,
  Card,
  Radio,
  RadioGroup,
  FormControlLabel,
  Modal,
  MenuItem
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useFootball } from "../FootballContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PaidIcon from "@mui/icons-material/Paid"; // Coins / Points icon

export default function TrainerDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const trainerFromState = location.state?.trainer;
  const [trainer, setTrainer] = useState(trainerFromState || null);
  const [loading, setLoading] = useState(!trainerFromState);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [hasEnoughPoints, setHasEnoughPoints] = useState(false);
  const [showBookBox, setShowBookBox] = useState(false);
  const [booking, setBooking] = useState(false); // loading state
  const { currentPlayer, isLogin } = useFootball();
  const userEmail = currentPlayer?.email || "";
  const isOwner = userEmail === trainer?.playerId;

  useEffect(() => {
    if (currentPlayer?.points >= trainer.points) {
      setHasEnoughPoints(true);
    } else {
      setHasEnoughPoints(false);
    }
  }, [currentPlayer, trainer]);


  useEffect(() => {
    if (!trainerFromState) fetchTrainer();
  }, []);

  const fetchTrainer = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://footballhub.azurewebsites.net/trainers/${location.state?.trainer?.playerId}`,
        { withCredentials: true }
      );
      setTrainer(res.data.data);
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      setEditing(false);
      return;
    }
    setFormData({
      title: trainer.title || "",
      description: trainer.description || "",
      price: trainer.price || "",
      points: trainer.points || "",
      timeSlot: trainer.timeSlot || "",
      status: trainer.status || "active",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (isNaN(formData.price) || isNaN(formData.points)) {
      return toast.error("Price and Points must be numeric!");
    }
    try {
      setSaving(true);
      const res = await axios.put("https://footballhub.azurewebsites.net/trainer", formData, {
        withCredentials: true,
      });
      setTrainer(res.data.data);
      toast.success("Trainer updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "#00e5ff" }} />
      </Box>
    );

  if (!trainer)
    return (
      <Typography sx={{ color: "#ccc", textAlign: "center", mt: 10 }}>
        Trainer not found.
      </Typography>
    );

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 10,
        px: 2,
        color: "white",
        fontFamily: "Orbitron, sans-serif",
      }}
    >
      {/* ==== Trainer Header ==== */}
      <Box sx={{ textAlign: "center", mb: 5, position: "relative" }}>
        {/* Avatar with status dot */}
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={
              trainer.imageUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={trainer.name}
            sx={{
              width: 180,
              height: 180,
              mx: "auto",
              mb: 3,
              mt: 4,
              border:
                trainer.status === "active"
                  ? "10px solid #00ff7f"
                  : "10px solid #ff5252",
            }}
          />
        </Box>

        <Typography variant="h3" fontWeight="bold" sx={{ letterSpacing: 2 }}>
          {trainer.name}
        </Typography>

        <Typography
          variant="h6"
          sx={{ color: "#00e5ff", mb: 1, textTransform: "capitalize" }}
        >
          {trainer.title}
        </Typography>

        {/* ⭐ Rating */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Rating
            value={trainer.ratingAvg || 0}
            precision={0.5}
            readOnly
            sx={{
              "& .MuiRating-iconFilled": { color: "#ffd000ff" },
              "& .MuiRating-iconEmpty": { color: "#555" },
            }}
          />
        </Box>
        <Typography sx={{ color: "#aaa", fontSize: 13 }}>
          ({trainer.ratingCount || 0} reviews)
        </Typography>
        {isLogin ? <>
          {!isOwner && trainer.status === "active" ? <Button
            variant="outlined"
            onClick={() => setShowBookBox(prev => !prev)}
            sx={{
              color: "#00e5ff",
              borderRadius: "30px",
              px: 5,
              py: 1.2,
              mt: 4,
              fontWeight: "bold",
              borderColor: "rgba(255,255,255,0.2)",
              "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },

            }}
          >
            Book Trainer
          </Button> : ""}
        </> : ""}




        {isLogin && !isOwner && trainer.status === "active" && (
          <Box
            sx={{
              mt: 4,
              maxWidth: 600,
              mx: "auto",
              borderRadius: 3,
              overflow: "hidden",
              display: showBookBox ? "flex" : "none",
              flexDirection: "column",
              background: "linear-gradient(145deg, rgba(0,0,0,0.45), rgba(0,0,0,0.6))",
              transition: "all 0.3s ease",
              border: "1px solid #50505077",
            }}
          >
            {/* ===== Top: WhatsApp / RS Booking ===== */}
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,229,255,0.05))",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WhatsAppIcon sx={{ color: "#25D366", fontSize: 26 }} />
                <Typography sx={{ color: "#00e5ff", fontWeight: "bold", fontSize: 16 }}>
                  Book via WhatsApp
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                  {trainer.mobileNumber || "No number available"}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                    borderRadius: "50%",
                    borderColor: "#00e5ff55",
                    color: "#00e5ff",
                    "&:hover": {
                      borderColor: "#00e5ff",
                      background: "#00e5ff22",
                    },
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(trainer.mobileNumber || "");
                    toast.success("WhatsApp number copied!");
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>


              <Typography sx={{ color: "#aaa", fontSize: 12, mt: 1, textAlign: "center" }}>
                Tap the number to copy. Open WhatsApp to message the trainer directly.
              </Typography>
              <Typography sx={{ color: "#ccc", mt: 1, fontSize: 14, fontWeight: "bold" }}>
                Session Fee: <span style={{ color: "#00e5ff" }}>₹ {trainer.points || 0}</span>
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<WhatsAppIcon />}
                sx={{
                  background: "linear-gradient(90deg, #25D366, #128C7E)",
                  color: "#fff",
                  py: 1.2,
                  mt: 3,
                  borderRadius: 10,
                  fontWeight: "bold",
                  "&:hover": { background: "linear-gradient(90deg, #20c05a, #0f7a6b)" },
                }}
                onClick={() => {
                  if (trainer?.mobileNumber) {
                    window.open(
                      `https://wa.me/${trainer.mobileNumber}?text=Hi, I'm interested for a training session with you.`,
                      "_blank"
                    );
                  } else {
                    toast.error("Trainer's number not available");
                  }
                }}
              >
                Message Trainer
              </Button>
            </Box>

            {/* ===== Bottom: Points Booking ===== */}
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                background: "linear-gradient(145deg, rgba(0,229,255,0.05), rgba(0,183,255,0.1))",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaidIcon sx={{ color: "#ffd700" }} />
                <Typography sx={{ color: "#00e5ff", fontWeight: "bold", fontSize: 16 }}>
                  Book via Points
                </Typography>
              </Box>

              <Typography sx={{ color: "#ccc", fontSize: 14 }}>
                {trainer.points || 0} Points Required
              </Typography>

              {!hasEnoughPoints && (
                <Typography sx={{ color: "#ff5252", fontWeight: "bold", fontSize: 13 }}>
                  ⚠️ Not enough points
                </Typography>
              )}
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  px: 6,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: 14,
                  color: "#fff",
                  background: "linear-gradient(90deg, #00e5ff, #00b8ff)",
                  boxShadow: "0 4px 15px rgba(0,229,255,0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #00b8ff, #0099cc)",
                    boxShadow: "0 6px 20px rgba(0,229,255,0.4)",
                  },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
                disabled={!hasEnoughPoints || booking}
                onClick={async () => {
                  try {
                    setBooking(true); // start loading
                    const res = await axios.post(
                      "https://footballhub.azurewebsites.net/book-trainer",
                      {
                        trainerEmail: trainer.playerId,        // trainer's id/email
                        playerEmail: currentPlayer.email,   // player's id/email
                        points: trainer.points,
                      },
                      { withCredentials: true }
                    );

                    if (res.data.success) {
                      toast.success("Booking request sent to trainer!");
                    } else {
                      toast.error("Something went wrong, Please try again later!");

                    }
                  } catch (err) {
                    toast.error("Something went wrong, Please try again later!");

                  } finally {
                    setBooking(false); // stop loading
                  }
                }}
              >
                {booking ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Book Now"}
              </Button>
            </Box>
          </Box>
        )}









        {/* Buttons */}
        {isOwner && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleEditToggle}
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
              {editing ? "Close Edit" : "Edit"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenDeleteConfirm(true)}
              sx={{
                borderRadius: "30px",
                px: 5,
                py: 1.2,
                fontWeight: "bold",
                color: "#ff5252",
                borderColor: "rgba(255,255,255,0.2)",
                "&:hover": { borderColor: "#ff5252", background: "#ff000025" },
              }}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {/* ==== Edit Section ==== */}
      {editing && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        >
          <Typography variant="h6" sx={{ color: "#00e5ff", mb: 2 }}>
            ✏️ Edit Trainer Profile
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Title Dropdown */}
            <TextField
              select
              label="Training Type"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#00eaff55" },
                  "&:hover fieldset": { borderColor: "#00eaff" },
                  "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                },
                "& .MuiInputLabel-root": { color: "#cfd8dc" },
                "& .MuiInputBase-input": { color: "#fff" },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      backgroundColor: "#111",
                      color: "#fff",
                      "& .MuiMenuItem-root:hover": { backgroundColor: "#222" },
                    },
                  },
                },
              }}
            >
              {[
                "Fitness Trainer",
                "Goalkeeper Coach",
                "Defensive Coach",
                "Midfield Coach",
                "Striker Coach",
                "Tactical Coach",
                "Strength & Conditioning Trainer",
                "Dribbling Specialist",
                "Free Kick Specialist",
                "Speed & Agility Coach",
              ].map((title, i) => (
                <MenuItem key={i} value={title}>
                  {title}
                </MenuItem>
              ))}
            </TextField>

            {/* Description */}
            <TextField
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{
                textarea: { color: "#fff" },
                label: { color: "#aaa" },
                "& .MuiOutlinedInput-root": {
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#00eaff55" },
                  "&:hover fieldset": { borderColor: "#00eaff" },
                  "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                },
              }}
            />

            {/* Fee */}
            <TextField
              label="Training Fee (Rs)"
              type="number"
              value={formData.price || 0}
              onChange={(e) => setFormData({ ...formData, price: e.target.value || 0 })}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
                "& .MuiOutlinedInput-root": {
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#00eaff55" },
                  "&:hover fieldset": { borderColor: "#00eaff" },
                  "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                },
              }}
            />

            {/* Points */}
            <TextField
              label="Points"
              type="number"
              value={formData.points || 0}
              onChange={(e) => setFormData({ ...formData, points: e.target.value || 0 })}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
                "& .MuiOutlinedInput-root": {
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#00eaff55" },
                  "&:hover fieldset": { borderColor: "#00eaff" },
                  "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                },
              }}
            />

            {/* Time Slot Dropdown */}
            <TextField
              select
              label="Available Time Slot"
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#00eaff55" },
                  "&:hover fieldset": { borderColor: "#00eaff" },
                  "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                },
                "& .MuiInputLabel-root": { color: "#cfd8dc" },
                "& .MuiInputBase-input": { color: "#fff" },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      backgroundColor: "#111",
                      color: "#fff",
                      "& .MuiMenuItem-root:hover": { backgroundColor: "#222" },
                    },
                  },
                },
              }}
            >
              {[
                "6 AM - 9 AM",
                "9 AM - 12 PM",
                "12 PM - 3 PM",
                "3 PM - 6 PM",
                "6 PM - 9 PM",
                "9 PM - 12 AM",
                "Custom",
              ].map((slot, i) => (
                <MenuItem key={i} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </TextField>

            {/* Custom Time Slot */}
            {formData.timeSlot === "Custom" && (
              <TextField
                label="Enter Custom Time Slot"
                placeholder="e.g. 7:30 AM - 10:30 AM"
                value={formData.customTime || ""}
                onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#aaa" },
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#00eaff55" },
                    "&:hover fieldset": { borderColor: "#00eaff" },
                    "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                  },
                }}
              />
            )}

            {/* Status */}
            <Box>
              <Typography sx={{ color: "#aaa", mb: 1 }}>Status:</Typography>
              <RadioGroup
                row
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <FormControlLabel
                  value="active"
                  control={<Radio sx={{ color: "#00ff7f" }} />}
                  label="Active"
                />
                <FormControlLabel
                  value="inactive"
                  control={<Radio sx={{ color: "#ff5252" }} />}
                  label="Inactive"
                />
              </RadioGroup>
            </Box>

            {/* Save Button */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleSave}
                disabled={saving}
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
                {saving ? (
                  <CircularProgress size={22} sx={{ color: "#00e5ff" }} />
                ) : (
                  "Update Profile"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.2)" }} />

      {/* ==== Info Section ==== */}
      <Grid container spacing={2} justifyContent="center">
        {[
          { label: "💰 Fee", value: trainer.price },
          { label: "⭐ Points", value: trainer.points },
          { label: "⏰ Time Slot", value: trainer.timeSlot || "Not specified" },
          { label: "📍 Location", value: trainer.location },
          { label: "📱 Mobile", value: trainer.mobileNumber },
          { label: "📧 Email", value: trainer.playerId },
        ]
          // 🔹 Filter out empty or zero values
          .filter(
            (item) =>
              item.value !== undefined &&
              item.value !== null &&
              item.value !== "" &&
              Number(item.value) !== 0
          )
          .map((item, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  textAlign: "center",
                  p: 2,
                }}
              >
                <Typography sx={{ color: "#00e5ff", fontWeight: "bold" }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: "#ccc", mt: 0.5 }}>
                  {/* 💰 Price ko “Rs” ke sath format karo */}
                  {item.label.includes("Fee")
                    ? `Rs ${item.value}`
                    : item.value}
                </Typography>
              </Card>
            </Grid>
          ))}
      </Grid>
      {/* ==== About Section ==== */}
      <Box
        sx={{
          textAlign: "center",
          my: 3,
          p: 3,
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)",
          //boxShadow: "0 0 25px rgba(0,229,255,0.15)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#00e5ff",
            mb: 2,
            fontWeight: "bold",
          }}
        >
          💬 About Me
        </Typography>
        <Typography
          sx={{
            color: "#ccc",
            whiteSpace: "pre-line",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {trainer.description || "No description provided."}
        </Typography>

      </Box>
      <Divider sx={{ my: 5, mb: 8, borderColor: "rgba(255,255,255,0.2)" }} />
      <Modal open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 420,
            bgcolor: "#0a1929",
            borderRadius: 2,
            p: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#00e5ff",
              mb: 1,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            ⚠️ Confirm Deletion
          </Typography>

          <Typography sx={{ color: "#bbb", mb: 3 }}>
            Are you sure you want to delete this trainer profile?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              variant="outlined"
              sx={{
                color: "#00e5ff",
                borderColor: "rgba(255,255,255,0.2)",
                "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                px: 4,
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={async () => {
                try {
                  setSaving(true);
                  await axios.delete("https://footballhub.azurewebsites.net/trainer", {
                    withCredentials: true,
                  });
                  toast.success("Trainer deleted");
                  navigate("/trainers");
                } catch (err) {
                  toast.error("Something went wrong, Please try again later!");

                } finally {
                  setSaving(false);
                  setOpenDeleteConfirm(false);
                }
              }}
              variant="contained"
              sx={{
                background: "#ff5252",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#ff1744" },
                px: 4,
              }}
            >
              {saving ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}


