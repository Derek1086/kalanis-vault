import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store.tsx";
import { getUserInfo } from "../features/auth/authSlice";

import NavBar from "../components/Navigation/NavBar.tsx";
import CarouselBar from "../components/Navigation/CarouselBar.tsx";
import NewPlaylist from "../components/Forms/NewPlaylist.tsx";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryIconButton } from "../components/Button/PrimaryIconButton.tsx";

import { CiCirclePlus } from "react-icons/ci";

/**
 * HomePage Component
 * Main entry point for the application that handles social media link embedding
 * Supports TikTok and Instagram URL detection and embedding (TikTok only implemented)
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

  const handlePlaylistCreated = (playlist: any) => {
    console.log("New playlist created:", playlist);
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
      {/* <CarouselBar title="Your Playlists" totalItems={yourPlaylists.length} />
      <CarouselBar title="Trending Now" totalItems={trendingVideos.length} />
      <CarouselBar title="Popular Playlists" totalItems={popularPlaylists.length} />
      <CarouselBar title="Recommended Playlists" totalItems={recommendedPlaylists.length} />
      <CarouselBar title="Your Liked Playlists" totalItems={likedPlaylists.length} />
      <CarouselBar title="Recent Playlists" totalItems={recentPlaylists.length} /> */}
      <CarouselBar title="Your Playlists" totalItems={0} />
      <CarouselBar title="Trending Now" totalItems={0} />
      <CarouselBar title="Popular Playlists" totalItems={0} />
      <CarouselBar title="Recommended Playlists" totalItems={0} />
      <CarouselBar title="Your Liked Playlists" totalItems={0} />
      <CarouselBar title="Recent Playlists" totalItems={0} />
    </>
  );
};

export default HomePage;
