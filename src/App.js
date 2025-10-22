import "./App.css";
import Header from "./comp/Header";
import BottomNav from "./comp/BottomNav";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FootballProvider } from "./FootballContext";
import Home from "./pages/Home";
import Teams from "./pages/Teams";
import Matches from "./pages/Matches";
import Players from "./pages/Players";
import Trainers from "./pages/Trainers";
import Leaderboard from "./pages/Leaderboard";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PlayerDetail from "./pages/PlayerDetail";
import TeamDetail from "./pages/TeamDetail";
import MatchResponse from "./pages/MatchResponse";
import RatePlayers from "./pages/RatePlayers";
import CreateTeam from "./pages/CreateTeam";
import TeamSuccess from "./pages/TeamSuccess";
import SubmitMatchStatsPage from "./pages/SubmitMatchStatsPage";
import TrainerDetail from "./pages/TrainerDetail";
import CreateTrainer from "./pages/CreateTrainer";


// ✅ Animation wrapper for pages
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>

);

// ✅ Animated Routes component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/teams" element={<PageWrapper><Teams /></PageWrapper>} />
        <Route path="/create-team" element={<PageWrapper><CreateTeam /></PageWrapper>} />
        <Route path="/team-success" element={<PageWrapper><TeamSuccess /></PageWrapper>} />
        <Route path="/teams/:id" element={<PageWrapper><TeamDetail /></PageWrapper>} />
        <Route path="/players" element={<PageWrapper><Players /></PageWrapper>} />
        <Route path="/players/:id" element={<PageWrapper><PlayerDetail /></PageWrapper>} />
        <Route path="/match-response" element={<PageWrapper><MatchResponse /></PageWrapper>} />
        <Route path="/submit-stats" element={<PageWrapper><SubmitMatchStatsPage /></PageWrapper>} />
        <Route path="/rate-players" element={<PageWrapper><RatePlayers /></PageWrapper>} />
        <Route path="/Trainers" element={<PageWrapper><Trainers /></PageWrapper>} />
        <Route path="/trainer-detail" element={<PageWrapper><TrainerDetail /></PageWrapper>} />
        <Route path="/create-trainer" element={<PageWrapper><CreateTrainer /></PageWrapper>} />
        <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
        <Route path="/matches" element={<PageWrapper><Matches /></PageWrapper>} />
        <Route path="/store" element={<PageWrapper><Store /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/notification" element={<PageWrapper><Notification /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <FootballProvider>
      <Router>
        <div style={{ color: "white", marginTop: "50px" }}>
          <Header />
          <AnimatedRoutes /> {/* ✅ smooth animated routing */}
          <BottomNav />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark" // 🔹 Options: "light" | "dark" | "colored"
            toastStyle={{
              backgroundColor: "rgba(20, 20, 20, 0.9)",
              color: "#00e5ff",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "'Montserrat', sans-serif",
            }}
            progressStyle={{
              background: "linear-gradient(90deg, #00e5ff, #00ff99)",
            }}
          />

        </div>
      </Router>
    </FootballProvider>
  );
}

export default App;
