import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../app/store";
import { Card } from "../Container";
import { PrimaryButton, SecondaryButton } from "../Button";
import { SecondaryText } from "../Typography";
import { VideoData, BACKEND_DOMAIN } from "../../types/playlists";
import { toast } from "react-toastify";

interface VideoCardProps {
  video: VideoData;
  isOwner: boolean | null;
  onRemove?: (videoId: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isOwner, onRemove }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  // Function to safely get thumbnail URL
  const getThumbnailUrl = (): string => {
    if (video.custom_thumbnail) {
      return `${BACKEND_DOMAIN}${video.custom_thumbnail}`;
    } else if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    return ""; // Return empty string as fallback
  };

  const getAuthToken = (): string | null => {
    // First try from Redux state
    if (user?.access) {
      return user.access;
    }

    // Then fallback to localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.access || null;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }

    return null;
  };

  const handleRemoveVideo = async (): Promise<void> => {
    if (!isOwner || !onRemove) return;

    if (window.confirm(`Are you sure you want to remove this video?`)) {
      setIsRemoving(true);

      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("You need to be logged in to remove videos", {
            theme: "dark",
          });
          return;
        }

        await axios.delete(`${BACKEND_DOMAIN}/api/v1/videos/${video.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Video removed successfully", {
          theme: "dark",
        });

        // Call the callback function
        onRemove(video.id);
      } catch (err) {
        console.error("Error removing video:", err);
        toast.error("Failed to remove video", {
          theme: "dark",
        });
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handlePlayVideo = (): void => {
    setIsPlaying(true);
  };

  const renderTikTokEmbed = () => {
    // Extract TikTok ID from URL if needed
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

        {/* Load TikTok embed script when needed */}
        <script async src="https://www.tiktok.com/embed.js"></script>
      </div>
    );
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      {!isPlaying ? (
        <div
          className="h-56 mb-3 bg-gray-200 rounded flex items-center justify-center cursor-pointer relative group"
          onClick={handlePlayVideo}
        >
          {getThumbnailUrl() ? (
            <>
              <img
                src={getThumbnailUrl()}
                alt={video.title || "Video thumbnail"}
                className="object-cover w-full h-full rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-4xl">🎞️</div>
          )}
        </div>
      ) : (
        <div className="mb-3">{renderTikTokEmbed()}</div>
      )}

      <h3 className="font-semibold text-lg truncate">
        {video.title || "Untitled Video"}
      </h3>
      <SecondaryText
        text={`TikTok ID: ${video.tiktok_id}`}
        className="text-gray-500 text-sm mt-1"
      />

      <div className="flex justify-between items-center mt-4">
        <a
          href={video.tiktok_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          View on TikTok
        </a>

        <div className="flex space-x-2">
          {isPlaying && (
            <SecondaryButton
              onClick={() => setIsPlaying(false)}
              className="text-sm px-3 py-1"
            >
              Hide Player
            </SecondaryButton>
          )}

          {!isPlaying && (
            <PrimaryButton
              onClick={handlePlayVideo}
              className="text-sm px-3 py-1"
            >
              Play Video
            </PrimaryButton>
          )}
        </div>
      </div>

      {isOwner && (
        <PrimaryButton
          onClick={handleRemoveVideo}
          className="text-sm w-full mt-3 bg-red-600 hover:bg-red-700"
          disabled={isRemoving}
        >
          {isRemoving ? "Removing..." : "Remove Video"}
        </PrimaryButton>
      )}
    </Card>
  );
};

export default VideoCard;
