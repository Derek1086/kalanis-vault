import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
 * with infinite scrolling functionality
 *
 * @component
 * @param {object} props - Component props
 * @param {string} props.username - The username of the user whose playlists should be displayed
 * @returns {JSX.Element} A component displaying user playlists or appropriate loading/error states
 */
const UserPlaylists: React.FC<UserPlaylistsProps> = ({ username }) => {
  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const PLAYLISTS_PER_PAGE = 6;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches the user's playlists from the backend API
   *
   * @async
   * @function fetchUserPlaylists
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} isInitial - Whether this is the initial fetch
   * @returns {Promise<void>}
   */
  const fetchUserPlaylists = async (
    pageNum: number,
    isInitial: boolean = false
  ): Promise<void> => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").username
        : null;

      const isCurrentUser = username === currentUser;
      setIsCurrentUser(isCurrentUser);

      let response;
      if (isCurrentUser) {
        response = await axios.get<UserPlaylistData[]>(
          `${BACKEND_DOMAIN}/api/v1/playlists/my_playlists/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page: pageNum,
              limit: PLAYLISTS_PER_PAGE,
            },
          }
        );
      } else {
        response = await axios.get<UserPlaylistData[]>(
          `${BACKEND_DOMAIN}/api/v1/playlists/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              username: username,
              page: pageNum,
              limit: PLAYLISTS_PER_PAGE,
            },
          }
        );

        const filteredPlaylists = response.data.filter(
          (playlist) => playlist.user.username === username
        );

        setHasMore(filteredPlaylists.length === PLAYLISTS_PER_PAGE);

        if (isInitial) {
          setPlaylists(filteredPlaylists);
        } else {
          setPlaylists((prev) => [...prev, ...filteredPlaylists]);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      setHasMore(response.data.length === PLAYLISTS_PER_PAGE);

      if (isInitial) {
        setPlaylists(response.data);
      } else {
        setPlaylists((prev) => [...prev, ...response.data]);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      setIsLoading(false);
      setIsLoadingMore(false);
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

  /**
   * Sets up the intersection observer for infinite scrolling
   */
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    setPage(1);
    setPlaylists([]);
    fetchUserPlaylists(1, true);
  }, [username]);

  useEffect(() => {
    if (page > 1) {
      fetchUserPlaylists(page);
    }
  }, [page]);

  useEffect(() => {
    setupObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver]);

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Playlists</h2>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-6 bg-[#232126] rounded-lg">
          <p className="text-gray-400">
            {isCurrentUser
              ? "No playlists created yet"
              : `${username} hasn't created any public playlists yet`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>

          {/* Load more indicator */}
          <div
            ref={loadMoreRef}
            className="h-10 w-full flex justify-center items-center mt-4"
          >
            {isLoadingMore && (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 text-gray-400" />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserPlaylists;
