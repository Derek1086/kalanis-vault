import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import { toast } from "react-toastify";
import { getUserInfo } from "../../features/auth/authSlice";
import { BACKEND_DOMAIN } from "../../types/playlists";

import { Modal } from "../Container";
import { IconInputField } from "../Input";
import { PrimaryButton } from "../Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import { CiUser, CiAt } from "react-icons/ci";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  currentProfile: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profileImage: string;
  };
}

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  profile_picture?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

const EditProfile: React.FC<EditProfileProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  currentProfile,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profileImage: defaultProfileImage,
    profileImageFile: null as File | null,
  });

  useEffect(() => {
    if (isOpen && currentProfile) {
      setProfile({
        firstName: currentProfile.firstName || "",
        lastName: currentProfile.lastName || "",
        username: currentProfile.username || "",
        email: currentProfile.email || "",
        profileImage: currentProfile.profileImage || defaultProfileImage,
        profileImageFile: null,
      });

      setError(null);
      setValidationErrors({});
    }
  }, [isOpen, currentProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          profile_picture:
            "Please select a valid image file (JPEG, PNG, or WebP).",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          profile_picture: "Image must be less than 5MB.",
        }));
        return;
      }

      setProfile((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
        profileImageFile: file,
      }));

      // Clear validation errors
      if (validationErrors.profile_picture) {
        setValidationErrors((prev) => ({
          ...prev,
          profile_picture: undefined,
        }));
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    if (!profile.firstName.trim()) {
      errors.first_name = "First name is required";
    }

    if (!profile.lastName.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!profile.username.trim()) {
      errors.username = "Username is required";
    } else if (profile.username.length > 30) {
      errors.username = "Username must be less than 30 characters";
    }

    if (!profile.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      errors.email = "Invalid email format";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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

      const formData = new FormData();
      formData.append("first_name", profile.firstName);
      formData.append("last_name", profile.lastName);
      formData.append("username", profile.username);
      formData.append("email", profile.email);

      if (profile.profileImageFile) {
        formData.append("profile_picture", profile.profileImageFile);
      }

      const response = await axios.patch(
        `${BACKEND_DOMAIN}/api/v1/auth/users/me/`,
        formData,
        {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully", {
        theme: "dark",
      });

      dispatch(getUserInfo());
      onProfileUpdated();
      onClose();
    } catch (err) {
      setIsLoading(false);
      console.error("Error updating profile:", err);

      if (axios.isAxiosError(err) && err.response) {
        console.error("Response data:", err.response.data);

        if (err.response.status === 400) {
          setValidationErrors(err.response.data);
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            "An error occurred while updating your profile. Please try again."
          );
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your profile information"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-300">
              <img
                src={profile.profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultProfileImage;
                }}
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <FaCamera className="h-4 w-4" />
            </button>
          </div>
        </div>

        {validationErrors.profile_picture && (
          <p className="text-red-500 text-sm text-center">
            {validationErrors.profile_picture}
          </p>
        )}

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <IconInputField
              type="text"
              placeholder="First Name"
              name="firstName"
              value={profile.firstName}
              onChange={handleInputChange}
              required
              icon={<CiUser className="h-5 w-5 text-gray-400" />}
              className={validationErrors.first_name ? "border-red-500" : ""}
            />
            {validationErrors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.first_name}
              </p>
            )}
          </div>
          <div>
            <IconInputField
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={profile.lastName}
              onChange={handleInputChange}
              required
              icon={<CiUser className="h-5 w-5 text-gray-400" />}
              className={validationErrors.last_name ? "border-red-500" : ""}
            />
            {validationErrors.last_name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Username */}
        <IconInputField
          type="text"
          placeholder="Username"
          name="username"
          value={profile.username}
          onChange={handleInputChange}
          required
          icon={<CiUser className="h-5 w-5 text-gray-400" />}
          className={validationErrors.username ? "border-red-500" : ""}
        />
        {validationErrors.username && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.username}
          </p>
        )}

        {/* Email */}
        <IconInputField
          type="email"
          placeholder="Email"
          name="email"
          value={profile.email}
          onChange={handleInputChange}
          required
          icon={<CiAt className="h-5 w-5 text-gray-400" />}
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
        )}

        {validationErrors.non_field_errors && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            <ul className="list-disc pl-5">
              {validationErrors.non_field_errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3">
          <PrimaryButton type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Save Changes"
            )}
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 font-medium py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#151316]"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfile;
