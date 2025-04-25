import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useState, useEffect } from "react";
import { PlaylistData, BACKEND_DOMAIN } from "../../types/playlists";

import UserPlaylists from "../Playlists/UserPlaylists";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

type UserProfileProps = {
  username: string;
};

type UserData = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
};

const UserProfile = ({ username }: UserProfileProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState<UserData | null>(null);

  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  useEffect(() => {
    if (user && username) {
      fetchUserProfile();
    }
  }, [user, username]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      // Get profile information for the user
      const profileResponse = await axios.get<UserData>(
        `${BACKEND_DOMAIN}/api/v1/users/profile/${username}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfileData(profileResponse.data);

      // Get playlists by user
      const playlistsResponse = await axios.get<PlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/user/${profileResponse.data.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPlaylistsCount(playlistsResponse.data.length);

      // Get liked playlists by user
      const likedPlaylistsResponse = await axios.get<PlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/liked_by/${profileResponse.data.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLikesCount(likedPlaylistsResponse.data.length);

      // Get followers
      const followersResponse = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/follows/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const followers = followersResponse.data.filter(
        (follow: any) => follow.followed === profileResponse.data.id
      );
      setFollowersCount(followers.length);

      // Check if current user is following this profile
      const currentUserId = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      ).id;
      const isCurrentlyFollowing = followersResponse.data.some(
        (follow: any) =>
          follow.follower === currentUserId &&
          follow.followed === profileResponse.data.id
      );
      setIsFollowing(isCurrentlyFollowing);

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile");
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token =
        user?.access || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null;

      if (!token || !profileData) return;

      if (isFollowing) {
        // Unfollow user
        await axios.delete(
          `${BACKEND_DOMAIN}/api/v1/follows/${profileData.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Follow user
        await axios.post(
          `${BACKEND_DOMAIN}/api/v1/follows/`,
          { followed: profileData.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Update follow status and counts
      fetchUserProfile();
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
        User profile not found
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {/* Profile image */}
        <div className="relative">
          <div className="h-32 w-32 rounded-full bg-gray-800 overflow-hidden border-4 border-[#2a2a2d] shadow-md">
            <img
              src={
                profileData.profile_picture
                  ? `${BACKEND_DOMAIN}${profileData.profile_picture}`
                  : defaultProfileImage
              }
              alt={`${profileData.first_name || "User"} ${
                profileData.last_name || ""
              }`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultProfileImage;
              }}
            />
          </div>
        </div>

        {/* User info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl font-bold text-white">
              {profileData.first_name} {profileData.last_name}
            </h1>
            <p className="text-lg text-gray-400">@{profileData.username}</p>

            {/* Follow button */}
            <button
              onClick={handleFollowToggle}
              className={`mt-3 px-4 py-2 rounded-md transition ${
                isFollowing
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-[#c549d4] hover:bg-[#9b36b7] text-white"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-semibold text-white">
                {followersCount}
              </p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white">{likesCount}</p>
              <p className="text-sm text-gray-400">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white">
                {playlistsCount}
              </p>
              <p className="text-sm text-gray-400">Playlists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-400 my-6"></div>

      {/* Account content summary */}
      <div className="border-t border-gray-400 pt-6 mt-6">
        <UserPlaylists username={username} />
      </div>

      {error && (
        <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
