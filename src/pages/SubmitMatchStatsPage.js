import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Rating,
    Divider,
    Avatar,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useFootball } from "../FootballContext";

export default function SubmitMatchStatsPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { setCurrentPlayer } = useFootball();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { match, myTeam, opponentTeam, myPlayers, notifId, playerEmail } =
        state || {};

    const [teamRate, setTeamRate] = useState(0);
    const [loading, setLoading] = useState(false);

    const [playerStats, setPlayerStats] = useState(
        myPlayers?.map((p) => ({
            playerId: p.email,
            goals: 0,
            assists: 0,
            yellowCards: false,
            redCards: false,
        })) || []
    );

    if (!state)
        return (
            <Typography sx={{ color: "#fff", textAlign: "center", mt: 5 }}>
                Invalid access.
            </Typography>
        );

    const handleChange = (index, field, value) => {
        const updated = [...playerStats];
        updated[index][field] = Math.max(0, Number(value));
        setPlayerStats(updated);
    };

    const handleCheckbox = (index, field) => {
        const updated = [...playerStats];
        updated[index][field] = !updated[index][field];
        setPlayerStats(updated);
    };

    const handleSubmit = async () => {
        setConfirmOpen(false);
        try {
            setLoading(true);

            const res = await axios.post(
                `https://footballhub.azurewebsites.net/matches/${match.id}/finalize`,
                { teamStats: playerStats, teamRate },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Match stats submitted successfully");
                await axios.post(
                    `https://footballhub.azurewebsites.net/players/${playerEmail}/notifications/${notifId}`,
                    { withCredentials: true }
                );
                setCurrentPlayer((prev) => ({
                    ...prev,
                    notifications: prev.notifications.filter((n) => n.id !== notifId),
                }));
                navigate("/notification");
            } else {
                toast.error("Something went wrong, Please try again later!");

            }
        } catch (err) {
            toast.error("Something went wrong, Please try again later!");

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3 },
                color: "#fff",
                minHeight: "100vh",
                //background: "linear-gradient(180deg, #0a0f1a 0%, #111927 100%)",
            }}
        >
            {/* 🏆 Header with both teams */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: { xs: 2, sm: 4 },
                    flexWrap: "wrap",
                    mb: 4,
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    <Avatar
                        src={myTeam.logoUrl}
                        alt={myTeam.name}
                        sx={{ width: 70, height: 70, mx: "auto", mb: 1, borderRadius: 2 }}
                    />
                    <Typography variant="h6">{myTeam.name}</Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: { xs: "1.8rem", sm: "2.5rem" },
                        fontWeight: 700,
                        color: "#00eaff",
                    }}
                >
                    VS
                </Typography>

                <Box sx={{ textAlign: "center" }}>
                    <Avatar
                        src={opponentTeam.logoUrl}
                        alt={opponentTeam.name}
                        sx={{ width: 70, height: 70, mx: "auto", mb: 1, borderRadius: 2 }}
                    />
                    <Typography variant="h6">{opponentTeam.name}</Typography>
                </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.3)" }} />

            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    color: "#00eaff",
                    textAlign: "center",
                    fontWeight: 600,
                }}
            >
                Match Stats for {myTeam.name}
            </Typography>

            {/* 👥 Player Stats */}
            <Box sx={{ display: "grid", gap: 2 }}>
                {playerStats.map((stat, i) => (
                    <Box
                        key={stat.playerId}
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 3,
                            p: 2,
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                src={myPlayers[i]?.imageUrl}
                                alt={myPlayers[i]?.name}
                                sx={{ width: 56, height: 56 }}
                            />
                            <Typography sx={{ fontWeight: 600 }}>
                                {myPlayers[i]?.name || stat.playerId}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                mt: { xs: 2, sm: 0 },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography
                                    sx={{
                                        color: "#00eaff",
                                    }}
                                >
                                    Goals
                                </Typography>
                                <TextField
                                    type="number"
                                    value={stat.goals}
                                    onChange={(e) => handleChange(i, "goals", e.target.value)}
                                    size="small"
                                    inputProps={{ min: 0 }}
                                    sx={{
                                        width: 70,
                                        input: { color: "#fff", textAlign: "center" },
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography
                                    sx={{
                                        color: "#00eaff",
                                    }}
                                >
                                    Assists
                                </Typography>
                                <TextField
                                    type="number"
                                    value={stat.assists}
                                    onChange={(e) => handleChange(i, "assists", e.target.value)}
                                    size="small"
                                    inputProps={{ min: 0 }}
                                    sx={{
                                        width: 70,
                                        input: { color: "#fff", textAlign: "center" },
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Checkbox
                                    checked={stat.yellowCards}
                                    onChange={() => handleCheckbox(i, "yellowCards")}
                                    sx={{ color: "#ffeb3b" }}
                                />
                                <Checkbox
                                    checked={stat.redCards}
                                    onChange={() => handleCheckbox(i, "redCards")}
                                    sx={{ color: "#ff1744" }}
                                />
                            </Box>

                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ⭐ Opponent Team Rating */}

            <Box
                sx={{
                    textAlign: "center",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 3,
                    p: 2,
                    border: "1px solid rgba(255,255,255,0.1)",
                    mt: 2,
                    mb: 5,
                }
                }
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#ffd700",
                    }}
                >
                    ⭐ Rate Opponent Team Performance
                </Typography>
                <Typography
                    sx={{
                        color: "rgba(255,255,255,0.75)",
                        mb: 2,
                        fontSize: "0.95rem",
                    }}
                >
                    {opponentTeam.name}
                </Typography>

                <Rating
                    value={teamRate}
                    onChange={(e, val) => setTeamRate(val)}
                    precision={0.5}
                    icon={
                        <span
                            style={{
                                color: "#ffd700",
                                textShadow: "0 0 6px rgba(255,215,0,0.5)",
                                fontSize: "2rem",
                            }}
                        >
                            ★
                        </span>
                    }
                    emptyIcon={
                        <span
                            style={{
                                color: "rgba(255,255,255,0.2)",
                                fontSize: "2rem",
                            }}
                        >
                            ☆
                        </span>
                    }
                />
            </Box>


            {/* ✅ Submit Button */}
            <Box sx={{ textAlign: "center" }}>
                <Button
                    variant="contained"
                    color="info"
                    onClick={() => setConfirmOpen(true)}
                    disabled={loading}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 3,
                        fontSize: "1rem",
                        textTransform: "none",
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                        "Submit Stats"
                    )}
                </Button>
            </Box>
            <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,0.15)" }} />


            {/* 💬 Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        background: "rgba(20,25,35,0.9)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0,200,255,0.15)",
                        borderRadius: 4,
                        textAlign: "center",
                        p: 2,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        color: "#00d8ff",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        textAlign: "center",
                        pb: 0,
                    }}
                >
                    Confirm Submission
                </DialogTitle>

                <DialogContent>
                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.8)",
                            mt: 1,
                            fontSize: "0.95rem",
                            textAlign: "center",
                        }}
                    >
                        Are you sure you want to submit these match stats? <br />
                        <span style={{ color: "#ff6b6b" }}>
                            Once submitted, you can’t edit them later.
                        </span>
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            mt: 3,
                            mb: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => setConfirmOpen(false)}
                            sx={{
                                borderColor: "rgba(255,255,255,0.2)",
                                color: "rgba(255,255,255,0.8)",
                                borderRadius: 3,
                                px: 3,
                                "&:hover": {
                                    borderColor: "#00d8ff",
                                    color: "#00d8ff",
                                    background: "rgba(0,216,255,0.08)",
                                },
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            disabled={loading}
                            onClick={handleSubmit}
                            sx={{
                                background: "linear-gradient(135deg, #00d8ff, #0066ff)",
                                borderRadius: 3,
                                fontWeight: 600,
                                px: 3,
                                "&:hover": {
                                    background: "linear-gradient(135deg, #0066ff, #00d8ff)",
                                    boxShadow: "0 0 12px rgba(0,216,255,0.4)",
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={20} sx={{ color: "white" }} />
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
