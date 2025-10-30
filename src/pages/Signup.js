import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Avatar,
  IconButton,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    dob: "",
    city: "",
    foot: "",
    position: "",
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // calculate age from dob
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // input style
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

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle image upload
  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        profileImage: e.target.files[0],
      }));
    }
  };

  // validation
  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Required";
    } else if (/\s/.test(formData.name)) {
      newErrors.name = "Name cannot contain spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid Email";
    }
    if (!formData.password) {
      newErrors.password = "Required";
    } else if (formData.password.length < 8) {
      newErrors.password = "At least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!/^\d{11}$/.test(formData.mobile)) {
      newErrors.mobile = "Invalid Mobile Number";
    }

    if (!formData.dob) newErrors.dob = "Required";
    if (!formData.mobile) newErrors.mobile = "Required";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.foot) newErrors.foot = "Required";
    if (!formData.position) newErrors.position = "Required";
    if (!formData.profileImage) newErrors.profileImage = "Profile image is required";

    return newErrors;
  };

  // handle submit
  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const age = calculateAge(formData.dob);

        // prepare formData for file upload
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("mobileNumber", formData.mobile);
        data.append("age", age);
        data.append("location", formData.city);
        data.append("position", formData.position);
        data.append("foot", formData.foot);
        data.append("file", formData.profileImage);

        await axios.post("https://footballhub.azurewebsites.net/signup", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          mobile: "",
          dob: "",
          city: "",
          foot: "",
          position: "",
          profileImage: null,
        });
        setErrors({});
        toast.success("Sign Up Successfull, Please Login Now!");
        navigate("/login");

      } catch (err) {
        toast.error(err?.response?.data?.error || "Something went wrong, Please try again later!")
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
        mb: 8,
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
          <PersonAddAlt1Icon sx={{ fontSize: 28, color: "#00eaff" }} />
          Sign Up
        </Typography>

        {/* Profile Upload */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <label htmlFor="upload-image">
            <input
              accept="image/*"
              id="upload-image"
              type="file"
              hidden
              onChange={handleImageUpload}
            />
            <Avatar
              src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : ""}
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
        {errors.profileImage && (
          <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
            {errors.profileImage}
          </Typography>
        )}

        {/* Name */}
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={(e) => {
            const value = e.target.value;
            // Prevent typing spaces directly
            if (/\s/.test(value)) {
              setErrors((prev) => ({ ...prev, name: "Name cannot contain spaces" }));
            } else {
              setErrors((prev) => ({ ...prev, name: "" }));
            }
            setFormData((prev) => ({ ...prev, name: value }));
          }}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          sx={textFieldSx}
        />

        {/* Email */}
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email}
          sx={textFieldSx}
        />

        {/* Password */}
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password}
          sx={textFieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#00eaff" }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          sx={textFieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: "#00eaff" }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Mobile */}
        <TextField
          label="Mobile Number"
          name="mobile"
          type="tel"
          value={formData.mobile}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.mobile}
          helperText={errors.mobile}
          sx={textFieldSx}
        />

        {/* DOB */}
        <TextField
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.dob}
          helperText={errors.dob}
          InputLabelProps={{ shrink: true }}
          sx={{
            ...textFieldSx,
            input: { color: "white" },
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              filter: "invert(0.7)",
              cursor: "pointer",
            },
          }}
        />

        {/* City */}
        <TextField
          label="City / Location"
          name="city"
          value={formData.city}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.city}
          helperText={errors.city}
          sx={textFieldSx}
        />

        {/* Foot (Radio) */}
        <Typography sx={{ color: "#00eaff", mt: 2, mb: 1 }}>Preferred Foot</Typography>
        <RadioGroup row name="foot" value={formData.foot} onChange={handleChange}>
          <FormControlLabel value="right" control={<Radio sx={{ color: "#00eaff" }} />} label={<span style={{ color: "white" }}>Right</span>} />
          <FormControlLabel value="left" control={<Radio sx={{ color: "#00eaff" }} />} label={<span style={{ color: "white" }}>Left</span>} />
          <FormControlLabel value="both" control={<Radio sx={{ color: "#00eaff" }} />} label={<span style={{ color: "white" }}>Both</span>} />
        </RadioGroup>
        {errors.foot && <Typography color="error">{errors.foot}</Typography>}

        {/* Position */}
        <TextField
          select
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.position}
          helperText={errors.position}
          sx={textFieldSx}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: "#15181B",
                  color: "white",
                  "& .MuiMenuItem-root": {
                    "&:hover": { backgroundColor: "#00eaff33" },
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="Goalkeeper">Goalkeeper</MenuItem>
          <MenuItem value="Defender">Defender</MenuItem>
          <MenuItem value="Midfielder">Midfielder</MenuItem>
          <MenuItem value="Forward">Forward</MenuItem>
        </TextField>

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
          {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign Up"}
        </Button>
      </Box>
    </Box>
  );
}
