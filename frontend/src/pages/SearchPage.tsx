import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

import NavBar from "../components/Navigation/NavBar.tsx";
import { FilterButton } from "../components/Button";
import { Header, SecondaryText } from "../components/Typography";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import UserCard from "../components/Users/UserCard.tsx";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  follower_count: number;
  following_count?: number;
  is_following?: boolean;
}

/**
 * SearchPage Component
 *
 * @description A page component that displays search results for playlists and users based on a query parameter.
 * Fetches data from the API, sorts results by relevance, and handles loading and error states.
 * Also displays the logged-in user's profile card.
 *
 * @component
 * @returns {JSX.Element} Rendered search results page
 */
const SearchPage = () => {
  const navigate = useNavigate();
  const { query } = useParams();

  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  /**
   * Effect hook to fetch search results when query changes
   */
  useEffect(() => {
    if (query) {
      fetchPlaylistSearchResults(query);
      fetchUserSearchResults(query);
    }
  }, [query]);

  /**
   * Fetches playlist search results from the API
   *
   * @param {string} searchQuery - The search query to find playlists
   * @returns {Promise<void>}
   */
  const fetchPlaylistSearchResults = async (searchQuery: string) => {
    setIsLoadingPlaylists(true);
    setError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/playlists/search/?q=${encodeURIComponent(
          searchQuery
        )}`,
        { headers }
      );

      const sortedPlaylists = sortPlaylistsByRelevance(
        response.data,
        searchQuery
      );
      setPlaylists(sortedPlaylists);
      setIsLoadingPlaylists(false);
    } catch (err) {
      setIsLoadingPlaylists(false);
      console.error("Playlist search results fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
          navigate("/login");
        } else {
          setError("Failed to load search results. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  /**
   * Fetches user search results from the API
   *
   * @param {string} searchQuery
   * @returns {Promise<void>}
   */
  const fetchUserSearchResults = async (searchQuery: string) => {
    setIsLoadingUsers(true);
    setError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setIsLoadingUsers(false);
        setUsers([]);
        return;
      }

      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/users/search/?q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sortedUsers = response.data.sort(
        (a: User, b: User) => b.follower_count - a.follower_count
      );

      setUsers(sortedUsers);
      setIsLoadingUsers(false);
    } catch (err) {
      setIsLoadingUsers(false);
      console.error("User search results fetch error:", err);

      if (!error) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError("Your session has expired. Please log in again.");
            navigate("/login");
          } else {
            setError("Failed to load search results. Please try again.");
          }
        } else {
          setError(
            "Network error. Please check your connection and try again."
          );
        }
      }
    }
  };

  /**
   * Sorts playlists by relevance to the search query
   *
   * @param {UserPlaylistData[]} playlists - The playlists to sort
   * @param {string} searchQuery - The search query to compare against
   * @returns {UserPlaylistData[]} Sorted playlists by relevance score
   */
  const sortPlaylistsByRelevance = (
    playlists: UserPlaylistData[],
    searchQuery: string
  ): UserPlaylistData[] => {
    const lowerQuery = searchQuery.toLowerCase();

    const scoredPlaylists = playlists.map((playlist) => {
      let score = 0;

      if (
        playlist.user &&
        playlist.user.username &&
        playlist.user.username.toLowerCase().includes(lowerQuery)
      ) {
        score += 4;
      }

      if (playlist.title.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }

      if (
        playlist.tags &&
        playlist.tags.some((tag) => tag.name.toLowerCase().includes(lowerQuery))
      ) {
        score += 2;
      }

      if (
        playlist.description &&
        playlist.description.toLowerCase().includes(lowerQuery)
      ) {
        score += 1;
      }

      return { ...playlist, relevanceScore: score };
    });

    return scoredPlaylists
      .filter((playlist) => playlist.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Determine which filter buttons to show based on results
  const showUserFilter = users.length > 0;
  const showPlaylistFilter = playlists.length > 0;

  const getFilteredResults = () => {
    if (
      (users.length === 0 && playlists.length === 0) ||
      (isLoadingUsers && isLoadingPlaylists)
    ) {
      return { filteredUsers: [], filteredPlaylists: [] };
    }

    if (activeFilter === "Users") {
      return { filteredUsers: users, filteredPlaylists: [] };
    } else if (activeFilter === "Playlists") {
      return { filteredUsers: [], filteredPlaylists: playlists };
    } else {
      return { filteredUsers: users, filteredPlaylists: playlists };
    }
  };

  const { filteredUsers, filteredPlaylists } = getFilteredResults();
  const totalResultsCount = filteredUsers.length + filteredPlaylists.length;
  const isLoading = isLoadingUsers || isLoadingPlaylists;

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <Header
              text={`${totalResultsCount} result${
                totalResultsCount !== 1 ? "s" : ""
              } for "${query}"`}
            />

            {(showUserFilter || showPlaylistFilter) && !isLoading && (
              <div className="flex space-x-2 mt-2 mb-4">
                <FilterButton
                  key="All"
                  title="All"
                  active={activeFilter === "All"}
                  onClick={() => setActiveFilter("All")}
                />

                {showUserFilter && (
                  <FilterButton
                    key="Users"
                    title="Users"
                    active={activeFilter === "Users"}
                    onClick={() => setActiveFilter("Users")}
                  />
                )}

                {showPlaylistFilter && (
                  <FilterButton
                    key="Playlists"
                    title="Playlists"
                    active={activeFilter === "Playlists"}
                    onClick={() => setActiveFilter("Playlists")}
                  />
                )}
              </div>
            )}

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
            ) : totalResultsCount === 0 ? (
              <div className="text-center">
                <Header text="No Results Found" />
                <SecondaryText
                  text={`We couldn't find any users or playlists matching "${query}"`}
                  className="text-gray-400 mt-2"
                />
              </div>
            ) : (
              <div>
                {/* User Results Section */}
                {filteredUsers.length > 0 && (
                  <div className="mb-8">
                    <SecondaryText
                      text={`Users (${filteredUsers.length})`}
                      className="text-gray-300 font-semibold mb-4"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredUsers.map((user) => (
                        <UserCard key={`user-${user.id}`} user={user} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlist Results Section */}
                {filteredPlaylists.length > 0 && (
                  <div>
                    <SecondaryText
                      text={`Playlists (${filteredPlaylists.length})`}
                      className="text-gray-300 font-semibold mb-4"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPlaylists.map((playlist) => (
                        <PlaylistCard
                          key={`playlist-${playlist.id}`}
                          playlist={playlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
