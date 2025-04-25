import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { toast } from "react-toastify";
import { getUserInfo } from "../features/auth/authSlice.ts";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

import NavBar from "../components/Navigation/NavBar.tsx";
import EmbedVideo from "../components/Forms/EmbedVideo.tsx";
import VideoCard from "../components/Playlists/VideoCard.tsx";
import EditPlaylist from "../components/Forms/EditPlaylist.tsx";
import TagCard from "../components/Playlists/TagCard.tsx";
import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import {
  PrimaryButton,
  SecondaryButton,
  ActionButton,
} from "../components/Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { FaRegHeart, FaHeart, FaShare } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";

/**
 * PlaylistPage component displays a user's playlist with options to like, share,
 * edit, delete, and add videos. It handles fetching playlist data, user interactions,
 * and conditional rendering based on permissions and auth status.
 *
 * @component
 */
const PlaylistPage: React.FC = () => {
  const { username, playlistId } = useParams<{
    username: string;
    playlistId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
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

  const isOwner = user && playlist?.user?.id === userInfo?.id;

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo());
    }
  }, [user, userInfo, dispatch]);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId, user, userInfo]);

  /**
   * Returns the current authentication token from user state or local storage.
   *
   * @returns {string | null} The JWT token if available, otherwise null.
   */
  const getAuthToken = (): string | null => {
    if (user?.access) {
      return user.access;
    }

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

  /**
   * Fetches detailed playlist data from the backend API using the playlistId from URL params.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once the playlist data has been fetched.
   */
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
          toast.error("Session expired. Please log in again", {
            theme: "dark",
          });
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load playlist details");
        }
      } else {
        setError("Network error. Please check your connection");
      }
    }
  };

  /**
   * Handles the addition of a new TikTok video to the current playlist.
   * Validates URL, retrieves token, makes POST request, and updates state.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves after attempting to add a video.
   */
  const handleAddVideo = async (): Promise<void> => {
    if (!newVideoUrl.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
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

      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          videos: [...prev.videos, response.data],
          video_count: prev.video_count + 1,
        };
      });

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

  /**
   * Handles liking or unliking the playlist.
   * Sends a POST request to the backend and updates the local like state.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once the like state is updated.
   */
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
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      await axios.post(
        `${BACKEND_DOMAIN}/api/v1/playlists/${playlistId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  /**
   * Shares the current playlist by sending a POST request and copying the URL to clipboard.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once the playlist has been shared.
   */
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

      navigator.clipboard.writeText(window.location.href);

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

  /**
   * Removes a video from the playlist.
   * Only available if the current user is the owner of the playlist.
   *
   * @async
   * @param {number} videoId - The ID of the video to be removed.
   * @returns {Promise<void>} A promise that resolves once the video has been removed.
   */
  const handleRemoveVideo = async (videoId: number): Promise<void> => {
    if (!isOwner) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("You need to be logged in to remove videos", {
          theme: "dark",
        });
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      await axios.delete(`${BACKEND_DOMAIN}/api/v1/videos/${videoId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError("Failed to remove video");
      }
    }
  };

  /**
   * Handles the result of a playlist being updated by updating the local state.
   *
   * @param {UserPlaylistData} updatedPlaylist - The updated playlist data
   */
  const handlePlaylistUpdated = (updatedPlaylist: UserPlaylistData): void => {
    setIsEditModalOpen(false);
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
  };

  /**
   * Deletes the current playlist.
   * Prompts user confirmation and handles auth and API call logic.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves after the playlist is deleted.
   */
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
          localStorage.removeItem("user");
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
          localStorage.removeItem("user");
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

      <NavBar />
      <div className="container mx-auto p-6">
        {isOwner && (
          <>
            {/* Use EditPlaylist instead of NewPlaylist for editing */}
            <EditPlaylist
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onPlaylistUpdated={handlePlaylistUpdated}
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
          <div className="flex flex-col justify-end flex-1">
            <Header
              text={playlist.title}
              className="text-2xl md:text-3xl mb-2"
            />
            <SecondaryText
              text={playlist.description || ""}
              className="mb-4 text-gray-400"
            />
            <p className="text-sm text-gray-400 mb-2">
              By{" "}
              <NavLink
                className="text-[#c549d4] hover:text-[#b23abc] font-medium"
                to={`/${playlist.user.username}/profile`}
              >
                {playlist.user.username}
              </NavLink>{" "}
              • {playlist.is_public ? "Public" : "Private"} •{" "}
              {playlist.video_count}{" "}
              {playlist.video_count === 1 ? "video" : "videos"}
            </p>
            <p className="text-sm text-gray-400">
              {playlist.view_count}{" "}
              {playlist.view_count === 1 ? "view" : "views"} •{" "}
              {playlist.like_count}{" "}
              {playlist.like_count === 1 ? "like" : "likes"} •{" "}
              {playlist.share_count}{" "}
              {playlist.share_count === 1 ? "share" : "shares"}
            </p>
          </div>
        </div>
        <div>
          {playlist.tags && playlist.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Header text="Tags: " className="mb-2 text-xlg" />
              {playlist.tags.map((tag, index) => (
                <TagCard key={index} index={index} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Playlist Actions */}
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <>
              <ActionButton
                icon={<IoMdAdd className="h-7 w-7" />}
                onClick={() => setIsEmbedModalOpen(true)}
              />
              <ActionButton
                icon={<MdEdit className="h-7 w-7" />}
                onClick={() => setIsEditModalOpen(true)}
              />
              <ActionButton
                icon={<MdDelete className="h-7 w-7" />}
                disabled={isDeleting}
                onClick={handleDeletePlaylist}
              />
            </>
          )}
          <ActionButton
            icon={
              playlist.is_liked ? (
                <FaHeart className="h-7 w-7" />
              ) : (
                <FaRegHeart className="h-7 w-7" />
              )
            }
            onClick={handleLikePlaylist}
          />
          <ActionButton
            icon={<FaShare className="h-7 w-7" />}
            onClick={handleSharePlaylist}
          />
        </div>

        {/* Videos List */}
        <div>
          {playlist.videos.length > 0 && (
            <>
              <Header text="Videos: " className="mb-4 mt-4" />
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistPage;
