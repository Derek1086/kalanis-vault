import React from "react";
import { Link } from "react-router-dom";
import { UserPlaylistData, BACKEND_DOMAIN } from "../../types/playlists.ts";

import { Card } from "../Container";
import { Header, Subtitle } from "../Typography";

/**
 * Props interface for the PlaylistCard component
 *
 * @interface PlaylistCardProps
 * @property {UserPlaylistData} playlist - The playlist data object to be displayed
 */
interface PlaylistCardProps {
  playlist: UserPlaylistData;
}

/**
 * Component for displaying a playlist in a card format with cover image and details
 *
 * @component
 * @param {PlaylistCardProps} props - The component props
 * @param {UserPlaylistData} props.playlist - Playlist data to display
 * @returns {JSX.Element} The rendered PlaylistCard component
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
