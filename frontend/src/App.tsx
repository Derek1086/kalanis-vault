import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ActivatePage from "./pages/ActivatePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordPageConfirm from "./pages/ResetPasswordPageConfirm";
import ProfilePage from "./pages/ProfilePage";
import MyPlaylists from "./pages/MyPlaylists";
import LikedPlaylists from "./pages/LikedPlaylists";
import PlaylistPage from "./pages/PlaylistPage";
import SearchPage from "./pages/SearchPage";
import ExplorePage from "./pages/ExplorePage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/activate/:uid/:token" element={<ActivatePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/password/reset/confirm/:uid/:token"
            element={<ResetPasswordPageConfirm />}
          />
          <Route path="/:username/profile" element={<ProfilePage />} />
          <Route path="/:username/playlists" element={<MyPlaylists />} />
          <Route
            path="/:username/liked-playlists"
            element={<LikedPlaylists />}
          />
          <Route
            path="/:username/playlists/:playlistId"
            element={<PlaylistPage />}
          />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
