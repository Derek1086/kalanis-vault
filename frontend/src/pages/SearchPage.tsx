import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";
import { RootState, AppDispatch } from "../app/store";
import { getUserInfo } from "../features/auth/authSlice";

import NavBar from "../components/Navigation/NavBar.tsx";
import { FilterButton } from "../components/Button";
import { Header, SecondaryText } from "../components/Typography";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import UserCard from "../components/Users/UserCard.tsx";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";

/**
 * SearchPage Component
 *
 * @description A page component that displays search results for playlists based on a query parameter.
 * Fetches data from the API, sorts results by relevance, and handles loading and error states.
 * Also displays the logged-in user's profile card.
 *
 * @component
 * @returns {JSX.Element} Rendered search results page
 */
const SearchPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { query } = useParams();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [followerCount, setFollowerCount] = useState<number>(0);

  /**
   * Effect hook to fetch user info when component mounts
   */
  useEffect(() => {
    if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
      dispatch(getUserInfo());
    }
  }, [user, userInfo, dispatch]);

  /**
   * Effect hook to fetch follower count when userInfo is available
   */
  useEffect(() => {
    if (userInfo && userInfo.id) {
      fetchFollowerCount(userInfo.id);
    }
  }, [userInfo]);

  /**
   * Effect hook to fetch search results when query changes
   */
  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  /**
   * Fetches follower count for the logged-in user
   *
   * @param {number} userId - The user ID to fetch follower count for
   * @returns {Promise<void>}
   */
  const fetchFollowerCount = async (userId: number) => {
    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) return;

      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/users/follow-status/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowerCount(response.data.follower_count);
    } catch (err) {
      console.error("Error fetching follower count:", err);
    }
  };

  /**
   * Fetches search results from the API
   *
   * @param {string} searchQuery - The search query to find playlists
   * @returns {Promise<void>}
   */
  const fetchSearchResults = async (searchQuery: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Search results fetch error:", err);

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

  // Prepare user data for UserCard
  const userData = userInfo
    ? {
        id: userInfo.id,
        username: userInfo.username,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        profile_picture: userInfo.profile_picture,
        follower_count: followerCount,
      }
    : null;

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Card Column */}
          <div className="w-full md:w-1/4">
            {userData ? (
              <div>
                <Header text="Your Profile" className="mb-4" />
                <UserCard user={userData} />
              </div>
            ) : (
              user && (
                <div className="flex justify-center items-center h-48">
                  <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
                </div>
              )
            )}
          </div>

          {/* Search Results Column */}
          <div className="w-full md:w-3/4">
            <Header
              text={`${playlists.length} result${
                playlists.length !== 1 ? "s" : ""
              } for "${query}"`}
            />

            {playlists.length >= 1 && (
              <div className="flex space-x-2 mt-2 mb-4">
                {["All", "Users", "Playlists"].map((filter) => (
                  <FilterButton
                    key={filter}
                    title={filter}
                    active={activeFilter === filter}
                    onClick={() => {
                      setActiveFilter((prev) =>
                        prev === filter ? "" : filter
                      );
                    }}
                  />
                ))}
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
            ) : playlists.length === 0 ? (
              <div className="text-center">
                <Header text="No Results Found" />
                <SecondaryText
                  text={`We couldn't find any playlists matching "${query}"`}
                  className="text-gray-400 mt-2"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
