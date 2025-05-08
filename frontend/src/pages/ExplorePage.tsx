import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { getUserInfo } from "../features/auth/authSlice";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists";

import NavBar from "../components/Navigation/NavBar";
import NewPlaylist from "../components/Forms/NewPlaylist";
import PlaylistCard from "../components/Playlists/PlaylistCard";
import { Header } from "../components/Typography";
import { PrimaryButton } from "../components/Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";

/**
 * ExplorePage Component
 *
 * This component displays random playlists for the user to browse.
 * It implements infinite scrolling to load playlists in chunks of 6 for optimization.
 *
 * @returns {JSX.Element} The rendered ExplorePage component
 */
const ExplorePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const PLAYLISTS_PER_PAGE = 6; // Changed from 8 to 6
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo());
    }
  }, [user, userInfo, dispatch]);

  useEffect(() => {
    fetchRandomPlaylists(1, true);
  }, []);

  /**
   * Fetches random playlists from the backend API
   *
   * @async
   * @function fetchRandomPlaylists
   * @param {number} pageNum - The page number to fetch
   * @param {boolean} isInitial - Whether this is the initial fetch
   * @returns {Promise<void>}
   */
  const fetchRandomPlaylists = async (
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
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token) {
        setError("You must be logged in to explore playlists");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const response = await axios.get<UserPlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/explore/`,
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
      console.error("Random playlists fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);

        if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load explore playlists. Please try again.");
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
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    if (page > 1) {
      fetchRandomPlaylists(page);
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

  /**
   * Handles adding a newly created playlist to the list
   *
   * @param {any} newPlaylist - The newly created playlist data
   * @returns {void}
   */
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

  /**
   * Handles refreshing the explore page with new random playlists
   *
   * @returns {void}
   */
  const handleRefresh = (): void => {
    setPage(1);
    setPlaylists([]);
    fetchRandomPlaylists(1, true);
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
          <Header text="Explore Playlists" />
          <div className="flex gap-4">
            <PrimaryButton
              className="flex items-center gap-2"
              onClick={handleRefresh}
            >
              Refresh Playlists
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
            <Header text="No Playlists Available" />
            <p className="text-gray-500 mt-2">
              Check back later or create some playlists of your own!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-[50px]">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>

            <div
              ref={loadMoreRef}
              className="h-20 w-full flex justify-center items-center mt-8"
            >
              {isLoadingMore && (
                <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExplorePage;
