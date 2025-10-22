import * as React from "react";
import Box from "@mui/material/Box";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link } from "react-router-dom";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import Groups from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import Leaderboard from "@mui/icons-material/Leaderboard";
import EventIcon from "@mui/icons-material/Event";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

export default function FloatingRGBExpandableTabsResponsive() {
  const [hover, setHover] = React.useState(false);
  const [value, setValue] = React.useState(0); // <-- selected tab index
  const isMobile = useMediaQuery("(max-width:768px)");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box
      position="fixed"
      sx={{
        bottom: 20,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "95%",
          display: "flex",
          justifyContent: "center",
          cursor: isMobile ? "default" : "pointer",
        }}
        onMouseEnter={() => !isMobile && setHover(true)}
        onMouseLeave={() => !isMobile && setHover(false)}
      >
        {/* RGB animated reference line - only desktop & hidden when Tabs open */}
        {!isMobile && !hover && (
          <Box
            sx={{
              height: "10px",
              width: "50%",
              borderRadius: "10px",
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              background:
                "linear-gradient(90deg, #0073E6, #ffffffff, #0055FF, #00E6E6, #0099FF, #33FFFF, #1A75FF)",
              backgroundSize: "300% 100%",
              animation: "lineAnimation 10s linear infinite alternate",
            }}
          />
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: isMobile || hover ? "80px" : "0px",
            opacity: isMobile || hover ? 1 : 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "max-height 0.4s ease, opacity 0.4s ease",
            zIndex: 1,
          }}
        >
          <Tabs
            value={value}                 // ✅ tell Tabs which is active
            onChange={handleChange}       // ✅ update when user clicks
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            indicatorColor="none"
            sx={{
              display: "inline-flex", // ✅ auto shrink/grow with content
              maxWidth: "95%", // ✅ max limit
              margin: "0 auto", // ✅ center
              px: 2,
              background: "#101215",
              borderRadius: "999px",
              boxShadow: "0 5px 30px #101215",
              position: "relative",

              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "999px",
                padding: "2px",
                background:
                  "linear-gradient(90deg, #0073E6, #ffffffff, #0055FF, #00E6E6, #0099FF, #33FFFF, #1A75FF)",
                backgroundSize: "300% 100%",
                animation: "borderAnimation 20s linear infinite",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                pointerEvents: "none",
              },

              [`& .${tabsClasses.scrollButtons}`]: {
                color: "#fff",
                "&.Mui-disabled": { opacity: 0.3 },
              },
              "& .MuiTab-root": {
                minHeight: 70,
                color: "#00aeff",
                textTransform: "none",
                fontWeight: 500,
                transition: "color 0.2s ease",
                position: "relative",
                zIndex: 1,
                ":hover": {
                  color: "#ffffff",
                },
              },
              "& .Mui-selected": {
                color: "#ffffff !important",
                "& .MuiTab-iconWrapper": {
                  color: "#ffffff !important",
                },
              },
              "@keyframes borderAnimation": {
                "0%": { backgroundPosition: "0% 0%" },
                "100%": { backgroundPosition: "300% 0%" },
              },
              "@keyframes lineAnimation": {
                "0%": { backgroundPosition: "0% 0%" },
                "100%": { backgroundPosition: "300% 0%" },
              },
            }}
          >
            <Tab icon={<HomeIcon />} label="Home" component={Link} to="/" />
            <Tab icon={<Groups />} label="Players" component={Link} to="/players" />
            <Tab icon={<SportsSoccerIcon />} label="Teams" component={Link} to="/teams" />
            <Tab icon={<EventIcon />} label="Matches" component={Link} to="/matches" />
            <Tab icon={<SchoolIcon />} label="Trainers" component={Link} to="/Trainers" />
            <Tab icon={<Leaderboard />} label="Leaderboard" component={Link} to="/leaderboard" />
            <Tab icon={<AddShoppingCartIcon />} label="Store" component={Link} to="/store" />
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
