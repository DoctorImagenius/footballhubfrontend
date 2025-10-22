import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFootball } from "../FootballContext";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Divider,
  Modal
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";

export default function NotificationPage() {
  const { isLogin, currentPlayer, setCurrentPlayer } = useFootball();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [processing, setProcessing] = useState({}); // 🔹 For Accept/Reject loading
  const [processingMatch, setProcessingMatch] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);


  // 🔹 Handle New Order Request (Accept / Reject)
  const handleOrderRequest = async (notif, action) => {
    const key = `${notif.id}-order-${action}`;
    try {
      setProcessing((prev) => ({ ...prev, [key]: true }));
      if (action === "accept") {
        let res = await axios.post(
          "https://footballhub.azurewebsites.net/item-sold",
          {
            playerEmail: notif.playerId, // must exist
            points: notif.points,           // must exist
            itemName: notif.itemName,
            itemId: notif.itemId
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          toast.success("Item sold successfully!");
        } else {
          toast.error("Something went wrong, Please try again later!");

        }
      } else if (action === "reject") {
        // Optional: notify player that seller rejected
        await axios.post(
          `https://footballhub.azurewebsites.net/notify/${notif.playerId}`,
          {
            title: "Order Rejected",
            message: `Your Order ${notif.itemName} has been rejected by ${currentPlayer.email}.`,
          },
          { withCredentials: true }
        );
        toast.info("Order request rejected.");
      }

      // Remove notification from frontend state
      setCurrentPlayer((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== notif.id),
      }));

      // Delete notification from backend
      await handleDelete(notif.id);

    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessing((prev) => ({ ...prev, [key]: false }));
    }
  };

  // 🔹 Handle New Training Request (Accept / Reject)
  const handleTrainingRequest = async (notif, action) => {
    const key = `${notif.id}-training-${action}`;
    try {
      setProcessing((prev) => ({ ...prev, [key]: true }));
      if (action === "accept") {
        let res = await axios.post(
          "https://footballhub.azurewebsites.net/trainer-booked",
          {
            playerEmail: notif.playerId, // must exist
            points: notif.points,           // must exist
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          toast.success("Training approved successfully!");
        } else {
          toast.error("Something went wrong, Please try again later!");

        }
      } else if (action === "reject") {
        // Optional: notify player that trainer rejected
        await axios.post(
          `https://footballhub.azurewebsites.net/notify/${notif.playerId}`,
          {
            title: "Training Rejected",
            message: `Your training request has been rejected by ${currentPlayer.email}.`,
          },
          { withCredentials: true }
        );
        toast.info("Training request rejected.");
      }

      // Remove notification from frontend state
      setCurrentPlayer((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== notif.id),
      }));

      // Delete notification from backend
      await handleDelete(notif.id);

    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessing((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleClearAll = async () => {
    if (!currentPlayer?.notifications?.length) return toast.info("No notifications to clear.");

    setOpenConfirm(true); // 🔥 open modal instead of confirm()
  };

  const confirmClearAll = async () => {
    try {
      setIsClearing(true);

      const res = await axios.delete(
        `https://footballhub.azurewebsites.net/players/${currentPlayer.email}/notifications`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("All notifications cleared successfully!");
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: [],
        }));
        setOpenConfirm(false);
      } else {
        toast.error("Failed to clear notifications.");
      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setIsClearing(false);
    }
  };

  // 🔹 Inside NotificationPage component
  const handleSubmitMatchStats = async (notif) => {
    const key = `${notif.id}-submit`;
    try {
      setProcessingMatch((p) => ({ ...p, [key]: true }));

      // 1️⃣ Fetch Match details
      const { data: matchRes } = await axios.get(
        `https://footballhub.azurewebsites.net/matches/${notif.matchId}`
      );
      if (!matchRes.success) throw new Error("Failed to fetch match");
      const match = matchRes.match;

      // 2️⃣ Fetch related data (teams + trophy)
      const [myTeamRes, oppTeamRes, trophyRes] = await Promise.all([
        axios.get(`https://footballhub.azurewebsites.net/teams/${match.myTeamId}`),
        axios.get(`https://footballhub.azurewebsites.net/teams/${match.opponentTeamId}`),
        match.trophyId
          ? axios.get(`https://footballhub.azurewebsites.net/trophies/${match.trophyId}`)
          : Promise.resolve({ data: { data: null } }),
      ]);

      const myTeam = myTeamRes.data.data;
      const opponentTeam = oppTeamRes.data.data;
      const trophy = trophyRes.data.data;


      let teamType = null;
      if (currentPlayer.email === myTeam.captain) {
        teamType = "myTeam";
      } else if (currentPlayer.email === opponentTeam.captain) {
        teamType = "opponentTeam";
      } else {
        toast.error("You are not a captain of this match.");
        return;
      }

      // 3️⃣ Fetch players for both teams
      const fetchPlayers = async (emails = []) =>
        Promise.allSettled(
          emails.map((email) =>
            axios.get(`https://footballhub.azurewebsites.net/players/${email}`)
          )
        ).then((results) =>
          results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value.data.data)
        );

      const [myPlayers, oppPlayers] = await Promise.all([
        fetchPlayers(match.myPlayers),
        fetchPlayers(match.opponentPlayers),
      ]);

      // 4️⃣ Select correct team info based on who’s captain
      const selectedTeam =
        teamType === "myTeam" ? myTeam : opponentTeam;
      const selectedPlayers =
        teamType === "myTeam" ? myPlayers : oppPlayers;

      // 5️⃣ Prepare data for SubmitMatchStatsPage
      const pageData = {
        match,
        myTeam: selectedTeam,
        opponentTeam:
          teamType === "myTeam" ? opponentTeam : myTeam,
        trophy,
        myPlayers: selectedPlayers,
        oppPlayers:
          teamType === "myTeam" ? oppPlayers : myPlayers,
        playerEmail: currentPlayer.email,
        notifId: notif.id,
      };

      // 6️⃣ Navigate to page
      navigate("/submit-stats", { state: pageData });
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessingMatch((p) => ({ ...p, [key]: false }));
    }
  };

  // ❌ Handle Match Invitation Reject
  const handleMatchInviteReject = async (notif) => {
    const key = `${notif.id}-match-reject`;
    try {
      setProcessingMatch((prev) => ({ ...prev, [key]: true }));

      const res = await axios.put(
        `https://footballhub.azurewebsites.net/matches/${notif.matchId}/response`,
        { action: "reject" },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Match invitation rejected successfully");
        // 🧹 Delete from backend and frontend
        await handleDelete(notif.id);
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notif.id),
        }));
      } else {
        toast.error("Something went wrong, Please try again later!");

      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessingMatch((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleMatchInviteAccept = async (notif) => {
    try {
      // Step 1: Fetch match
      const { data: matchRes } = await axios.get(`https://footballhub.azurewebsites.net/matches/${notif.matchId}`);
      if (!matchRes.success) throw new Error("Failed to fetch match");
      const match = matchRes.match;

      // Step 2: Parallel fetch trophy + teams
      const [trophyRes, myTeamRes, opponentTeamRes] = await Promise.all([
        match.trophyId
          ? axios.get(`https://footballhub.azurewebsites.net/trophies/${match.trophyId}`)
          : Promise.resolve({ data: { data: null } }),
        axios.get(`https://footballhub.azurewebsites.net/teams/${match.myTeamId}`),
        axios.get(`https://footballhub.azurewebsites.net/teams/${match.opponentTeamId}`),
      ]);

      const trophy = trophyRes.data.data;
      const myTeam = myTeamRes.data.data;
      const opponentTeam = opponentTeamRes.data.data;

      // Step 3: Fetch both teams' players
      const fetchPlayers = async (ids = []) =>
        Promise.allSettled(ids.map((id) => axios.get(`https://footballhub.azurewebsites.net/players/${id}`)))
          .then((results) =>
            results
              .filter((r) => r.status === "fulfilled")
              .map((r) => r.value.data.data)
          );

      const [myPlayers, oppPlayers] = await Promise.all([
        fetchPlayers(match.myPlayers),
        fetchPlayers(opponentTeam.teamPlayers),
      ]);

      // Step 4: Prepare swapped data
      const swappedData = {
        match,
        trophy,
        opponentTeam: myTeam,
        myTeam: opponentTeam,
        myPlayers: oppPlayers,
        oppTeamPlayers: myPlayers,
        playerEmail: currentPlayer.email,
        notifId: notif.id
      };

      // Step 5: Navigate to MatchDetail page with data
      navigate("/match-response", { state: swappedData });
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    }
  };

  // ⭐ Handle "Rate Opponent Team Players"
  const handleRateOpponents = async (notif) => {
    const key = `${notif.id}-rate`;
    try {
      setProcessingMatch((p) => ({ ...p, [key]: true }));

      // 1️⃣ Fetch Match
      const { data: matchRes } = await axios.get(
        `https://footballhub.azurewebsites.net/matches/${notif.matchId}`
      );
      if (!matchRes.success) throw new Error("Failed to fetch match");
      const match = matchRes.match;

      // 2️⃣ Determine which team’s players are opponents
      const isOpponentMySide = notif.opponentTeamId === match.myTeamId;
      const opponentPlayerEmails = isOpponentMySide
        ? match.myPlayers
        : match.opponentPlayers;

      // 3️⃣ Fetch Opponent Team details
      const { data: teamRes } = await axios.get(
        `https://footballhub.azurewebsites.net/teams/${notif.opponentTeamId}`
      );
      const opponentTeam = teamRes.data;

      // 4️⃣ Fetch opponent players’ details
      const results = await Promise.allSettled(
        opponentPlayerEmails.map((email) =>
          axios.get(`https://footballhub.azurewebsites.net/players/${email}`)
        )
      );

      const opponentPlayers = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value.data.data)
        .filter(Boolean);

      if (!opponentPlayers.length)
        throw new Error("No opponent players found to rate.");

      // 5️⃣ Navigate to RatePlayers page
      navigate("/rate-players", {
        state: {
          opponentPlayers,
          opponentTeam,
          matchId: notif.matchId,
          opponentTeamId: notif.opponentTeamId,
          playerEmail: currentPlayer.email,
          notifId: notif.id,
        },
      });
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessingMatch((p) => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => {
    if (!isLogin) navigate("/login");
  }, [isLogin, navigate]);

  useEffect(() => {
    if (currentPlayer) {
      setLoading(false);
    }
  }, [currentPlayer]);

  // 🧹 Delete notification
  const handleDelete = async (notifId) => {
    try {
      setDeleting((prev) => ({ ...prev, [notifId]: true }));
      await axios.delete(
        `https://footballhub.azurewebsites.net/players/${currentPlayer.email}/notifications/${notifId}`,
        { withCredentials: true }
      );

      // ✅ Update currentPlayer state (remove from notifications)
      setCurrentPlayer((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== notifId),
      }));
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setDeleting((prev) => ({ ...prev, [notifId]: false }));
    }
  };

  // 🏆 Handle Approve / Reject Team Join Request
  const handleTeamJoinAction = async (notif, action) => {
    const { teamId, requester, id: notifId } = notif;
    const key = `${notifId}-${action}`;
    try {
      setProcessing((prev) => ({ ...prev, [key]: true }));

      const res = await axios.put(
        `https://footballhub.azurewebsites.net/teams/${teamId}/requests/${requester}`,
        { action },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notifId),
        }));
        handleDelete(notifId);
      } else {
        toast.error("Something went wrong, Please try again later!");

      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessing((prev) => ({ ...prev, [key]: false }));
    }
  };

  // 💌 Handle Team Invitation (Accept / Reject)
  const handleTeamInviteAction = async (notif, action) => {
    const { teamId, id: notifId } = notif;
    const key = `${notifId}-invite-${action}`;
    try {
      setProcessing((prev) => ({ ...prev, [key]: true }));

      const res = await axios.put(
        `https://footballhub.azurewebsites.net/profile/requests/${teamId}`,
        { action },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCurrentPlayer((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notifId),
        }));
        handleDelete(notifId);
      } else {
        toast.error("Something went wrong, Please try again later!");

      }
    } catch (err) {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setProcessing((prev) => ({ ...prev, [key]: false }));
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return `🕒 ${date.toLocaleString("en-US", options)}`;
  };

  if (!isLogin)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "#fff" }}>
        Redirecting...
      </p>
    );
  if (!currentPlayer)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "#fff" }}>
        Loading player...
      </p>
    );

  const notifications = currentPlayer.notifications || [];

  return (
    <Box sx={{ padding: "20px", color: "#fff", minHeight: "100vh" }}>
      {/* 🔼 Page Header */}
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, md: 4 },
          mb: 4,
          textAlign: "center",
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
              background:
                "linear-gradient(270deg, #FFFFFF, #68b0ddff, #FFFFFF)",
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
            Notifications
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
      </Box>
      {/* 🧹 Clear All Button */}
      {!loading && notifications.length > 0 && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAll}
            disabled={loading}
            sx={{
              borderRadius: "30px",
              px: 5,
              py: 1.2,
              fontWeight: "bold",
              borderColor: "rgba(255,255,255,0.2)",
              color: "#ff5252",

              gap: 1,
              "&:hover": { borderColor: "#ff5252", background: "rgba(255,0,0,0.1)" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Clear Notifications"
            )}
          </Button>
        </Box>
      )}

      {/* 🚦 Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress style={{ color: "#00eaff" }} />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 5, color: "#aaa" }}>
          No notifications found.
        </Typography>
      ) : (
        notifications.map((notif) => (
          <Box
            alignContent={"center"}
            key={notif.id}
            sx={{
              position: "relative",
              mb: 2,
              p: 2,
              background: "#111",
              border: "1px solid #333",
              borderRadius: "12px",
              alignSelf: "center",
              borderLeft: "10px solid #0097a5ff",
              "&:hover": {
                background: "linear-gradient(145deg, #111)",
                transition: "0.2s",
              },
            }}
          >
            {/* ❌ Delete Button */}
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
                color: "#ff4d4d",
                "&:hover": { color: "#ff1a1a", transform: "scale(1.2)" },
              }}
              onClick={() => handleDelete(notif.id)}
              disabled={deleting[notif.id]}
            >
              {deleting[notif.id] ? (
                <CircularProgress size={18} sx={{ color: "#ff1a1a" }} />
              ) : (
                <CloseIcon />
              )}
            </IconButton>

            {/* Notification content */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", color: "#00eaff" }}
            >
              {notif.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#ccc" }}>
              {notif.message}
            </Typography>
            <Typography
              variant="caption"
              sx={{ mt: 1, display: "block", color: "#999" }}
            >
              {formatDateTime(notif.date || notif.createdAt)}
            </Typography>

            {/* Team Join Request */}
            {notif.title === "Team Join Request" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={() => handleTeamJoinAction(notif, "approve")}
                  disabled={processing[`${notif.id}-approve`]}
                >
                  {processing[`${notif.id}-approve`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleTeamJoinAction(notif, "reject")}
                  disabled={processing[`${notif.id}-reject`]}
                >
                  {processing[`${notif.id}-reject`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </Box>
            )}

            {/* Team Invitation */}
            {notif.title === "Team Invitation" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={() => handleTeamInviteAction(notif, "approve")}
                  disabled={processing[`${notif.id}-invite-approve`]}
                >
                  {processing[`${notif.id}-invite-approve`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleTeamInviteAction(notif, "reject")}
                  disabled={processing[`${notif.id}-invite-reject`]}
                >
                  {processing[`${notif.id}-invite-reject`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </Box>
            )}

            {/* Match Invitation */}
            {notif.title === "Match Invitation" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  disabled={processingMatch[`${notif.id}-accept`]}
                  onClick={async () => {
                    setProcessingMatch((p) => ({ ...p, [`${notif.id}-accept`]: true }));
                    await handleMatchInviteAccept(notif);
                    setProcessingMatch((p) => ({ ...p, [`${notif.id}-accept`]: false }));
                  }}
                >
                  {processingMatch[`${notif.id}-accept`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Accept"
                  )}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleMatchInviteReject(notif)}
                  disabled={processingMatch[`${notif.id}-match-reject`]}
                >
                  {processingMatch[`${notif.id}-match-reject`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </Box>
            )}

            {/* ⭐ Rate Opponent Team Players */}
            {notif.title === "Rate Opponent Team Players" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  sx={{
                    mr: 1,
                    border: "1px solid #00eaffff",
                    color: "#00eaffff",
                    "&:hover": { background: "#00eaff0e" },
                  }}
                  disabled={processingMatch[`${notif.id}-rate`]}
                  onClick={() => handleRateOpponents(notif)}
                >
                  {processingMatch[`${notif.id}-rate`] ? (
                    <CircularProgress size={20} sx={{ color: "#00eaffff" }} />
                  ) : (
                    "Rate Players"
                  )}
                </Button>
              </Box>
            )}

            {/* Match Completed */}
            {notif.title === "Match Completed" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="info"
                  sx={{ mr: 1 }}
                  onClick={() => handleSubmitMatchStats(notif)}
                  disabled={processingMatch[`${notif.id}-submit`]}
                >
                  {processingMatch[`${notif.id}-submit`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Submit Match Stats"
                  )}
                </Button>
              </Box>
            )}

            {/*New Training Request */}
            {notif.title === "New Training Request" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={() => handleTrainingRequest(notif, "accept")}
                  disabled={processing[`${notif.id}-training-accept`]}
                >
                  {processing[`${notif.id}-training-accept`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleTrainingRequest(notif, "reject")}
                  disabled={processing[`${notif.id}-training-reject`]}
                >
                  {processing[`${notif.id}-training-reject`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </Box>
            )}

            {/*New Order Request*/}
            {notif.title === "New Order Request" && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={() => handleOrderRequest(notif, "accept")}
                  disabled={processing[`${notif.id}-order-accept`]}
                >
                  {processing[`${notif.id}-order-accept`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Accept Order"
                  )}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleOrderRequest(notif, "reject")}
                  disabled={processing[`${notif.id}-order-reject`]}
                >
                  {processing[`${notif.id}-order-reject`] ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Reject Order"
                  )}
                </Button>
              </Box>
            )}








          </Box>
        ))
      )}

      <Divider
        sx={{
          my: 5,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />
      {/* ⚠️ Confirm Clear Modal */}
      <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 400,
            bgcolor: "#0a1929",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#00eaff",
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Clear All Notifications?
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
            This action will permanently remove all your notifications.
            Are you sure you want to continue?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenConfirm(false)}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#ccc",
                px: 3,
                "&:hover": { borderColor: "#fff", color: "#fff" },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={isClearing}
              onClick={confirmClearAll}
              sx={{
                background: "linear-gradient(135deg, #ff3b3b, #d10000)",
                color: "#fff",
                px: 3,
                "&:hover": { background: "linear-gradient(135deg, #ff5c5c, #ff0000)" },
              }}
            >
              {isClearing ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Confirm"}
            </Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
}
