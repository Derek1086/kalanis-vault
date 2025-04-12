import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/Navigation/NavBar.tsx";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { getUserInfo } from "../features/auth/authSlice";
import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryButton } from "../components/Button";
import { Modal } from "../components/Container";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

// Define the playlist interface based on your API response
interface PlaylistData {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_public: boolean;
  video_count: number;
  like_count: number;
}

const BACKEND_DOMAIN =
  import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";

const MyPlaylists: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Use the same authentication approach as HomePage
  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPlaylists = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token from Redux state or localStorage as fallback
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token) {
        setError("You must be logged in to view your playlists");
        setIsLoading(false);
        return;
      }

      const response = await axios.get<PlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/my_playlists/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlaylists(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Playlist fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);

        if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load playlists. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  const handlePlaylistCreated = (newPlaylist: PlaylistData): void => {
    setPlaylists([newPlaylist, ...playlists]);
  };

  const PlaylistCard: React.FC<{ playlist: PlaylistData }> = ({ playlist }) => {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow duration-200">
        <div className="h-32 mb-3 bg-gray-200 rounded flex items-center justify-center">
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
            <div className="text-gray-400 text-4xl">🎵</div>
          )}
        </div>
        <h3 className="font-semibold text-lg truncate">{playlist.title}</h3>
        <SecondaryText
          text={
            playlist.description
              ? playlist.description.length > 60
                ? playlist.description.substring(0, 60) + "..."
                : playlist.description
              : "No description"
          }
          className="text-gray-500 text-sm mt-1 h-10 overflow-hidden"
        />
        <div className="flex justify-between items-center mt-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">
              {playlist.is_public ? "Public" : "Private"}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {playlist.video_count}{" "}
              {playlist.video_count === 1 ? "video" : "videos"}
            </span>
          </div>
          <PrimaryButton
            onClick={() => {
              navigate(`/${userInfo.username}/playlists/${playlist.id}`);
            }}
            className="text-sm px-3 py-1"
          >
            View
          </PrimaryButton>
        </div>
      </Card>
    );
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Header text="My Playlists" />
          <PrimaryButton
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <IoMdAdd size={18} />
            New Playlist
          </PrimaryButton>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <IoWarningOutline className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📂</div>
            <Header text="No Playlists Yet" />
            <SecondaryText
              text="Create your first playlist to get started!"
              className="text-gray-400 mt-2"
            />
            <PrimaryButton
              onClick={() => setIsModalOpen(true)}
              className="mt-6 flex items-center gap-2 mx-auto"
            >
              <IoMdAdd size={18} />
              Create Playlist
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}

        {/* <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Playlist"
          description="Create a new playlist to organize your favorite tracks."
          onPlaylistCreated={handlePlaylistCreated}
        /> */}
      </div>
    </>
  );
};

export default MyPlaylists;
