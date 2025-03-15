import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store.tsx";
import { useState } from "react";
import NavBar from "../components/Navigation/NavBar.tsx";

import { CiAt, CiLock, CiHeart, CiBoxList } from "react-icons/ci";
import { FaUsers, FaCamera } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const ProfilePage = () => {
  //const { username } = useParams();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Jane",
    lastName: "Doe",
    username: "janedoe",
    email: "jane.doe@example.com",
    profileImage: "/api/placeholder/150/150",
    followers: 345,
    favorites: 128,
    albums: 24,
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <>
      {user ? (
        <>
          <NavBar />
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                {/* Header section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                  {/* Profile image */}
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                      <img
                        src={profile.profileImage}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                        <FaCamera className="h-4 w-4" />
                      </button>
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
                            value={userInfo.first_name}
                            onChange={handleInputChange}
                            className="px-3 py-2 flex-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={userInfo.last_name}
                            onChange={handleInputChange}
                            className="px-3 py-2 flex-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Last Name"
                          />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={userInfo.username}
                          onChange={handleInputChange}
                          className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Username"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-800">
                          {userInfo.first_name} {userInfo.last_name}
                        </h1>
                        <p className="text-lg text-gray-500">
                          @{userInfo.username}
                        </p>
                      </>
                    )}

                    {/* Stats */}
                    <div className="flex justify-center md:justify-start gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-xl font-semibold text-gray-800">
                          {profile.followers}
                        </p>
                        <p className="text-sm text-gray-500">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-gray-800">
                          {profile.favorites}
                        </p>
                        <p className="text-sm text-gray-500">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-gray-800">
                          {profile.albums}
                        </p>
                        <p className="text-sm text-gray-500">Albums</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <MdEdit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Details section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Account Details
                  </h2>

                  {/* Email */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="w-full md:w-1/3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CiAt className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Email</span>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={userInfo.email}
                          onChange={handleInputChange}
                          className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Email"
                        />
                      ) : (
                        <p className="text-gray-800">{userInfo.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="w-full md:w-1/3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CiLock className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Password</span>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none">
                        Reset Password
                      </button>
                    </div>
                  </div>

                  {/* Account content summary */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Content Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <FaUsers className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="font-medium text-gray-800">
                            Followers
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {profile.followers}
                        </p>
                        <p className="text-sm text-gray-500">
                          People following you
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-pink-100 rounded-full">
                            <CiHeart className="h-5 w-5 text-pink-600" />
                          </div>
                          <h3 className="font-medium text-gray-800">
                            Favorites
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {profile.favorites}
                        </p>
                        <p className="text-sm text-gray-500">Items you liked</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <CiBoxList className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-gray-800">Albums</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {profile.albums}
                        </p>
                        <p className="text-sm text-gray-500">
                          Collections created
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ProfilePage;
