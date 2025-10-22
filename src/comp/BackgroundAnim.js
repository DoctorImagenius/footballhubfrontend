import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { Box } from "@mui/material";

export default function BackgroundAnim() {
  const particleCount = 50;

  return (
    <Box
      sx={{
        position: "fixed",   // ✅ fixed so it stays while scrolling
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,          // ✅ behind everything
        pointerEvents: "none", // ✅ not clickable
        overflow: "hidden",
      }}
    >
      {[...Array(particleCount)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            fontSize: `${Math.random() * 19 + 10}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `particleMove${i} ${Math.random() * 20 + 10}s linear infinite`,
          }}
        >
          <SportsSoccerIcon
            sx={{
              fontSize: "inherit",
              color: "#0073E620", // transparent white-blue look
            }}
          />
        </Box>
      ))}

      {/* Keyframe animations for each particle */}
      <style>
        {`
            ${[...Array(particleCount)]
            .map((_, i) => {
              const xMove = Math.random() * 100 - 50;
              const yMove = Math.random() * 40 - 20;
              return `
                  @keyframes particleMove${i} {
                    0% { transform: translate(0,0) rotate(0deg); }
                    50% { transform: translate(${xMove}px, ${yMove}px) rotate(180deg); }
                    100% { transform: translate(0,0) rotate(360deg); }
                  }
                `;
            })
            .join("\n")}
          `}
      </style>
    </Box>
  )
}
