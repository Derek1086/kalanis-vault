import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import NavBar from "../components/Navigation/NavBar.tsx";
import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryButton, SecondaryButton } from "../components/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

// Define the interfaces based on your API response
interface PlaylistData {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  thumbnail: string | null;
  is_public: boolean;
  user: {
    username: string;
    id: number;
  };
  video_count: number;
  like_count: number;
  is_liked: boolean;
  view_count: number;
  share_count: number;
  videos: VideoData[];
}

interface VideoData {
  id: number;
  title: string | null;
  tiktok_url: string;
  tiktok_id: string;
  thumbnail_url: string | null;
  custom_thumbnail: string | null;
  added_at: string;
  order: number;
}

const BACKEND_DOMAIN =
  import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";

const PlaylistPage: React.FC = () => {
  const { username, playlistId } = useParams<{
    username: string;
    playlistId: string;
  }>();
  const navigate = useNavigate();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [newVideoTitle, setNewVideoTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if the current user is the owner of the playlist
  const isOwner = user && playlist?.user?.id === userInfo?.id;

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  const fetchPlaylistDetails = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token from Redux state or localStorage as fallback
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      const response = await axios.get<PlaylistData>(
        `${BACKEND_DOMAIN}/api/v1/playlists/${playlistId}/`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setPlaylist(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Playlist fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setError("Playlist not found");
        } else if (err.response.status === 403) {
          setError("You don't have permission to view this playlist");
        } else {
          setError("Failed to load playlist details");
        }
      } else {
        setError("Network error. Please check your connection");
      }
    }
  };

  const handleAddVideo = async (): Promise<void> => {
    if (!newVideoUrl.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract TikTok ID from URL (simplified extraction, might need adjustment)
      const tiktokId = newVideoUrl.split("/").pop()?.split("?")[0] || "";

      const token =
        user?.access || JSON.parse(localStorage.getItem("user") || "{}").access;

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/videos/`,
        {
          tiktok_url: newVideoUrl,
          tiktok_id: tiktokId,
          title: newVideoTitle || null,
          playlist: playlistId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the new video
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          videos: [...prev.videos, response.data],
          video_count: prev.video_count + 1,
        };
      });

      // Reset form
      setNewVideoUrl("");
      setNewVideoTitle("");
      setIsAddingVideo(false);
    } catch (err) {
      console.error("Error adding video:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          setError("You don't have permission to add videos to this playlist");
        } else {
          setError("Failed to add video");
        }
      } else {
        setError("Network error while adding video");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePlaylist = async (): Promise<void> => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const token =
        user?.access || JSON.parse(localStorage.getItem("user") || "{}").access;

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/playlists/${playlistId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1,
        };
      });
    } catch (err) {
      console.error("Error liking playlist:", err);
    }
  };

  const handleSharePlaylist = async (): Promise<void> => {
    try {
      const token =
        user?.access || JSON.parse(localStorage.getItem("user") || "{}").access;

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/playlists/${playlistId}/share/`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);

      // Update the local state
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          share_count: response.data.share_count,
        };
      });

      // You could add a toast notification here
      alert("Playlist URL copied to clipboard!");
    } catch (err) {
      console.error("Error sharing playlist:", err);
    }
  };

  // Function to safely get thumbnail URL, fixing the TypeScript issue
  const getThumbnailUrl = (video: VideoData): string => {
    if (video.custom_thumbnail) {
      return `${BACKEND_DOMAIN}${video.custom_thumbnail}`;
    } else if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    return ""; // Return empty string as fallback
  };

  const handleRemoveVideo = async (videoId: number): Promise<void> => {
    if (!isOwner) return;

    try {
      const token =
        user?.access || JSON.parse(localStorage.getItem("user") || "{}").access;

      await axios.delete(`${BACKEND_DOMAIN}/api/v1/videos/${videoId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state by filtering out the removed video
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          videos: prev.videos.filter((video) => video.id !== videoId),
          video_count: prev.video_count - 1,
        };
      });
    } catch (err) {
      console.error("Error removing video:", err);
      setError("Failed to remove video");
    }
  };

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto p-6 flex justify-center items-center h-64">
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <IoWarningOutline className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <PrimaryButton onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </PrimaryButton>
        </div>
      </>
    );
  }

  if (!playlist) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto p-6">
          <div className="text-center py-16">
            <Header text="Playlist not found" />
            <PrimaryButton onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64 h-64 bg-gray-200 rounded flex items-center justify-center">
            {playlist.cover_image ? (
              <img
                src={
                  playlist.cover_image.startsWith("http")
                    ? playlist.cover_image
                    : `${BACKEND_DOMAIN}${playlist.cover_image}`
                }
                alt={playlist.title}
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <div className="text-gray-400 text-6xl">🎵</div>
            )}
          </div>

          <div className="flex-1">
            <Header
              text={playlist.title}
              className="text-2xl md:text-3xl mb-2"
            />
            <p className="text-sm text-gray-500 mb-4">
              By{" "}
              <Link
                to={`/${playlist.user.username}/profile`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {playlist.user.username}
              </Link>{" "}
              • {playlist.is_public ? "Public" : "Private"}
            </p>

            <p className="mb-6">
              {playlist.description || "No description provided"}
            </p>

            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-6">
              <span>
                {playlist.video_count}{" "}
                {playlist.video_count === 1 ? "video" : "videos"}
              </span>
              <span>•</span>
              <span>
                {playlist.view_count}{" "}
                {playlist.view_count === 1 ? "view" : "views"}
              </span>
              <span>•</span>
              <span>
                {playlist.like_count}{" "}
                {playlist.like_count === 1 ? "like" : "likes"}
              </span>
              <span>•</span>
              <span>
                {playlist.share_count}{" "}
                {playlist.share_count === 1 ? "share" : "shares"}
              </span>
            </div>

            <div className="flex gap-3">
              <PrimaryButton
                onClick={handleLikePlaylist}
                className={`px-4 py-2 ${
                  playlist.is_liked ? "bg-pink-600 hover:bg-pink-700" : ""
                }`}
              >
                {playlist.is_liked ? "Liked" : "Like"}
              </PrimaryButton>

              <SecondaryButton
                onClick={handleSharePlaylist}
                className="px-4 py-2"
              >
                Share
              </SecondaryButton>

              {isOwner && (
                <SecondaryButton
                  onClick={() => setIsAddingVideo(!isAddingVideo)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <IoMdAdd size={18} />
                  Add Video
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>

        {/* Add Video Form */}
        {isAddingVideo && (
          <Card className="mb-8 p-6">
            <Header text="Add Video" className="mb-4" />
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="videoUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  TikTok URL*
                </label>
                <input
                  id="videoUrl"
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="videoTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title (Optional)
                </label>
                <input
                  id="videoTitle"
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Enter a title for this video"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <PrimaryButton
                  onClick={handleAddVideo}
                  disabled={!newVideoUrl.trim() || isSubmitting}
                  className="px-4 py-2"
                >
                  {isSubmitting ? (
                    <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                  ) : (
                    "Add Video"
                  )}
                </PrimaryButton>

                <SecondaryButton
                  onClick={() => setIsAddingVideo(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </SecondaryButton>
              </div>
            </div>
          </Card>
        )}

        {/* Videos List */}
        <Header text="Videos" className="mb-4" />

        {playlist.videos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📼</div>
            <Header text="No Videos Yet" />
            <SecondaryText
              text={
                isOwner
                  ? "Add your first video to get started!"
                  : "This playlist doesn't have any videos yet."
              }
              className="text-gray-400 mt-2"
            />
            {isOwner && !isAddingVideo && (
              <PrimaryButton
                onClick={() => setIsAddingVideo(true)}
                className="mt-6 flex items-center gap-2 mx-auto"
              >
                <IoMdAdd size={18} />
                Add Video
              </PrimaryButton>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {playlist.videos.map((video) => (
              <Card
                key={video.id}
                className="p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-40 h-24 bg-gray-200 rounded flex items-center justify-center shrink-0">
                  {video.thumbnail_url || video.custom_thumbnail ? (
                    <img
                      src={getThumbnailUrl(video)}
                      alt={video.title || "Video thumbnail"}
                      className="object-cover w-full h-full rounded"
                    />
                  ) : (
                    <div className="text-gray-400 text-2xl">🎞️</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {video.title || "Untitled Video"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    TikTok ID: {video.tiktok_id}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={video.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View on TikTok
                    </a>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveVideo(video.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistPage;
