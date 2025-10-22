import React, { useState, useEffect, useRef, useCallback } from "react";
import PlayerCard from "../comp/PlayerCard";
import { Grid, Typography, Box, CircularProgress, TextField, Button, Divider } from "@mui/material";
import { toast } from "react-toastify";

const MemoPlayerCard = React.memo(PlayerCard);

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const LIMIT = 10;
  const observer = useRef();

  const fetchPlayers = async (append = false) => {
    try {
      if (append) {
        setMoreLoading(true);
      } else {
        setLoading(true);
        setPage(0);
      }

      const currentPage = append ? page : 0;

      const res = await fetch(
        `https://footballhub.azurewebsites.net/players?offset=${currentPage * LIMIT}&limit=${LIMIT}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Something went wrong");

      const fetchedPlayers = data.data.players;

      if (append) {
        setPlayers((prev) => {
          const merged = [...prev, ...fetchedPlayers];
          const unique = Array.from(new Map(merged.map((p) => [p.email, p])).values());
          return unique;
        });
        setPage((prev) => prev + 1);
      } else {
        setPlayers(fetchedPlayers);
        setPage(1);
      }

      setHasMore(fetchedPlayers.length === LIMIT);
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  // 👇 Search API call
  const searchPlayers = async () => {
    if (!searchQuery.trim()) {
      toast.info("Please enter a search query!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`https://footballhub.azurewebsites.net/players/search?q=${searchQuery}`);
      const data = await res.json();
      setPlayers(data.data); // update grid with search results
      setHasMore(false); // disable infinite scroll for search results
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

      setPlayers([]);
    } finally {
      setLoading(false);
      setSearchQuery("")
    }
  };

  useEffect(() => {
    fetchPlayers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 👇 observer callback for infinite scroll
  const lastPlayerRef = useCallback(
    (node) => {
      if (moreLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPlayers(true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [moreLoading, hasMore, page]
  );

  return (
    <Box p={3}>
      {/* 🔼 Page Header */}
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, md: 4 },
          mb: 4,
          color: "white",
          textAlign: "center",
          mt: 5

        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
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
            Player
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
            onClick={() => {
              setSearchQuery("");
              fetchPlayers(false);
              setHasMore(true);
            }}
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
            placeholder="🔍 Search players..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") searchPlayers(); }}
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
            color="primary"
            onClick={searchPlayers}
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
      </Box>

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
            Loading Players...
          </Typography>
        </Box>
      ) : (
        players.length > 0 ?
          <>
            <Grid container spacing={3} justifyContent="center">
              {players.map((player, index) => {
                if (players.length === index + 1) {
                  return (
                    <Grid
                      item
                      ref={lastPlayerRef}
                      key={player.email}
                      xs={12}
                      sm={6}
                      md={3}
                      lg={2.4}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <MemoPlayerCard player={player} />
                    </Grid>
                  );
                } else {
                  return (
                    <Grid
                      item
                      key={player.email}
                      xs={12}
                      sm={6}
                      md={3}
                      lg={2.4}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <MemoPlayerCard player={player} />
                    </Grid>
                  );
                }
              })
              }
            </Grid>

            {moreLoading && (
              <Box textAlign="center" mt={3}>
                <CircularProgress sx={{ color: "#00e5ff" }} />
              </Box>
            )}
          </>
          : <Typography sx={{ textAlign: "center", mt: 5, color: "#888" }}>
            No Players found.
          </Typography>

      )}
      <Divider sx={{ my: 8, mb: 10, borderColor: "#003950ff" }} />

    </Box>
  );
}
