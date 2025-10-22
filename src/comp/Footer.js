import { Box, Typography, IconButton, Link, Stack } from "@mui/material";
import { Facebook, Instagram, LinkedIn, GitHub, Email, Phone } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: { xs: 5, md: 6 },
        pb: { xs: 15, md: 6, sm:15 },
        px: { xs: 3, md: 6 },
        background: "rgba(0, 140, 255, 0.05)",
      }}
    >
      {/* 🌐 Social Icons */}
      <Box sx={{ mb: 3 }}>
        <IconButton
          component="a"
          href="https://github.com/DoctorImagenius/"
          target="_blank"
          sx={{
            color: "#00e5ff",
            mx: 1,
            "&:hover": { transform: "scale(1.2)", transition: "all 0.3s ease" },
          }}
        >
          <GitHub fontSize="large" />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.facebook.com/profile.php?id=100082678262037"
          target="_blank"
          sx={{
            color: "#00e5ff",
            mx: 1,
            "&:hover": { transform: "scale(1.2)", transition: "all 0.3s ease" },
          }}
        >
          <Facebook fontSize="large" />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.linkedin.com/in/haroon-babar-imagenius1001/"
          target="_blank"
          sx={{
            color: "#00e5ff",
            mx: 1,
            "&:hover": { transform: "scale(1.2)", transition: "all 0.3s ease" },
          }}
        >
          <LinkedIn fontSize="large" />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.instagram.com/imagenius1001"
          target="_blank"
          sx={{
            color: "#00e5ff",
            mx: 1,
            "&:hover": { transform: "scale(1.2)", transition: "all 0.3s ease" },
          }}
        >
          <Instagram fontSize="large" />
        </IconButton>
      </Box>

      {/* 📧 Contact Info */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        mb={2}
      >
        <Link
          href="mailto:imagenius1001@gmail.com"
          sx={{
            color: "#00e5ff",
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            "&:hover": { color: "#00ff99", textDecoration: "underline" },
          }}
        >
          <Email sx={{ mr: 1 }} /> imagenius1001@gmail.com
        </Link>
        <Link
          href="tel:03096995350"
          sx={{
            color: "#00e5ff",
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            "&:hover": { color: "#00ff99", textDecoration: "underline" },
          }}
        >
          <Phone sx={{ mr: 1 }} /> 03096995350
        </Link>
      </Stack>

      {/* © Text */}
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.7)",
          fontWeight: 500,
        }}
      >
        © {new Date().getFullYear()} Football Hub | Built by Haroon with ❤️
      </Typography>
    </Box>
  );
};

export default Footer;
