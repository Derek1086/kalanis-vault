import { useRef, useEffect, useState } from "react";
import { FaHistory, FaUser } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { CiBoxList } from "react-icons/ci";
import axios from "axios";
import { UserPlaylistData, BACKEND_DOMAIN } from "../../types/playlists";

// Add interface for User type
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

interface AutoCompleteProps {
  searchQuery: string;
  searchHistory: string[];
  show: boolean;
  onSelectItem: (query: string) => void;
  onRemoveItem: (query: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

/**
 * Enhanced AutoComplete component that displays search history, user suggestions, and playlist suggestions
 * Features:
 * - Displays filtered search history based on current query
 * - Shows up to 2 matching users sorted by follower count
 * - Shows up to 2 matching playlists sorted by view count
 * - Displays user profile pictures and playlist cover images
 * - Allows selecting history items, users, and playlists
 * - Allows removing history items
 * - Closes when clicked outside
 */
const AutoComplete = ({
  searchQuery,
  searchHistory,
  show,
  onSelectItem,
  onRemoveItem,
  onClose,
}: AutoCompleteProps) => {
  const autoCompleteRef = useRef<HTMLDivElement>(null);
  const [playlistSuggestions, setPlaylistSuggestions] = useState<
    UserPlaylistData[]
  >([]);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  /**
   * Filter search history based on current search query
   * Returns history items that include the current query (case insensitive)
   * @returns {string[]} Filtered search history items
   */
  const getFilteredSearchHistory = () => {
    if (!searchQuery.trim()) {
      return searchHistory;
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    return searchHistory.filter((item) =>
      item.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Fetches user suggestions based on the current search query
   */
  useEffect(() => {
    const fetchUserSuggestions = async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setUserSuggestions([]);
        return;
      }

      setIsLoadingUsers(true);
      try {
        const token = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

        if (!token) {
          setUserSuggestions([]);
          return;
        }

        const response = await axios.get(
          `${BACKEND_DOMAIN}/api/v1/users/search/?q=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedUsers = response.data
          .sort((a: User, b: User) => b.follower_count - a.follower_count)
          .slice(0, 2);

        setUserSuggestions(sortedUsers);
      } catch (error) {
        console.error("Error fetching user suggestions:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (show) {
        fetchUserSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, show]);

  /**
   * Fetches playlist suggestions based on the current search query
   */
  useEffect(() => {
    const fetchPlaylistSuggestions = async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setPlaylistSuggestions([]);
        return;
      }

      setIsLoadingPlaylists(true);
      try {
        const token = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${BACKEND_DOMAIN}/api/v1/playlists/search/?q=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          { headers }
        );

        const sortedPlaylists = response.data
          .sort((a: UserPlaylistData, b: UserPlaylistData) => {
            const aScore = a.relevanceScore ?? 0;
            const bScore = b.relevanceScore ?? 0;

            if (bScore === aScore) {
              return b.view_count - a.view_count;
            }
            return bScore - aScore;
          })
          .slice(0, 2);

        setPlaylistSuggestions(sortedPlaylists);
      } catch (error) {
        console.error("Error fetching playlist suggestions:", error);
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (show) {
        fetchPlaylistSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, show]);

  /**
   * Effect to close dropdown menu when clicking outside
   * Sets up event listener for clicks outside the autocomplete reference
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autoCompleteRef.current &&
        !autoCompleteRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  /**
   * Handles navigation to a playlist page
   * @param {UserPlaylistData} playlist - The playlist to navigate to
   */
  const handlePlaylistClick = (playlist: UserPlaylistData) => {
    if (playlist.user && playlist.user.username) {
      window.location.href = `/${playlist.user.username}/playlists/${playlist.id}`;
    }
  };

  /**
   * Handles navigation to a user profile page
   * @param {User} user - The user to navigate to
   */
  const handleUserClick = (user: User) => {
    window.location.href = `/${user.username}/profile`;
  };

  const filteredHistory = getFilteredSearchHistory();
  const hasContent =
    filteredHistory.length > 0 ||
    playlistSuggestions.length > 0 ||
    userSuggestions.length > 0;

  if (!show || !hasContent) {
    return null;
  }

  return (
    <div
      ref={autoCompleteRef}
      className="absolute z-50 w-full bg-[#1e1c1f] top-12 rounded-md shadow-lg overflow-hidden"
    >
      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.length > 0 && (
          <>
            <div className="px-4 py-1 text-xs text-gray-400 font-medium border-b border-gray-400">
              SEARCH HISTORY
            </div>
            <ul>
              {filteredHistory.map((item, index) => (
                <li
                  key={`history-${index}`}
                  className="flex items-center justify-between px-4 py-2 hover:bg-[#2a282b] cursor-pointer text-white"
                  onClick={() => onSelectItem(item)}
                >
                  <div className="flex items-center">
                    <FaHistory className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{item}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-200 cursor-pointer"
                    onClick={(e) => onRemoveItem(item, e)}
                    aria-label={`Remove ${item} from search history`}
                  >
                    <IoMdClose className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {userSuggestions.length > 0 && (
          <>
            <div className="px-4 py-1 text-xs text-gray-400 font-medium border-b border-gray-400">
              USERS
            </div>
            <ul>
              {userSuggestions.map((user) => (
                <li
                  key={`user-${user.id}`}
                  className="flex items-center px-4 py-2 hover:bg-[#2a282b] cursor-pointer text-white"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-400 flex-shrink-0">
                    {user.profile_picture ? (
                      <img
                        src={
                          user.profile_picture.startsWith("http")
                            ? user.profile_picture
                            : `${BACKEND_DOMAIN}${user.profile_picture}`
                        }
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement!.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center bg-gray-400 text-white">' +
                            user.username.charAt(0).toUpperCase() +
                            "</div>";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.first_name} {user.last_name} • {user.follower_count}{" "}
                      {user.follower_count === 1 ? "follower" : "followers"}
                    </div>
                  </div>
                  <FaUser className="h-4 w-4 text-gray-400 ml-2" />
                </li>
              ))}
            </ul>
          </>
        )}

        {playlistSuggestions.length > 0 && (
          <>
            <div className="px-4 py-1 text-xs text-gray-400 font-medium border-b border-gray-400">
              PLAYLISTS
            </div>
            <ul>
              {playlistSuggestions.map((playlist) => (
                <li
                  key={`playlist-${playlist.id}`}
                  className="flex items-center px-4 py-2 hover:bg-[#2a282b] cursor-pointer text-white"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className="h-10 w-10 rounded overflow-hidden mr-3 bg-gray-400 flex-shrink-0">
                    {playlist.cover_image ? (
                      <img
                        src={
                          playlist.cover_image.startsWith("http")
                            ? playlist.cover_image
                            : `${BACKEND_DOMAIN}${playlist.cover_image}`
                        }
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement!.innerHTML = "🎵";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🎵
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {playlist.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {playlist.user?.username} • {playlist.video_count}{" "}
                      {playlist.video_count === 1 ? "video" : "videos"}
                    </div>
                  </div>
                  <CiBoxList className="h-5 w-5 text-gray-400 ml-2" />
                </li>
              ))}
            </ul>
          </>
        )}

        {(isLoadingPlaylists || isLoadingUsers) && (
          <div className="flex justify-center items-center py-3">
            <div className="animate-pulse bg-gray-600 h-5 w-32 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoComplete;
