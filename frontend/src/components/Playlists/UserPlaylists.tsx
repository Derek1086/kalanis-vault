import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserPlaylistData, BACKEND_DOMAIN } from "../../types/playlists";
import PlaylistCard from "../Playlists/PlaylistCard";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";

/**
 * Props for the UserPlaylists component
 * @interface UserPlaylistsProps
 * @property {string} username - The username of the user whose playlists should be displayed
 */
type UserPlaylistsProps = {
  username: string;
};

/**
 * Component that fetches and displays a list of playlists for a specific user
 *
 * @component
 * @param {object} props - Component props
 * @param {string} props.username - The username of the user whose playlists should be displayed
 * @returns {JSX.Element} A component displaying user playlists or appropriate loading/error states
 */
const UserPlaylists: React.FC<UserPlaylistsProps> = ({ username }) => {
  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect hook to fetch user playlists when the username changes
   */
  useEffect(() => {
    fetchUserPlaylists();
  }, [username]);

  /**
   * Fetches the user's playlists from the backend API
   *
   * @async
   * @function fetchUserPlaylists
   * @returns {Promise<void>}
   */
  const fetchUserPlaylists = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setError("Authentication required");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded flex items-center">
        <IoWarningOutline className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Playlists</h2>
        <Link
          to={`/${username}/playlists`}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          View All
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-6 bg-[#232126] rounded-lg">
          <p className="text-gray-400">No playlists created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.slice(0, 3).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPlaylists;
