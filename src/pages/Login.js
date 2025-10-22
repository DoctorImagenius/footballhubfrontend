import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, LoginOutlined } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFootball } from "../FootballContext";

export default function Login() {
  const { setIsLogin, setCurrentPlayer } = useFootball();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // validation
  const validate = () => {
    let newErrors = {};
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
    return newErrors;
  };

  // handle submit
  const handleSubmit = async () => {
    setLoading(true);
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      let res = await axios.post("https://footballhub.azurewebsites.net/login", {
        email: formData.email,
        password: formData.password,
      }, { withCredentials: true });
      setCurrentPlayer(res.data.data);
      setFormData({ email: "", password: "" });
      setIsLogin(true);
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong, Please try again later!");
    }
    setLoading(false);
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
          background: "rgba(20,30,48,0.1)",
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
          <LoginOutlined sx={{ fontSize: "1.8rem", mr: 0.5 }} />
          Login
        </Typography>

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
          InputLabelProps={{ style: { color: "#cfd8dc" } }}
          InputProps={{ style: { color: "#fff" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: errors.email ? "red" : "#00eaff55" },
              "&:hover fieldset": {
                borderColor: errors.email ? "red" : "#00eaff",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.email ? "red" : "#00eaff",
              },
              background: "rgba(0, 0, 0, 0.3)",
            },
          }}
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
          InputLabelProps={{ style: { color: "#cfd8dc" } }}
          InputProps={{
            style: { color: "#fff" },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: "#00eaff" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: errors.password ? "red" : "#00eaff55" },
              "&:hover fieldset": {
                borderColor: errors.password ? "red" : "#00eaff",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.password ? "red" : "#00eaff",
              },
              background: "rgba(0, 0, 0, 0.3)",
            },
          }}
        />

        {/* Forgot Password */}
        <Box textAlign="right" mt={1}>
          <Link
            onClick={() => toast.info("Please inform to Admin, Thank you!")}
            underline="hover"
            sx={{ color: "#00eaff", fontSize: "0.9rem", cursor: "pointer" }}
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Login button */}
        <Button
          disabled={loading}
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            mt: { xs: 2, sm: 3 },
            py: { xs: 1.2, sm: 1.3 },
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.05rem" },
            background: "linear-gradient(90deg, #00eaff, #007bff)",
            "&:hover": {
              background: "linear-gradient(90deg, #007bff, #00eaff)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
        </Button>

        {/* Sign up link */}
        <Typography
          align="center"
          sx={{ mt: 2, fontSize: "0.95rem", color: "#cfd8dc" }}
        >
          Don’t have an account?{" "}
          <Link
            component={RouterLink}
            to="/signup"
            underline="hover"
            sx={{ color: "#00eaff", fontWeight: "bold" }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
