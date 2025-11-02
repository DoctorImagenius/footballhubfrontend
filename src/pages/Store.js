import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Divider,
  Modal,
  Collapse
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFootball } from "../FootballContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PaidIcon from "@mui/icons-material/Paid"; // Coins / Points icon


export default function StorePage() {
  const { currentPlayer, isLogin } = useFootball();
  const [sellItems, setSellItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [buying, setBuying] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);


  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    points: "",
    file: null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://footballhub.azurewebsites.net/sell-items", {
        withCredentials: true,
      });
      setSellItems(res.data.data.items || []);
    } catch {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search
  const handleSearch = async () => {
    if (!searchText.trim()) return fetchItems();
    try {
      setLoading(true);
      const res = await axios.get(
        `https://footballhub.azurewebsites.net/sell-items/search?q=${encodeURIComponent(
          searchText
        )}`,
        { withCredentials: true }
      );
      setSellItems(res.data.data || []);
    } catch {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setLoading(false);
    }
  };

  // 🧾 My Items
  const fetchMyItems = async () => {
    if (!currentPlayer?.email) return toast.warn("Login required.");
    try {
      setMyLoading(true);
      const res = await axios.get(
        `https://footballhub.azurewebsites.net/sell-items/${currentPlayer.email}`,
        { withCredentials: true }
      );
      setSellItems(res.data.data || []);
      if (!res.data.data?.length)
        toast.info("You haven’t listed any items yet.");
    } catch {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setMyLoading(false);
    }
  };

  // 🗑️ Delete Item (new version with modal)
  const handleDelete = async () => {
    if (!selectedItemId) return;
    try {
      setSaving(true);
      const res = await axios.post(`https://footballhub.azurewebsites.net/sell-items/${selectedItemId}`,{}, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Item deleted!");
        setSellItems((prev) => prev.filter((it) => it.id !== selectedItemId));
      }
    } catch {
      toast.error("Something went wrong, Please try again later!");

    } finally {
      setSaving(false);
      setOpenDeleteConfirm(false);
      setSelectedItemId(null);
    }
  };

  // 📤 Upload New Item
  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (!form.title || !form.description || !form.price || !form.points || !form.file)
        return toast.warning("Please fill all fields and upload an image.");

      setUploading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));

      const res = await axios.post("https://footballhub.azurewebsites.net/sell-item", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Item listed successfully!");
        setForm({ title: "", description: "", price: "", points: "", file: null });
        setShowUploadBox(false);
        fetchItems();
      }
      else{
        toast.error(res.data.message || "Something went wrong, please try again!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong, Please try again later!")

    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, color: "#fff", minHeight: "100vh" }}>
      {/* 🧩 Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mt: 8

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
          Store
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

      {/* 🔍 Search Bar */}

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
          onClick={fetchItems}
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
          placeholder="🔍 Search trainers..."
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
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
          onClick={handleSearch}
          color="primary"
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



      {/* ⚙️ Player Action Buttons */}
      {currentPlayer && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              //background: "rgba(0, 191, 255, 0.1)",
              //border: "1px solid rgba(0, 229, 255, 0.3)",
              borderRadius: "20px",
              overflow: "hidden",
              //boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              //backdropFilter: "blur(6px)",
            }}
          >
            {/* Upload Button */}
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setShowUploadBox((p) => !p)}
              sx={{
                background: "linear-gradient(135deg, #0077ff, #00bfff)",
                borderRadius: 0,
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: 1,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #0066ff, #00aaff)",
                },
              }}
            >
              {showUploadBox ? "Cancel" : "Sell Item"}
            </Button>
            {/* My Items Button */}
            <Button
              variant="contained"
              startIcon={<ListAltIcon />}
              onClick={fetchMyItems}
              disabled={myLoading}
              sx={{
                background: "linear-gradient(135deg, #00bfff, #0077ff)",
                borderRadius: 0,
                fontWeight: "bold",
                px: { xs: 2, sm: 3 },
                py: 1,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #00aaff, #0066ff)",
                },
              }}
            >
              {myLoading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "My Items"
              )}
            </Button>
          </Box>
        </Box>
      )}

      {/* 📦 Upload Box */}
      {showUploadBox && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.05)",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#00e5ff", mb: 2, textAlign: "center" }}
          >
            🛒 Upload New Store Item
          </Typography>

          <Box
            component="form"
            onSubmit={handleUpload}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Title"
              variant="outlined"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={fieldStyle}
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              variant="outlined"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              sx={{
                ...fieldStyle,
                "& .MuiInputBase-input": {
                  color: "#fff", // 🔥 makes text white
                }

              }}
            />
            <TextField
              label="Price (Rs)"
              type="number"
              variant="outlined"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              sx={fieldStyle}
            />
            <TextField
              label="Points"
              type="number"
              variant="outlined"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
              sx={fieldStyle}
            />

            {/* 🖼️ Image Preview (if uploaded) */}
            {form.file && (
              <Box
                sx={{
                  textAlign: "center",
                  mt: 1,
                  mb: -1,
                }}
              >
                <img
                  src={URL.createObjectURL(form.file)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "180px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              </Box>
            )}

            {/* 📁 Upload Button */}
            <Button
              variant="contained"
              component="label"
              sx={{
                background: form.file
                  ? "linear-gradient(135deg, #00c853, #00e676)"
                  : "linear-gradient(135deg, #0077ff, #00bfff)",
                textTransform: "none",
                fontWeight: "bold",
                py: 1.2,
                transition: "0.3s ease",
                "&:hover": {
                  background: form.file
                    ? "linear-gradient(135deg, #00b44b, #00d96e)"
                    : "linear-gradient(135deg, #0066ff, #00aaff)",
                  transform: "scale(1.02)",
                },
              }}
            >
              {form.file ? "✅ Image Selected" : "Upload Image"}
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files[0] || null })
                }
              />
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="outlined"
                disabled={uploading}
                sx={{
                  color: "#00e5ff",
                  borderRadius: "30px",
                  px: 5,
                  py: 1.2,
                  fontWeight: "bold",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                }}
              >
                {uploading ? (
                  <CircularProgress size={22} sx={{ color: "#00e5ff" }} />
                ) : (
                  "Submit Item"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* 🛍️ Store Items */}
      {loading ? (
        <LoadingState />
      ) : sellItems.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
            mt: 5,
          }}
        >
          {sellItems.map((item, i) => (
            <Card
              key={i}
              sx={{
                bgcolor: "rgba(0, 0, 68, 0.3)",
                border: "1px solid rgba(0,229,255,0.15)",
                borderRadius: 3,
                overflow: "hidden",
                transition: "0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  borderColor: "#00e5ff",
                  boxShadow: "0 4px 15px rgba(0,229,255,0.25)",
                },
              }}
            >
              <Avatar
                src={item.imageUrl}
                alt={item.title}
                variant="square"
                sx={{ width: "100%", height: 220, objectFit: "cover" }}
              />

              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#00e5ff", fontWeight: 700, mb: 1 }}
                >
                  {item.title}
                </Typography>

                {/* 💰 Price & ⭐ Points Chips */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      pt: 0.3,
                      borderRadius: "20px",
                      bgcolor: "rgba(255,215,0,0.1)",
                      color: "#FFD700",
                      fontSize: 13,
                      border: "1px solid rgba(255,215,0,0.3)",
                    }}
                  >
                    💰 Rs {item.price}

                  </Box>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      pt: 0.3,
                      borderRadius: "20px",
                      bgcolor: "rgba(255,215,0,0.1)",
                      color: "#FFD700",
                      fontSize: 13,
                      border: "1px solid rgba(255,215,0,0.3)",
                    }}
                  >
                    ⭐ {item.points} pts
                  </Box>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      pt: 0.3,
                      borderRadius: "20px",
                      bgcolor: "rgba(0,229,255,0.1)",
                      color: "#00e5ff",
                      fontSize: 13,
                      border: "1px solid rgba(0,229,255,0.3)",
                    }}
                  >
                    {item.sold} items sold

                  </Box>


                </Box>

                {/* 🎛 Toggle Details Button */}
                <Button
                  fullWidth
                  onClick={() =>
                    setExpandedCard((prev) => (prev === item.id ? null : item.id))
                  }
                  variant="outlined"
                  sx={{
                    color: "#00e5ff",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    mb: 1,
                    "&:hover": {
                      borderColor: "#00e5ff",
                      background: "#00e5ff25",
                    },
                  }}
                >
                  {expandedCard === item.id ? "Hide Details" : "Show Details"}
                </Button>

                {/* 🔽 Expandable Section */}
                <Collapse in={expandedCard === item.id}>
                  <Box
                    sx={{
                      mt: 1,
                      mb: 2,
                      px: 1,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                    }}
                  >
                    <Typography sx={{ color: "#aaa", fontSize: 14, mb: 1, textAlign: "left" }}>
                      {item.description || "No description available"}
                    </Typography>
                    <Typography sx={{ color: "#ccc", fontSize: 13 }}>
                      <strong>Seller:</strong> {item.name}
                    </Typography>
                    <Typography sx={{ color: "#ccc", fontSize: 13 }}>
                      <strong>Email:</strong> {item.playerEmail}
                    </Typography>
                    {item.date && (
                      <Typography sx={{ color: "#888", fontSize: 12, mt: 0.5 }}>
                        📅 {new Date(item.date).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Collapse>

                {/* 🛒 Buy/Delete Button */}
                {currentPlayer?.email === item.playerEmail ? (
                  <Button
                    fullWidth
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setOpenDeleteConfirm(true);
                    }}
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    sx={{
                      color: "#ff5252",
                      borderRadius: 2.5,
                      borderColor: "rgba(255,255,255,0.2)",
                      "&:hover": {
                        borderColor: "#ff5252",
                        background: "#ff525225",
                      },
                    }}
                  >
                    Delete Item
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => {
                      setSelectedItem(item);
                      setOpenBuyModal(true);
                    }}
                    variant="outlined"
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      color: "#00ff7f",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      borderColor: "rgba(255,255,255,0.2)",
                      "&:hover": { borderColor: "#00ff7f", background: "#00ff7f25" },
                    }}
                  >
                    Buy Now
                  </Button>
                )}
              </CardContent>
            </Card>

          ))}
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 5, color: "#888" }}>
          No items found.
        </Typography>
      )}

      <Divider sx={{ my: 8, borderColor: "#003950ff" }} />
      <Modal open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 420,
            bgcolor: "#0a1929",
            borderRadius: 2,
            p: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#00e5ff",
              mb: 1,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            ⚠️ Confirm Deletion
          </Typography>

          <Typography sx={{ color: "#bbb", mb: 3 }}>
            Are you sure you want to delete this item from your store?
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              variant="outlined"
              sx={{
                color: "#00e5ff",
                borderColor: "rgba(255,255,255,0.2)",
                "&:hover": { borderColor: "#00e5ff", background: "#00e5ff25" },
                px: 4,
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              variant="contained"
              sx={{
                background: "#ff5252",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#ff1744" },
                px: 4,
              }}
            >
              {saving ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openBuyModal}
        onClose={() => setOpenBuyModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          zIndex: 1300,
        }}
        BackdropProps={{
          sx: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: 500, md: 600 },
            borderRadius: 5,
            background: "linear-gradient(145deg, rgba(0,0,0,1), rgba(0,0,0,1))",
            border: "1px solid rgba(0,229,255,0.2)",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* ❌ Close Button */}
          <Button
            onClick={() => setOpenBuyModal(false)}
            sx={{
              position: "absolute",
              top: 10,
              left: 15,
              minWidth: "unset",
              color: "#00e5ff",
              "&:hover": { background: "rgba(0,229,255,0.1)" },
            }}
          >
            ✕
          </Button>

          {/* ===== Scrollable Content ===== */}
          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { background: "#00e5ff55", borderRadius: 10 },
            }}
          >
            {/* ===== Item Info Section ===== */}
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                background: "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,229,255,0.05))",
              }}
            >
              <Avatar
                src={selectedItem?.imageUrl}
                alt={selectedItem?.title}
                variant="rounded"
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  mb: 2,
                  border: "2px solid #00e5ff77",
                  borderRadius: 5,
                }}
              />
              <Typography
                variant="h6"
                sx={{ color: "#00e5ff", fontWeight: "bold", mb: 0.5, textAlign: "center" }}
              >
                {selectedItem?.title}
              </Typography>
              <Typography
                sx={{
                  color: "#aaa",
                  fontSize: 14,
                  mb: 1.5,
                  textAlign: "center",
                  px: 1,
                }}
              >
                {selectedItem?.description}
              </Typography>
              <Typography sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                💰 Rs {selectedItem?.price} | ⭐ {selectedItem?.points} pts
              </Typography>

              <Typography sx={{ color: "#ccc", fontSize: 13 }}>
                <strong>Seller:</strong> {selectedItem?.name}
              </Typography>
              <Typography sx={{ color: "#ccc", fontSize: 13 }}>
                <strong>Email:</strong> {selectedItem?.playerEmail}
              </Typography>
            </Box>

            {/* ===== WhatsApp Purchase Section ===== */}
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                background: "linear-gradient(145deg, rgba(0,229,255,0.05), rgba(0,183,255,0.1))",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography sx={{ color: "#00e5ff", fontWeight: "bold", mb: 1 }}>
                Buy via WhatsApp
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                  {selectedItem?.contact || "No number"}
                </Typography>
                {selectedItem?.contact && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: 32,
                      height: 32,
                      p: 0,
                      borderRadius: "50%",
                      borderColor: "#00e5ff55",
                      color: "#00e5ff",
                      "&:hover": {
                        borderColor: "#00e5ff",
                        background: "#00e5ff22",
                      },
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedItem.contact || "");
                      toast.success("Number copied!");
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 18 }} />
                  </Button>
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<WhatsAppIcon />}
                sx={{
                  background: "linear-gradient(90deg, #25D366, #128C7E)",
                  color: "#fff",
                  py: 1.2,
                  borderRadius: 10,
                  fontWeight: "bold",
                  "&:hover": { background: "linear-gradient(90deg, #20c05a, #0f7a6b)" },
                }}
                onClick={() => {
                  if (selectedItem?.contact) {
                    window.open(
                      `https://wa.me/${selectedItem.contact}?text=Hi, I'm interested in buying your item: ${selectedItem.title}.`,
                      "_blank"
                    );
                  } else {
                    toast.error("Seller's number not available");
                  }
                }}
              >
                Message Seller
              </Button>
            </Box>

            {/* ===== Points Purchase Section ===== */}
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                background: "linear-gradient(145deg, rgba(0,229,255,0.05), rgba(0,183,255,0.1))",
              }}
            >
              <Typography sx={{ color: "#ffd700", fontWeight: "bold", mb: 1 }}>
                Buy via Points
              </Typography>

              <Typography
                sx={{
                  color: "#ccc",
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <PaidIcon sx={{ color: "#ffe600ff" }} />
                Requires {selectedItem?.points} Points
              </Typography>

              {/* 🚨 Not Enough Points Warning */}
              {currentPlayer?.points < selectedItem?.points && (
                <Typography sx={{ color: "#ff5252", mb: 2, fontWeight: 500 }}>
                  ❌ Not enough points to buy this item.
                </Typography>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
               {isLogin?
               <> <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    borderRadius: 10,
                    borderColor: "rgba(255,255,255,0.2)",
                    fontWeight: "bold",
                    color: "#00e5ff",
                    "&:hover": {
                      borderColor: "#00e5ff",
                      background: "#005963ff",
                    },
                  }}
                  disabled={buying || currentPlayer?.points < selectedItem?.points}
                  onClick={async () => {
                    try {
                      setBuying(true);

                      const res = await axios.post(
                        "https://footballhub.azurewebsites.net/buy-item",
                        {
                          sellerEmail: selectedItem.playerEmail,
                          playerEmail: currentPlayer.email,
                          points: selectedItem.points,
                          itemName: selectedItem.title,
                          itemId: selectedItem.id,
                        },
                        { withCredentials: true }
                      );

                      if (res.data.success) {
                        toast.success("Item request sent to seller!");
                        setOpenBuyModal(false);
                      } else {
                        toast.error("Something went wrong, Please try again later!");

                      }
                    } catch (err) {
                      toast.error("Something went wrong, Please try again later!");

                    } finally {
                      setBuying(false);
                    }
                  }}
                >
                  {buying ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Buy with Points"
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    color: "#ff5252",
                    borderColor: "rgba(255,255,255,0.2)",
                    fontWeight: "bold",
                    borderRadius: 10,
                    "&:hover": {
                      borderColor: "#ff5252",
                      background: "#ff525225",
                    },
                  }}
                  onClick={() => setOpenBuyModal(false)}
                >
                  Cancel
                </Button></>
               :""}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>




    </Box>

  );
}

/* 🎨 Reusable */
const fieldStyle = {
  input: { color: "#fff" },
  label: { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    background: "rgba(0,0,0,0.25)",
    borderRadius: "10px",
    "& fieldset": { borderColor: "#00eaff55" },
    "&:hover fieldset": { borderColor: "#00eaff" },
    "&.Mui-focused fieldset": { borderColor: "#00eaff" },
  },
};

function LoadingState() {
  return (
    <Box sx={{ height: "30vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: "#00e5ff", mb: 2 }} />
      <Typography variant="h6" color="gray">
        Loading Items...
      </Typography>
    </Box>
  );
}
