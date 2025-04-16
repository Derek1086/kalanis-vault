import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/Navigation/NavBar.tsx";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { getUserInfo } from "../features/auth/authSlice";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryButton } from "../components/Button";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

const LikedPlaylists: React.FC = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

  useEffect(() => {
    if (user) {
      fetchLikedPlaylists();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchLikedPlaylists = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token) {
        setError("You must be logged in to view your liked playlists");
        setIsLoading(false);
        return;
      }

      const response = await axios.get<UserPlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/liked_playlists/`,
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
      console.error("Liked playlists fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);

        if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load liked playlists. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  // Update local state when a playlist is unliked
  const handlePlaylistUnliked = (playlistId: number): void => {
    setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
  };

  return (
    <>
      <NavBar />

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Header text="Liked Playlists" />
          <Link to="/explore">
            <PrimaryButton className="flex items-center gap-2">
              Explore Playlists
            </PrimaryButton>
          </Link>
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
            <div className="text-4xl mb-4">❤️</div>
            <Header text="No Liked Playlists Yet" />
            <SecondaryText
              text="Explore and like playlists to save them here!"
              className="text-gray-400 mt-2"
            />
            <Link to="/explore">
              <PrimaryButton className="mt-6 mx-auto">
                Explore Playlists
              </PrimaryButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onUnlike={handlePlaylistUnliked}
                isLiked={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LikedPlaylists;
