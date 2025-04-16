import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { RootState } from "../app/store.tsx";
import { getUserInfo } from "../features/auth/authSlice";

import NavBar from "../components/Navigation/NavBar.tsx";
import CarouselBar from "../components/Navigation/CarouselBar.tsx";
import NewPlaylist from "../components/Forms/NewPlaylist.tsx";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryIconButton } from "../components/Button/PrimaryIconButton.tsx";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";

const HomePage = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State for user's playlists
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylistData[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoadingUserPlaylists, setIsLoadingUserPlaylists] =
    useState<boolean>(true);
  const [isLoadingLikedPlaylists, setIsLoadingLikedPlaylists] =
    useState<boolean>(true);
  const [userPlaylistsError, setUserPlaylistsError] = useState<string | null>(
    null
  );
  const [likedPlaylistsError, setLikedPlaylistsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
      fetchLikedPlaylists();
    } else {
      setIsLoadingUserPlaylists(false);
      setIsLoadingLikedPlaylists(false);
    }
  }, [user]);

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
          setUserPlaylistsError(
            "Your session has expired. Please log in again."
          );
        } else {
          setUserPlaylistsError("Failed to load your playlists.");
        }
      } else {
        setUserPlaylistsError("Network error. Please check your connection.");
      }
    }
  };

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
          setLikedPlaylistsError(
            "Your session has expired. Please log in again."
          );
        } else {
          setLikedPlaylistsError("Failed to load liked playlists.");
        }
      } else {
        setLikedPlaylistsError("Network error. Please check your connection.");
      }
    }
  };

  const handlePlaylistCreated = (playlist: any) => {
    console.log("New playlist created:", playlist);
    // Add the new playlist to userPlaylists
    setUserPlaylists([playlist, ...userPlaylists]);
  };

  const handlePlaylistDeleted = (playlistId: number): void => {
    // Remove deleted playlist from state
    setUserPlaylists(
      userPlaylists.filter((playlist) => playlist.id !== playlistId)
    );
  };

  const handlePlaylistUnliked = (playlistId: number): void => {
    // Remove unliked playlist from liked playlists state
    setLikedPlaylists(
      likedPlaylists.filter((playlist) => playlist.id !== playlistId)
    );
  };

  // Render playlist cards for carousel
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

    if (userPlaylists.length === 0) {
      return (
        <div className="mx-[50px] text-center py-8 bg-gray-50 rounded-lg">
          <SecondaryText
            text="Create your first playlist to get started!"
            className="text-gray-400"
          />
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {userPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard
              playlist={playlist}
              onDelete={handlePlaylistDeleted}
            />
          </div>
        ))}
      </div>
    );
  };

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

    if (likedPlaylists.length === 0) {
      return (
        <div className="mx-[50px] text-center py-8 bg-gray-50 rounded-lg">
          <SecondaryText
            text="Like playlists to see them here!"
            className="text-gray-400"
          />
        </div>
      );
    }

    return (
      <div className="flex space-x-6 mx-[50px] overflow-x-auto pb-4">
        {likedPlaylists.map((playlist) => (
          <div key={playlist.id} className="min-w-[250px]">
            <PlaylistCard
              playlist={playlist}
              onUnlike={handlePlaylistUnliked}
              isLiked={true}
            />
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

      <div className="relative h-80 bg-gradient-to-r from-[#c549d4] to-[#9b36b7] overflow-hidden flex items-center">
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

      {/* Your Playlists Section */}
      <CarouselBar title="Your Playlists" totalItems={userPlaylists.length}>
        {renderUserPlaylists()}
      </CarouselBar>

      {/* Your Liked Playlists Section */}
      <CarouselBar
        title="Your Liked Playlists"
        totalItems={likedPlaylists.length}
      >
        {renderLikedPlaylists()}
      </CarouselBar>

      {/* Keep the other carousel sections */}
      <CarouselBar title="Trending Now" totalItems={0} />
      <CarouselBar title="Popular Playlists" totalItems={0} />
      <CarouselBar title="Recommended Playlists" totalItems={0} />
      <CarouselBar title="Recent Playlists" totalItems={0} />
    </>
  );
};

export default HomePage;
