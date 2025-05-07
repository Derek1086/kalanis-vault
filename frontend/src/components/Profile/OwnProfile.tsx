import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PlaylistData, BACKEND_DOMAIN } from "../../types/playlists";

import EditProfile from "../Forms/EditProfile";
import { PrimaryButton } from "../Button";
import UserPlaylists from "../Playlists/UserPlaylists";

import { CiAt, CiLock } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

/**
 * Props for the OwnProfile component
 * @typedef {Object} OwnProfileProps
 * @property {string} username - The username of the current user
 * @property {Object} userInfo - The user information object from Redux state
 * @property {string} accessToken - The JWT access token for API calls
 */
type OwnProfileProps = {
  username: string;
  userInfo: any;
  accessToken: string;
};

/**
 * @typedef {Object} FollowStatusData
 * @property {boolean} is_following - Whether the current user is following the profile user
 * @property {number} follower_count - The number of followers the profile user has
 */
type FollowStatusData = {
  is_following: boolean;
  follower_count: number;
};

/**
 * OwnProfile component for displaying the logged-in user's profile
 * Includes personal information, statistics, and user's playlists
 *
 * @param {OwnProfileProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const OwnProfile = ({ username, userInfo, accessToken }: OwnProfileProps) => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  const [profile, setProfile] = useState({
    firstName: userInfo?.first_name || "Jane",
    lastName: userInfo?.last_name || "Doe",
    username: userInfo?.username || "janedoe",
    email: userInfo?.email || "jane.doe@example.com",
    profileImage: defaultProfileImage,
  });

  /**
   * Effect to fetch user data when the component mounts
   */
  useEffect(() => {
    if (accessToken) {
      fetchUserData();
    }
  }, [accessToken]);

  /**
   * Effect to update local profile state when userInfo changes
   */
  useEffect(() => {
    if (userInfo) {
      setProfile((prev) => ({
        ...prev,
        firstName: userInfo.first_name || prev.firstName,
        lastName: userInfo.last_name || prev.lastName,
        username: userInfo.username || prev.username,
        email: userInfo.email || prev.email,
        profileImage: userInfo.profile_picture
          ? `${BACKEND_DOMAIN}${userInfo.profile_picture}`
          : defaultProfileImage,
      }));
    }
  }, [userInfo]);

  /**
   * Fetches all user-related data including playlists, likes, and followers
   * Updates state with counts and handles loading/error states
   *
   * @async
   * @returns {Promise<void>}
   */
  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      let requestsSuccessful = true;

      try {
        const playlistsResponse = await axios.get<PlaylistData[]>(
          `${BACKEND_DOMAIN}/api/v1/playlists/my_playlists/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setPlaylistsCount(playlistsResponse.data.length);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        requestsSuccessful = false;
      }

      try {
        const likedPlaylistsResponse = await axios.get<PlaylistData[]>(
          `${BACKEND_DOMAIN}/api/v1/playlists/liked_playlists/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setLikesCount(likedPlaylistsResponse.data.length);
      } catch (err) {
        console.error("Error fetching liked playlists:", err);
        requestsSuccessful = false;
      }

      try {
        if (userInfo && userInfo.id) {
          const followStatusResponse = await axios.get<FollowStatusData>(
            `${BACKEND_DOMAIN}/api/v1/users/follow-status/${userInfo.id}/`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setFollowersCount(followStatusResponse.data.follower_count);
        } else {
          console.error("User ID not available for follow status check");
          requestsSuccessful = false;
        }
      } catch (err) {
        console.error("Error fetching followers:", err);
        requestsSuccessful = false;
      }

      setIsLoading(false);

      if (!requestsSuccessful) {
        setError("Some user data could not be loaded");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching data:", err);
      setError("Failed to load user data");
    }
  };

  /**
   * Opens the profile editing modal
   */
  const handleEditToggle = () => {
    setIsEditing(true);
  };

  /**
   * Callback handler for when profile is updated
   * Refreshes user data to reflect changes
   */
  const handleProfileUpdated = () => {
    fetchUserData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          {/* Profile image */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-gray-800 overflow-hidden border-4 border-[#2a2a2d] shadow-md">
              <img
                src={profile.profileImage}
                alt={`${userInfo?.first_name || "User"} ${
                  userInfo?.last_name || ""
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
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold text-white">
                {userInfo?.first_name} {userInfo?.last_name}
              </h1>
              <button
                onClick={handleEditToggle}
                className="p-2 rounded-md text-white bg-[#c549d4] hover:bg-white hover:text-[#c549d4] cursor-pointer transition"
              >
                <MdEdit />
              </button>
            </div>

            <p className="text-lg text-gray-400">@{userInfo?.username}</p>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {followersCount}
                </p>
                <p className="text-sm text-gray-400">
                  {followersCount === 1 ? "Follower" : "Followers"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white">{likesCount}</p>
                <p className="text-sm text-gray-400">
                  {likesCount === 1 ? "Like" : "Likes"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {playlistsCount}
                </p>
                <p className="text-sm text-gray-400">
                  {playlistsCount === 1 ? "Playlist" : "Playlists"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-400 my-6"></div>

        {/* Details section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Account Details
          </h2>

          {/* Email */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-full md:w-1/3">
              <div className="flex items-center gap-2 text-gray-300">
                <CiAt className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Email</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <p className="text-white">{userInfo?.email}</p>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-full md:w-1/3">
              <div className="flex items-center gap-2 text-gray-300">
                <CiLock className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Password</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="w-1/3">
                <PrimaryButton
                  type="button"
                  onClick={() => navigate("/reset-password")}
                >
                  Reset Password
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Account content summary */}
          <div className="border-t border-gray-400 pt-6">
            <UserPlaylists username={userInfo?.username || username} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
          {error}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onProfileUpdated={handleProfileUpdated}
        currentProfile={profile}
      />
    </>
  );
};

export default OwnProfile;
