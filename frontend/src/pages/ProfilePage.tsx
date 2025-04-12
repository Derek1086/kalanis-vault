import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../app/store.tsx";
import { useState, useEffect } from "react";
import { getUserInfo } from "../features/auth/authSlice.ts";
import axios from "axios";
import NavBar from "../components/Navigation/NavBar.tsx";

import { CiAt, CiLock, CiHeart, CiBoxList } from "react-icons/ci";
import { FaUsers, FaCamera } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const BACKEND_DOMAIN =
  import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";

interface PlaylistData {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_public: boolean;
  video_count: number;
  like_count: number;
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

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

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

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

  const fetchUserData = async () => {
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

      const playlistsResponse = await axios.get<PlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/my_playlists/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPlaylistsCount(playlistsResponse.data.length);

      const likedPlaylistsResponse = await axios.get<PlaylistData[]>(
        `${BACKEND_DOMAIN}/api/v1/playlists/liked_playlists/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLikesCount(likedPlaylistsResponse.data.length);

      const followersResponse = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/follows/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const followers = followersResponse.data.filter(
        (follow: any) => follow.followed === userInfo.id
      );
      setFollowersCount(followers.length);

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching data:", err);
      setError("Failed to load user data");
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token =
        user?.access ||
        (localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").access
          : null);

      if (!token) {
        setError("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("first_name", profile.firstName);
      formData.append("last_name", profile.lastName);
      formData.append("username", profile.username);
      formData.append("email", profile.email);

      await axios.patch(`${BACKEND_DOMAIN}/api/v1/users/me/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setIsEditing(false);
      fetchUserData(); // Refresh data
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Preview the selected file
      setProfile((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
        profileImageFile: file, // Store the file for later upload
      }));
    }
  };

  return (
    <>
      {user ? (
        <>
          <NavBar />
          <div className="min-h-screen flex items-start justify-center p-4 bg-gradient-to-r from-[#c549d4] to-[#9b36b7]">
            <div className="w-full max-w-4xl bg-[#151316] rounded-xl shadow-lg overflow-hidden text-white">
              {isLoading ? (
                <div className="p-8 flex justify-center items-center h-64">
                  <p>Loading profile data...</p>
                </div>
              ) : (
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
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors cursor-pointer">
                          <FaCamera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePictureChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* User info */}
                    <div className="flex-1 text-center md:text-left">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              name="firstName"
                              value={profile.firstName}
                              onChange={handleInputChange}
                              className="px-3 py-2 flex-1 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-[#232126] text-white"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={profile.lastName}
                              onChange={handleInputChange}
                              className="px-3 py-2 flex-1 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-[#232126] text-white"
                              placeholder="Last Name"
                            />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={profile.username}
                            onChange={handleInputChange}
                            className="px-3 py-2 w-full border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-[#232126] text-white"
                            placeholder="Username"
                          />
                        </div>
                      ) : (
                        <>
                          <h1 className="text-3xl font-bold text-white">
                            {userInfo?.first_name} {userInfo?.last_name}
                          </h1>
                          <p className="text-lg text-gray-400">
                            @{userInfo?.username}
                          </p>
                        </>
                      )}

                      {/* Stats */}
                      <div className="flex justify-center md:justify-start gap-6 mt-4">
                        <div className="text-center">
                          <p className="text-xl font-semibold text-white">
                            {followersCount}
                          </p>
                          <p className="text-sm text-gray-400">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-white">
                            {likesCount}
                          </p>
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

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#151316]"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleEditToggle}
                            className="border border-gray-600 text-gray-300 font-medium py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#151316]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditToggle}
                          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#151316]"
                        >
                          <MdEdit className="h-4 w-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-6"></div>

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
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleInputChange}
                            className="px-3 py-2 w-full border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-[#232126] text-white"
                            placeholder="Email"
                          />
                        ) : (
                          <p className="text-white">{userInfo?.email}</p>
                        )}
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
                        <button
                          onClick={() => navigate("/reset-password")}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#151316]"
                        >
                          Reset Password
                        </button>
                      </div>
                    </div>

                    {/* Account content summary */}
                    <div className="border-t border-gray-700 pt-6 mt-6">
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Content Summary
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#232126] p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-900 rounded-full">
                              <FaUsers className="h-5 w-5 text-purple-300" />
                            </div>
                            <h3 className="font-medium text-white">
                              Followers
                            </h3>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {followersCount}
                          </p>
                          <p className="text-sm text-gray-400">
                            People following you
                          </p>
                        </div>

                        <div className="bg-[#232126] p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-pink-900 rounded-full">
                              <CiHeart className="h-5 w-5 text-pink-300" />
                            </div>
                            <h3 className="font-medium text-white">
                              Favorites
                            </h3>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {likesCount}
                          </p>
                          <p className="text-sm text-gray-400">
                            Playlists you liked
                          </p>
                        </div>

                        <div className="bg-[#232126] p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-900 rounded-full">
                              <CiBoxList className="h-5 w-5 text-blue-300" />
                            </div>
                            <h3 className="font-medium text-white">
                              Playlists
                            </h3>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {playlistsCount}
                          </p>
                          <p className="text-sm text-gray-400">
                            Playlists created
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded m-4">
                  {error}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ProfilePage;
