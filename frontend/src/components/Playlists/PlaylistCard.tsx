import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../Container";
import { SecondaryText } from "../Typography";
import { UserPlaylistData, BACKEND_DOMAIN } from "../../types/playlists.ts";
import { toast } from "react-toastify";

interface PlaylistCardProps {
  playlist: UserPlaylistData;
  onDelete?: (playlistId: number) => void;
  onUnlike?: (playlistId: number) => void;
  isLiked?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onDelete,
  onUnlike,
  isLiked = false,
}) => {
  const navigate = useNavigate();
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);

  const getAuthToken = (): string | null => {
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

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isActionInProgress) return;

    if (
      window.confirm(`Are you sure you want to delete "${playlist.title}"?`)
    ) {
      setIsActionInProgress(true);

      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("You need to be logged in to delete playlists", {
            theme: "dark",
          });
          navigate("/login");
          return;
        }

        await axios.delete(
          `${BACKEND_DOMAIN}/api/v1/playlists/${playlist.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`Deleted "${playlist.title}"`, {
          theme: "dark",
        });

        if (onDelete) {
          onDelete(playlist.id);
        }
      } catch (error) {
        console.error("Error deleting playlist:", error);
        toast.error("Failed to delete playlist", {
          theme: "dark",
        });
      } finally {
        setIsActionInProgress(false);
      }
    }
  };

  const handleUnlike = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isActionInProgress) return;
    setIsActionInProgress(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("You need to be logged in to unlike playlists", {
          theme: "dark",
        });
        navigate("/login");
        return;
      }

      await axios.post(
        `${BACKEND_DOMAIN}/api/v1/playlists/${playlist.id}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Unliked "${playlist.title}"`, {
        theme: "dark",
      });

      if (onUnlike) {
        onUnlike(playlist.id);
      }
    } catch (error) {
      console.error("Error unliking playlist:", error);
      toast.error("Failed to unlike playlist", {
        theme: "dark",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  return (
    <Link to={`/${playlist.user.username}/playlists/${playlist.id}`}>
      <Card className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md">
        <div className="h-48 bg-gray-200">
          {playlist.cover_image ? (
            <img
              src={
                playlist.cover_image.startsWith("http")
                  ? playlist.cover_image
                  : `${BACKEND_DOMAIN}${playlist.cover_image}`
              }
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
              🎵
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">
            {playlist.title}
          </h3>
          <SecondaryText
            text={`by ${playlist.user.username}`}
            className="mb-2 text-xs"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{playlist.video_count} videos</span>
            <div className="flex space-x-3">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                  disabled={isActionInProgress}
                >
                  Delete
                </button>
              )}
              {isLiked && onUnlike && (
                <button
                  onClick={handleUnlike}
                  className="text-pink-500 hover:text-pink-700"
                  disabled={isActionInProgress}
                >
                  Unlike
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PlaylistCard;
