import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { VideoData, BACKEND_DOMAIN } from "../../types/playlists";

import { Card } from "../Container";
import { Header } from "../Typography";
import VideoPlayer from "./VideoPlayer";

import { MdDelete } from "react-icons/md";

/**
 * Props interface for the VideoCard component
 *
 * @interface VideoCardProps
 * @property {VideoData} video - The video data object to display
 * @property {boolean | null} isOwner - Flag indicating if the current user owns this video
 * @property {function} [onRemove] - Optional callback function when a video is removed, takes video ID as parameter
 */
interface VideoCardProps {
  video: VideoData;
  isOwner: boolean | null;
  onRemove?: (videoId: number) => void;
}

/**
 * Component for displaying a video in a card format with thumbnail and action buttons
 *
 * @component
 * @param {VideoCardProps} props - The component props
 * @param {VideoData} props.video - Video data to display
 * @param {boolean | null} props.isOwner - Whether the current user owns this video
 * @param {function} [props.onRemove] - Optional callback when video is removed
 * @returns {JSX.Element} The rendered VideoCard component
 */
const VideoCard: React.FC<VideoCardProps> = ({ video, isOwner, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  /**
   * Determines the URL for the video thumbnail based on available sources
   *
   * @returns {string} The URL for the video thumbnail
   */
  const getThumbnailUrl = (): string => {
    if (video.custom_thumbnail) {
      return `${BACKEND_DOMAIN}${video.custom_thumbnail}`;
    } else if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    return "";
  };

  /**
   * Handles the removal of a video after confirmation
   *
   * @param {React.MouseEvent} e - The click event
   * @returns {Promise<void>}
   */
  const handleRemoveVideo = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();

    if (!isOwner || !onRemove) return;

    if (window.confirm(`Are you sure you want to remove this video?`)) {
      onRemove(video.id);
    }
  };

  /**
   * Opens the video modal when card is clicked
   */
  const handleCardClick = (): void => {
    setIsModalOpen(true);
  };

  /**
   * Closes the video modal
   */
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  /**
   * Prevents card click event from triggering when link is clicked
   *
   * @param {React.MouseEvent} e - The click event
   */
  const handleLinkClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md text-left"
        onClick={handleCardClick}
      >
        <div className="w-full">
          <div className="h-60 mb-3 rounded flex items-center justify-center cursor-pointer relative group">
            {getThumbnailUrl() ? (
              <img
                src={getThumbnailUrl()}
                alt={video.title || "Video thumbnail"}
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <div className="text-gray-400 text-4xl">🎞️</div>
            )}
          </div>
        </div>
        <div className="p-2 w-full">
          <Header
            text={video.title || "Untitled"}
            className="font-semibold text-lg truncate w-full text-left"
          />
          <div className="flex justify-between items-center mt-2">
            <NavLink
              className="text-[#c549d4] hover:text-[#b23abc] font-medium"
              to={video.tiktok_url}
              onClick={handleLinkClick}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on TikTok
            </NavLink>
            {isOwner && (
              <button
                onClick={handleRemoveVideo}
                className="p-2 rounded-md text-white bg-[#c549d4] hover:bg-white hover:text-[#c549d4] cursor-pointer transition"
              >
                <MdDelete />
              </button>
            )}
          </div>
        </div>
      </Card>

      <VideoPlayer
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        video={video}
      />
    </>
  );
};

export default VideoCard;
