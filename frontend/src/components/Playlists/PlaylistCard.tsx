import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../Container";
import { Header, Subtitle } from "../Typography";
import { UserPlaylistData, BACKEND_DOMAIN } from "../../types/playlists.ts";

interface PlaylistCardProps {
  playlist: UserPlaylistData;
}

/**
 * PlaylistCard component renders a clickable card linking to a playlist's detail page.
 * It displays the cover image (or a fallback icon), playlist title, owner username,
 * and video count.
 *
 * @component
 * @param {UserPlaylistData} props.playlist - The playlist object containing title, user info, image, and video count
 * @returns {JSX.Element} A styled card with playlist information and navigation
 */
const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link
      to={`/${playlist.user.username}/playlists/${playlist.id}`}
      className="block"
    >
      <Card className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md text-left">
        <div className="h-48 bg-gray-200 w-full">
          {playlist.cover_image ? (
            <img
              src={
                playlist.cover_image.startsWith("http")
                  ? playlist.cover_image
                  : `${BACKEND_DOMAIN}${playlist.cover_image}`
              }
              alt={playlist.title}
              className="w-full h-full object-cover rounded-none bg-transparent"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
              🎵
            </div>
          )}
        </div>
        <div className="p-2 w-full">
          <Header
            text={playlist.title}
            className="font-semibold text-lg truncate w-full text-left"
          />
          <Subtitle
            text={`${playlist.user.username} • ${playlist.video_count} ${
              playlist.video_count === 1 ? "video" : "videos"
            }`}
            className="text-sm w-full text-left"
          />
        </div>
      </Card>
    </Link>
  );
};

export default PlaylistCard;
