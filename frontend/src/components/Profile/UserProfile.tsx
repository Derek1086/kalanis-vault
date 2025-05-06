import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useState, useEffect } from "react";
import { PlaylistData, BACKEND_DOMAIN } from "../../types/playlists";

import UserPlaylists from "../Playlists/UserPlaylists";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

/**
 * @typedef {Object} UserProfileProps
 * @property {string} username - The username of the profile to display
 */
type UserProfileProps = {
  username: string;
};

/**
 * @typedef {Object} UserData
 * @property {number} id - The user's unique identifier
 * @property {string} username - The user's username
 * @property {string} first_name - The user's first name
 * @property {string} last_name - The user's last name
 * @property {string} email - The user's email address
 * @property {string|null} profile_picture - URL to the user's profile picture or null if not set
 */
type UserData = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
};

/**
 * Component that displays a user profile with their information, stats, and playlists.
 * Allows following/unfollowing the user if logged in.
 *
 * @param {UserProfileProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
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

  /**
   * Retrieves the authentication token from user state or localStorage
   * @returns {string|null} The authentication token or null if not available
   */
  const getAuthToken = () => {
    if (user?.access) {
      return user.access;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.access;
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }

    return null;
  };

  /**
   * Effect hook to fetch user profile data when component mounts or username changes
   */
  useEffect(() => {
    if (username) {
      fetchUserProfile();
    } else {
      console.error("No username provided to UserProfile component");
      setError("Username is required");
      setIsLoading(false);
    }
  }, [username]);

  /**
   * Fetches all profile data including personal info, playlists, followers, and likes
   * Also determines if the current user is following this profile
   *
   * @async
   * @returns {Promise<void>}
   */
  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      if (!token) {
        console.warn("No authentication token found");
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        const userApiUrl = `${BACKEND_DOMAIN}/api/v1/users/by-username/${username}/`;

        const userResponse = await axios.get(userApiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.data) {
          setProfileData(userResponse.data);
          const userId = userResponse.data.id;

          try {
            const playlistsResponse = await axios.get<PlaylistData[]>(
              `${BACKEND_DOMAIN}/api/v1/playlists/`,
              {
                params: { user: userId },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setPlaylistsCount(playlistsResponse.data.length);
          } catch (playlistErr: any) {
            console.error("Error fetching playlists:", playlistErr);
            console.error("Response data:", playlistErr.response?.data);
          }

          try {
            const likedPlaylistsResponse = await axios.get<PlaylistData[]>(
              `${BACKEND_DOMAIN}/api/v1/playlists/liked_playlists/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                params: { user_id: userId },
              }
            );
            setLikesCount(likedPlaylistsResponse.data.length);
          } catch (likesErr: any) {
            console.error("Error fetching liked playlists:", likesErr);
            console.error("Response data:", likesErr.response?.data);
          }

          setIsLoading(false);
        } else {
          throw new Error("Invalid user data received");
        }
      } catch (userErr: any) {
        console.error("Error fetching user profile:", userErr);
        if (userErr.response) {
          console.error("Response status:", userErr.response.status);
          console.error("Response data:", userErr.response.data);

          setError(`User profile not found (${userErr.response.status})`);
        } else if (userErr.request) {
          console.error("No response received:", userErr.request);
          setError("Server did not respond. Check network connection.");
        } else {
          console.error("Error message:", userErr.message);
          setError(`Request error: ${userErr.message}`);
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      setError(
        `Failed to load user profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsLoading(false);
    }
  };

  /**
   * Handles toggling the follow status for the current profile
   * If already following, unfollows the user; otherwise follows the user
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleFollowToggle = async () => {
    try {
      const token = getAuthToken();

      if (!token || !profileData) {
        console.error("Missing token or profile data");
        return;
      }

      if (isFollowing) {
        await axios.delete(
          `${BACKEND_DOMAIN}/api/v1/follows/${profileData.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
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

      fetchUserProfile();
    } catch (err: any) {
      console.error("Error updating follow status:", err);
      console.error("Response data:", err.response?.data);
      setError(
        `Failed to update follow status: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
        <p className="mb-4">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
        <p className="mb-4">User profile not found</p>
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

      {/* Account content summary */}
      <div className="border-t border-gray-400 pt-6">
        <UserPlaylists username={username} />
      </div>
    </div>
  );
};

export default UserProfile;
