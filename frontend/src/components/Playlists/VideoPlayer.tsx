import React from "react";
import { Modal } from "../Container";
import { VideoData } from "../../types/playlists";

/**
 * @interface VideoPlayerProps
 * @description Props for the VideoPlayer component
 * @property {boolean} isOpen - Controls whether the modal is displayed
 * @property {() => void} onClose - Function to call when closing the modal
 * @property {VideoData} video - Video data containing TikTok information
 */
interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoData;
}

/**
 * VideoPlayer component displays a TikTok video in a modal dialog
 *
 * @component
 * @param {VideoPlayerProps} props - Component props
 * @param {boolean} props.isOpen - Controls whether the modal is displayed
 * @param {() => void} props.onClose - Function to call when closing the modal
 * @param {VideoData} props.video - Video data containing TikTok information
 * @returns {React.ReactElement} The rendered component
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  /**
   * Renders the TikTok embed code using the video data
   *
   * @function renderTikTokEmbed
   * @returns {React.ReactElement} TikTok embed JSX
   */
  const renderTikTokEmbed = () => {
    const tiktokId =
      video.tiktok_id ||
      video.tiktok_url?.split("/").pop()?.split("?")[0] ||
      "";

    return (
      <div className="tiktok-embed-wrapper">
        <blockquote
          className="tiktok-embed"
          cite={video.tiktok_url}
          data-video-id={tiktokId}
          style={{ maxWidth: "100%" }}
        >
          <section>
            {video.title && <p>{video.title}</p>}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                video.tiktok_url || `https://www.tiktok.com/video/${tiktokId}`
              }
            >
              {video.title || "Watch on TikTok"}
            </a>
          </section>
        </blockquote>

        <script async src="https://www.tiktok.com/embed.js"></script>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={video.title || "Video Player"}
      description=""
      minWidth="min-w-lg"
    >
      <div className="w-full">{renderTikTokEmbed()}</div>
    </Modal>
  );
};

export default VideoPlayer;
