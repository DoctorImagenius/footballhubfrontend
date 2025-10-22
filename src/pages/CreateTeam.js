import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CreateTeam() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    foundedYear: "",
    logo: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🎨 Same TextField styling as SignupForm
  const textFieldSx = {
    "& .MuiInputBase-input": { color: "white" },
    "& .MuiInputLabel-root": { color: "#00eaff" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#00eaff" },
      "&:hover fieldset": { borderColor: "#00eaff" },
      "&.Mui-focused fieldset": { borderColor: "#00eaff" },
    },
    mb: 2,
  };

  // 🧠 Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🖼️ Handle logo upload
  const handleLogoUpload = (e) => {
    if (e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        logo: e.target.files[0],
      }));
    }
  };

  // ✅ Validate inputs
  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Team name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.foundedYear.trim()) newErrors.foundedYear = "Founded year is required";
    else if (!/^\d{4}$/.test(formData.foundedYear))
      newErrors.foundedYear = "Enter a valid year (e.g., 2020)";
    if (!formData.logo) newErrors.logo = "Team logo is required";
    return newErrors;
  };

  // 🚀 Submit handler
  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("location", formData.location);
        data.append("foundedYear", formData.foundedYear);
        data.append("logo", formData.logo);
        let res = await axios.post("https://footballhub.azurewebsites.net/team", data, { withCredentials: true });
        toast.success("Team created successfully!");
        setFormData({ name: "", location: "", foundedYear: "", logo: null });
        setErrors({});
        navigate("/team-success", {
          state: { team: res.data.data }, // assuming your backend returns team data
        });

      } catch (err) {
        toast.error("Something went wrong, Please try again later!");
      } finally {
        setLoading(false);
      }
    }
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
          maxWidth: 420,
          p: { xs: 3, sm: 5, md: 6 },
          borderRadius: 4,
          border: "1px solid #00eaff33",
          transition: "0.3s",
          boxShadow: "0px 0px 10px rgba(0, 200, 255, 0.15)",
          "&:hover": {
            boxShadow: "0px 0px 20px rgba(0, 200, 255, 0.25)",
          },
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
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: "1.6rem", sm: "1.8rem" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GroupsIcon sx={{ fontSize: 28, color: "#00eaff" }} />
          Create Team
        </Typography>

        {/* Logo Upload */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <label htmlFor="upload-logo">
            <input
              accept="image/*"
              id="upload-logo"
              type="file"
              hidden
              onChange={handleLogoUpload}
            />
            <Avatar
              src={formData.logo ? URL.createObjectURL(formData.logo) : ""}
              sx={{
                width: 80,
                height: 80,
                cursor: "pointer",
                bgcolor: "#112",
                border: "2px solid #00eaff",
                "&:hover": { boxShadow: "0 0 10px #00eaff" },
              }}
            />
          </label>
        </Box>
        {errors.logo && (
          <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
            {errors.logo}
          </Typography>
        )}

        {/* Team Name */}
        <TextField
          label="Team Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          sx={textFieldSx}
        />

        {/* Location */}
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.location}
          helperText={errors.location}
          sx={textFieldSx}
        />

        {/* Founded Year */}
        <TextField
          label="Founded Year"
          name="foundedYear"
          value={formData.foundedYear}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.foundedYear}
          helperText={errors.foundedYear}
          sx={textFieldSx}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
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
            "Create Team"
          )}
        </Button>
      </Box>
    </Box>
  );
}
