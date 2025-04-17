import axios from "axios";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { getUserInfo } from "../features/auth/authSlice";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

import NavBar from "../components/Navigation/NavBar.tsx";
import NewPlaylist from "../components/Forms/NewPlaylist.tsx";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import { Header } from "../components/Typography";
import { PrimaryButton } from "../components/Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

const MyPlaylists: React.FC = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token) {
        setError("You must be logged in to view your playlists");
        setIsLoading(false);
        return;
      }

      const response = await axios.get<UserPlaylistData[]>(
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

  const handlePlaylistCreated = (newPlaylist: any): void => {
    const existingIndex = playlists.findIndex((p) => p.id === newPlaylist.id);

    if (existingIndex >= 0) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[existingIndex] = newPlaylist;
      setPlaylists(updatedPlaylists);
    } else {
      setPlaylists([newPlaylist, ...playlists]);
    }
  };

  return (
    <>
      <NavBar onCreatePlaylist={() => setIsModalOpen(true)} />

      <NewPlaylist
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6 mx-[50px]">
          <Header text="My Playlists" />
          <div>
            <PrimaryButton
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <IoMdAdd size={18} />
              New Playlist
            </PrimaryButton>
          </div>
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
          <div className="text-center">
            <Header text="No Playlists Yet" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-[50px]">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPlaylists;
