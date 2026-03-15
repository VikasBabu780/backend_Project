import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoPlayer from "./pages/VideoPlayer";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/UploadPage";
import ChannelPage from "./pages/ChannelPage";
import PlaylistPage from "./pages/PlaylistPage";
import Subscriptions from "./pages/SubscriptionsPage";
import LikedVideos from "./pages/LikedVideosPage";
import Search from "./pages/SearchPage";
import Settings from "./pages/Settings";
import WatchHistory from "./pages/WatchHistory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes — no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All app routes share MainLayout */}
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/video/:videoId" element={<VideoPlayer />} />
          <Route path="/channel/:username" element={<ChannelPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
          <Route path="/search" element={<Search />} />

          {/* Protected routes — must be logged in */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked"
            element={
              <ProtectedRoute>
                <LikedVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <WatchHistory />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
