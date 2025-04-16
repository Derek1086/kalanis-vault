import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import NavBar from "../components/Navigation/NavBar.tsx";
import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryButton, SecondaryButton } from "../components/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import EmbedVideo from "../components/Forms/EmbedVideo.tsx";
import VideoCard from "../components/Playlists/VideoCard.tsx";
import NewPlaylist from "../components/Forms/NewPlaylist.tsx";
import { toast } from "react-toastify";
import { getUserInfo } from "../features/auth/authSlice.ts";
import {
  UserPlaylistData,
  VideoData,
  BACKEND_DOMAIN,
} from "../types/playlists.ts";

const PlaylistPage: React.FC = () => {
  const { username, playlistId } = useParams<{
    username: string;
    playlistId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<UserPlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [newVideoTitle, setNewVideoTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Check if the current user is the owner of the playlist
  const isOwner = user && playlist?.user?.id === userInfo?.id;

  // Ensure we have userInfo
  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

  // Fetch playlist details whenever component mounts,
  // when playlistId changes, or when auth state changes
  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId, user, userInfo]);

  const getAuthToken = (): string | null => {
    // First try from Redux state
    if (user?.access) {
      return user.access;
    }

    // Then fallback to localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.access || null;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }

    return null;
  };

  const fetchPlaylistDetails = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      const response = await axios.get<UserPlaylistData>(
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
        } else if (err.response.status === 401) {
          // Token might be expired, try to refresh or redirect to login
          setError("Session expired. Please log in again.");
          // Optionally, redirect to login here
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

      const token = getAuthToken();
      if (!token) {
        toast.error("You need to be logged in to add videos", {
          theme: "dark",
        });
        navigate("/login");
        return;
      }

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
        if (err.response.status === 401) {
          toast.error("Session expired. Please log in again", {
            theme: "dark",
          });
          navigate("/login");
        } else if (err.response.status === 403) {
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
      const token = getAuthToken();
      if (!token) {
        toast.error("You need to be logged in to like playlists", {
          theme: "dark",
        });
        navigate("/login");
        return;
      }

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

      toast.success(
        playlist?.is_liked ? "Playlist unliked" : "Playlist liked",
        { theme: "dark" }
      );
    } catch (err) {
      console.error("Error liking playlist:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Session expired. Please log in again", {
          theme: "dark",
        });
        navigate("/login");
      }
    }
  };

  const handleSharePlaylist = async (): Promise<void> => {
    try {
      const token = getAuthToken();

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

      toast.success("Playlist URL copied to clipboard!", {
        theme: "dark",
      });
    } catch (err) {
      console.error("Error sharing playlist:", err);
      toast.error("Could not share playlist", {
        theme: "dark",
      });
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
      const token = getAuthToken();
      if (!token) {
        toast.error("You need to be logged in to remove videos", {
          theme: "dark",
        });
        navigate("/login");
        return;
      }

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

      toast.success("Video removed successfully", {
        theme: "dark",
      });
    } catch (err) {
      console.error("Error removing video:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Session expired. Please log in again", {
          theme: "dark",
        });
        navigate("/login");
      } else {
        setError("Failed to remove video");
      }
    }
  };

  // Handle playlist edit through NewPlaylist component
  const handlePlaylistUpdated = (updatedPlaylist: any): void => {
    setIsEditModalOpen(false);
    // Merge the updated playlist data with existing playlist data
    setPlaylist((prev) => {
      if (!prev) return updatedPlaylist;
      return {
        ...prev,
        title: updatedPlaylist.title,
        description: updatedPlaylist.description,
        cover_image: updatedPlaylist.cover_image,
        is_public: updatedPlaylist.is_public,
        tags: updatedPlaylist.tags,
      };
    });

    toast.success("Playlist updated successfully", {
      theme: "dark",
    });
  };

  // Handle playlist deletion
  const handleDeletePlaylist = async (): Promise<void> => {
    if (!playlist || !isOwner) return;

    if (
      window.confirm(`Are you sure you want to delete "${playlist.title}"?`)
    ) {
      setIsDeleting(true);

      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("You need to be logged in to delete this playlist", {
            theme: "dark",
          });
          navigate("/login");
          return;
        }

        await axios.delete(
          `${BACKEND_DOMAIN}/api/v1/playlists/${playlist.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`Deleted "${playlist.title}"`, {
          theme: "dark",
        });

        const targetUsername = playlist.user.username || userInfo.username;
        navigate(`/${targetUsername}/playlists`);
      } catch (error) {
        console.error("Error deleting playlist:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Session expired. Please log in again", {
            theme: "dark",
          });
          navigate("/login");
        } else {
          toast.error("Failed to delete playlist", {
            theme: "dark",
          });
        }
      } finally {
        setIsDeleting(false);
      }
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
        {/* Edit Playlist Modal */}
        {isOwner && (
          <>
            <NewPlaylist
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onPlaylistCreated={handlePlaylistUpdated}
              editMode={true}
              playlistData={playlist}
            />
            <EmbedVideo
              isOpen={isEmbedModalOpen}
              onClose={() => setIsEmbedModalOpen(false)}
              onVideoAdded={(newVideo) => {
                setPlaylist((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    videos: [...prev.videos, newVideo],
                    video_count: prev.video_count + 1,
                  };
                });

                // Add toast message here
                toast.success(
                  `Video "${newVideo.title || "Untitled"}" added to playlist!`,
                  {
                    theme: "dark",
                  }
                );
              }}
              playlistId={playlistId}
            />
          </>
        )}

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

            <p className="mb-4">
              {playlist.description || "No description provided"}
            </p>

            {playlist.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {playlist.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

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

            <div className="flex flex-wrap gap-3">
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
                <>
                  <SecondaryButton
                    onClick={() => setIsEmbedModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <IoMdAdd size={18} />
                    Add Video
                  </SecondaryButton>

                  <SecondaryButton
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2"
                  >
                    Edit Playlist
                  </SecondaryButton>

                  <PrimaryButton
                    onClick={handleDeletePlaylist}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Playlist"}
                  </PrimaryButton>
                </>
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
                onClick={() => setIsEmbedModalOpen(true)}
                className="mt-6 flex items-center gap-2 mx-auto"
              >
                <IoMdAdd size={18} />
                Add Video
              </PrimaryButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlist.videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isOwner={isOwner}
                onRemove={handleRemoveVideo}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistPage;
