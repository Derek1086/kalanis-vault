import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../app/store";
import { VideoData, BACKEND_DOMAIN } from "../../types/playlists";

import { Card } from "../Container";
import { Header, Subtitle } from "../Typography";
import { PrimaryButton, SecondaryButton } from "../Button";
import { SecondaryText } from "../Typography";

interface VideoCardProps {
  video: VideoData;
  isOwner: boolean | null;
  onRemove?: (videoId: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isOwner, onRemove }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const getThumbnailUrl = (): string => {
    if (video.custom_thumbnail) {
      return `${BACKEND_DOMAIN}${video.custom_thumbnail}`;
    } else if (video.thumbnail_url) {
      console.log(video.thumbnail_url);
      return video.thumbnail_url;
    }
    return "";
  };

  const getAuthToken = (): string | null => {
    if (user?.access) {
      return user.access;
    }

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
    <Card
      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md text-left"
      onClick={handlePlayVideo}
    >
      <div className="w-full">
        {!isPlaying ? (
          <div
            className="h-60 mb-3 rounded flex items-center justify-center cursor-pointer relative group"
            onClick={handlePlayVideo}
          >
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
        ) : (
          <div className="mb-3">{renderTikTokEmbed()}</div>
        )}
      </div>
      <div className="p-2 w-full">
        <Header
          text={video.title || "Untitled"}
          className="font-semibold text-lg truncate w-full text-left"
        />
        <Subtitle
          text={`TikTok ID: ${video.tiktok_id}`}
          className="text-sm w-full text-left"
        />
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
    //   <div className="flex justify-between items-center mt-4">
    //     <a
    //       href={video.tiktok_url}
    //       target="_blank"
    //       rel="noopener noreferrer"
    //       className="text-indigo-600 hover:text-indigo-800 text-sm"
    //     >
    //       View on TikTok
    //     </a>

    //     <div className="flex space-x-2">
    //       {isPlaying && (
    //         <SecondaryButton
    //           onClick={() => setIsPlaying(false)}
    //           className="text-sm px-3 py-1"
    //         >
    //           Hide Player
    //         </SecondaryButton>
    //       )}

    //       {!isPlaying && (
    //         <PrimaryButton
    //           onClick={handlePlayVideo}
    //           className="text-sm px-3 py-1"
    //         >
    //           Play Video
    //         </PrimaryButton>
    //       )}
    //     </div>
    //   </div>
    // </Card>
  );
};

export default VideoCard;
