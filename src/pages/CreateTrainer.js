import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateTrainer() {
  const navigate = useNavigate();
  const trainerTitles = [
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
  ];
  const timeSlots = [
    "6 AM - 9 AM",
    "9 AM - 12 PM",
    "12 PM - 3 PM",
    "3 PM - 6 PM",
    "6 PM - 9 PM",
    "9 PM - 12 AM",
    "Custom",
  ];
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0",
    points: "0",
    timeSlot: "",
    customTime: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.title) newErrors.title = "Required";
    if (!formData.description.trim()) newErrors.description = "Required";
    if (!formData.timeSlot) newErrors.timeSlot = "Required";
    if (formData.timeSlot === "Custom" && !formData.customTime.trim())
      newErrors.customTime = "Please enter custom time slot";
    if (!formData.price) newErrors.price = "Required";
    else if (isNaN(formData.price) || Number(formData.price) < 0)
      newErrors.price = "Invalid Price";
    if (formData.points && (isNaN(formData.points) || Number(formData.points) < 0))
      newErrors.points = "Invalid Points";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      ...formData,
      price: formData.price?.trim() === "" ? "0" : formData.price,
      points: formData.points?.trim() === "" ? "0" : formData.points,
      timeSlot:
        formData.timeSlot === "Custom"
          ? formData.customTime
          : formData.timeSlot,
    };
    setLoading(true);
    try {
      await axios.post("https://footballhub.azurewebsites.net/trainer", payload, {
        withCredentials: true,
      });
      toast.success("Trainer profile created successfully!", {
        style: { background: "#007bff94", color: "#fff" },
      });
      navigate("/trainers");
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      background: "rgba(0,0,0,0.25)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#00eaff55" },
      "&:hover fieldset": { borderColor: "#00eaff" },
      "&.Mui-focused fieldset": { borderColor: "#00eaff" },
    },
    "& .MuiInputLabel-root": { color: "#cfd8dc" },
    "& .MuiInputBase-input": { color: "#fff" },
    "& .MuiMenuItem-root": {
      backgroundColor: "#111", // Dark background
      color: "#fff",           // White text
      "&:hover": {
        backgroundColor: "#222",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: "1px solid #00eaff33",
          background: "rgba(20,30,48,0.1)",
          boxShadow: "0px 0px 20px rgba(0, 200, 255, 0.15)",
          transition: "0.3s",
          margin: "100px auto",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#00eaff",
            letterSpacing: 1.5,
            mb: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddCircleOutline sx={{ fontSize: "1.8rem" }} />
          Become a Trainer
        </Typography>
        {/* Title */}

        <TextField
          select
          label="Training Type"
          name="title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          sx={inputStyle}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#111", // Dark dropdown background
                  color: "#fff",           // White text
                  "& .MuiMenuItem-root": {
                    "&:hover": {
                      backgroundColor: "#222",
                    },
                  },
                },
              },
            },
          }}
        >
          {trainerTitles.map((title, i) => (
            <MenuItem key={i} value={title}>
              {title}
            </MenuItem>
          ))}
        </TextField>

        {/* Description */}
        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          value={formData.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          sx={inputStyle}
        />

        {/* Price */}
        <TextField
          label="Training Fee (Rs)"
          name="price"
          fullWidth
          margin="normal"
          value={formData.price}
          onChange={handleChange}
          error={!!errors.price}
          helperText={errors.price}
          sx={inputStyle}
        />

        {/* Points */}
        <TextField
          label="Training Fee (Points)"
          name="points"
          fullWidth
          margin="normal"
          value={formData.points}
          onChange={handleChange}
          error={!!errors.points}
          helperText={errors.points}
          sx={inputStyle}
        />

        {/* Time Slot */}
        <TextField
          select
          label="Available Time Slot"
          name="timeSlot"
          fullWidth
          margin="normal"
          value={formData.timeSlot}
          onChange={handleChange}
          error={!!errors.timeSlot}
          helperText={errors.timeSlot}
          sx={inputStyle}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#111", // 🔥 dark dropdown background
                  color: "#fff",           // white text
                  "& .MuiMenuItem-root": {
                    "&:hover": {
                      backgroundColor: "#222", // smooth hover color
                    },
                  },
                },
              },
            },
          }}
        >
          {timeSlots.map((slot, i) => (
            <MenuItem key={i} value={slot}>
              {slot}
            </MenuItem>
          ))}
        </TextField>

        {/* Custom Time Slot */}
        {formData.timeSlot === "Custom" && (
          <TextField
            label="Enter Custom Time Slot"
            name="customTime"
            fullWidth
            margin="normal"
            placeholder="e.g. 7:30 AM - 10:30 AM"
            value={formData.customTime}
            onChange={handleChange}
            error={!!errors.customTime}
            helperText={errors.customTime}
            sx={inputStyle}
          />
        )}

        {/* Status */}
        <Typography sx={{ color: "#cfd8dc", mt: 2 }}>Status</Typography>
        <RadioGroup
          row
          name="status"
          value={formData.status}
          onChange={handleChange}
          sx={{ color: "#00eaff" }}
        >
          <FormControlLabel
            value="active"
            control={<Radio sx={{ color: "#00eaff" }} />}
            label="Active"
          />
          <FormControlLabel
            value="inactive"
            control={<Radio sx={{ color: "#f44336" }} />}
            label="Inactive"
          />
        </RadioGroup>

        {/* Submit */}
        <Button
          disabled={loading}
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            mt: 3,
            py: 1.3,
            borderRadius: "12px",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #00eaff, #007bff)",
            "&:hover": {
              background: "linear-gradient(90deg, #007bff, #00eaff)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Create Trainer Profile"
          )}
        </Button>
      </Box>
    </Box>
  );
}
