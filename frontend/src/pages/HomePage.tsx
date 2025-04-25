import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../app/store.tsx";
import { getUserInfo } from "../features/auth/authSlice";
import { AppDispatch } from "../app/store.tsx";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

import NavBar from "../components/Navigation/NavBar.tsx";
import CarouselBar from "../components/Navigation/CarouselBar.tsx";
import NewPlaylist from "../components/Forms/NewPlaylist.tsx";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryIconButton } from "../components/Button/PrimaryIconButton.tsx";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";

/**
 * HomePage Component
 *
 * Displays the main dashboard for authenticated users.
 * Includes sections for user playlists, liked playlists, and other recommended sections.
 * Also provides the ability to create new playlists.
 *
 * @component
 */
const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [userPlaylists, setUserPlaylists] = useState<UserPlaylistData[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<UserPlaylistData[]>([]);
  const [popularPlaylists, setPopularPlaylists] = useState<UserPlaylistData[]>(
    []
  );
  const [isLoadingUserPlaylists, setIsLoadingUserPlaylists] =
    useState<boolean>(true);
  const [isLoadingLikedPlaylists, setIsLoadingLikedPlaylists] =
    useState<boolean>(true);
  const [isLoadingPopularPlaylists, setIsLoadingPopularPlaylists] =
    useState<boolean>(true);
  const [userPlaylistsError, setUserPlaylistsError] = useState<string | null>(
    null
  );
  const [likedPlaylistsError, setLikedPlaylistsError] = useState<string | null>(
    null
  );
  const [popularPlaylistsError, setPopularPlaylistsError] = useState<
    string | null
  >(null);
  const [recentPlaylists, setRecentPlaylists] = useState<UserPlaylistData[]>(
    []
  );
  const [isLoadingRecentPlaylists, setIsLoadingRecentPlaylists] =
    useState<boolean>(true);
  const [recentPlaylistsError, setRecentPlaylistsError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo());
    }
  }, [user, userInfo, dispatch]);

  /**
   * Fetches user-created, liked, and popular playlists on component mount or user login state change.
   */
  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
      fetchLikedPlaylists();
      fetchRecentPlaylists();
    } else {
      setIsLoadingUserPlaylists(false);
      setIsLoadingLikedPlaylists(false);
      setIsLoadingRecentPlaylists(false);
    }
    fetchPopularPlaylists();
  }, [user]);

  /**
   * Fetches playlists created by the logged-in user.
   * Handles token authentication and sets appropriate loading/error states.
   */
  const fetchUserPlaylists = async (): Promise<void> => {
    setIsLoadingUserPlaylists(true);
    setUserPlaylistsError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setUserPlaylistsError("You must be logged in to view your playlists");
        setIsLoadingUserPlaylists(false);
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

      setUserPlaylists(response.data);
      setIsLoadingUserPlaylists(false);
    } catch (err) {
      setIsLoadingUserPlaylists(false);
      console.error("User playlists fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        } else {
          setUserPlaylistsError("Failed to load your playlists.");
        }
      } else {
        setUserPlaylistsError("Network error. Please check your connection.");
      }
    }
  };

  /**
   * Fetches playlists liked by the logged-in user.
   * Handles token authentication and sets appropriate loading/error states.
   */
  const fetchLikedPlaylists = async (): Promise<void> => {
    setIsLoadingLikedPlaylists(true);
    setLikedPlaylistsError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setLikedPlaylistsError("You must be logged in to view liked playlists");
        setIsLoadingLikedPlaylists(false);
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

      setLikedPlaylists(response.data);
      setIsLoadingLikedPlaylists(false);
    } catch (err) {
      setIsLoadingLikedPlaylists(false);
      console.error("Liked playlists fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        } else {
          setLikedPlaylistsError("Failed to load liked playlists.");
        }
      } else {
        setLikedPlaylistsError("Network error. Please check your connection.");
      }
    }
  };

  /**
   * Fetches popular playlists based on view count.
   * Gets the top 10 most viewed public playlists.
   */
  const fetchPopularPlaylists = async (): Promise<void> => {
    setIsLoadingPopularPlaylists(true);
    setPopularPlaylistsError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<UserPlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/popular/`,
        { headers }
      );

      setPopularPlaylists(response.data);
      setIsLoadingPopularPlaylists(false);
    } catch (err) {
      setIsLoadingPopularPlaylists(false);
      console.error("Popular playlists fetch error:", err);

      if (axios.isAxiosError(err)) {
        setPopularPlaylistsError("Failed to load popular playlists.");
      } else {
        setPopularPlaylistsError(
          "Network error. Please check your connection."
        );
      }
    }
  };

  const fetchRecentPlaylists = async (): Promise<void> => {
    setIsLoadingRecentPlaylists(true);
    setRecentPlaylistsError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      if (!token) {
        setRecentPlaylistsError(
          "You must be logged in to view recent playlists"
        );
        setIsLoadingRecentPlaylists(false);
        return;
      }

      const response = await axios.get<UserPlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/recent_playlists/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentPlaylists(response.data);
      setIsLoadingRecentPlaylists(false);
    } catch (err) {
      setIsLoadingRecentPlaylists(false);
      console.error("Recent playlists fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        } else {
          setRecentPlaylistsError("Failed to load recent playlists.");
        }
      } else {
        setRecentPlaylistsError("Network error. Please check your connection.");
      }
    }
  };

  /**
   * Callback when a new playlist is successfully created.
   * Adds the new playlist to the top of the user's playlist list.
   *
   * @param {UserPlaylistData} playlist - The newly created playlist
   */
  const handlePlaylistCreated = (playlist: UserPlaylistData) => {
    console.log("New playlist created:", playlist);
    setUserPlaylists([playlist, ...userPlaylists]);
  };

  /**
   * Renders the user's playlists section, including loading and error handling.
   */
  const renderUserPlaylists = () => {
    if (isLoadingUserPlaylists) {
      return (
        <div className="flex justify-center items-center h-64">
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (userPlaylistsError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-[50px] flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{userPlaylistsError}</span>
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {userPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </div>
    );
  };

  /**
   * Renders the user's liked playlists section, including loading and error handling.
   */
  const renderLikedPlaylists = () => {
    if (isLoadingLikedPlaylists) {
      return (
        <div className="flex justify-center items-center h-64">
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (likedPlaylistsError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-[50px] flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{likedPlaylistsError}</span>
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {likedPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </div>
    );
  };

  /**
   * Renders the popular playlists section, including loading and error handling.
   */
  const renderPopularPlaylists = () => {
    if (isLoadingPopularPlaylists) {
      return (
        <div className="flex justify-center items-center h-64">
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (popularPlaylistsError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-[50px] flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{popularPlaylistsError}</span>
        </div>
      );
    }

    if (popularPlaylists.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-500 mx-[50px]">
          No popular playlists found
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {popularPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </div>
    );
  };

  const renderRecentPlaylists = () => {
    if (isLoadingRecentPlaylists) {
      return (
        <div className="flex justify-center items-center h-64">
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (recentPlaylistsError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-[50px] flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{recentPlaylistsError}</span>
        </div>
      );
    }

    if (recentPlaylists.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-500 mx-[50px]">
          No recently viewed playlists
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {recentPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <NavBar onCreatePlaylist={() => setIsModalOpen(true)} />

      <NewPlaylist
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <div className="relative h-60 bg-gradient-to-r from-[#c549d4] to-[#9b36b7] overflow-hidden flex items-center">
        <div className="max-w-2xl text-white mx-[75px]">
          <Header text="Create, Collect, Share" className="text-4xl mb-2" />
          <SecondaryText
            text="Build custom playlists from your favorite online videos."
            className="text-xl mb-4"
          />
          <div className="w-3/4">
            <PrimaryIconButton
              type="button"
              icon={<CiCirclePlus className="h-7 w-7" />}
              className="bg-white text-[#c549d4] hover:bg-[#c549d4] hover:text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Create New Playlist
            </PrimaryIconButton>
          </div>
        </div>
      </div>

      {userPlaylists.length > 0 && (
        <CarouselBar title="Your Playlists" totalItems={userPlaylists.length}>
          {renderUserPlaylists()}
        </CarouselBar>
      )}
      {likedPlaylists.length > 0 && (
        <CarouselBar
          title="Your Liked Playlists"
          totalItems={likedPlaylists.length}
        >
          {renderLikedPlaylists()}
        </CarouselBar>
      )}

      {recentPlaylists.length > 0 && (
        <CarouselBar
          title="Recent Playlists"
          totalItems={recentPlaylists.length}
        >
          {renderRecentPlaylists()}
        </CarouselBar>
      )}

      {popularPlaylists.length > 0 && (
        <CarouselBar
          title="Popular Playlists"
          totalItems={popularPlaylists.length}
        >
          {renderPopularPlaylists()}
        </CarouselBar>
      )}

      <CarouselBar title="Recommended Playlists" totalItems={0} />
    </>
  );
};

export default HomePage;
