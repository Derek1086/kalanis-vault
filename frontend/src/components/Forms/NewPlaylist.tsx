import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { toast } from "react-toastify";

import { Modal } from "../Container";
import { IconInputField, TextAreaField, CheckboxField } from "../Input";
import { PrimaryButton } from "../Button";

import { CiBoxList } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { BsTag } from "react-icons/bs";
import { MdOutlineImage } from "react-icons/md";
import { IoAdd, IoClose } from "react-icons/io5";

import {
  UserPlaylistData,
  ValidationErrors,
  BACKEND_DOMAIN,
} from "../../types/playlists";

/**
 * Props for the NewPlaylist component
 * @typedef {Object} NewPlaylistProps
 * @property {boolean} isOpen - Whether the playlist creation modal is open
 * @property {() => void} onClose - Function to call when the modal is closed
 * @property {(playlist: UserPlaylistData) => void} [onPlaylistCreated] - Optional callback for when a playlist is successfully created
 */
interface NewPlaylistProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlist: UserPlaylistData) => void;
}

/**
 * Component for creating a new playlist
 *
 * @component
 * @param {NewPlaylistProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const NewPlaylist: React.FC<NewPlaylistProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated,
}) => {
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const navigate = useNavigate();

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  /**
   * Reset form state when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setPlaylistName("");
      setPlaylistDescription("");
      setIsPublic(true);
      setTags([]);
      setThumbnailPreview(null);
      setError(null);
      setValidationErrors({});
      setNewTag("");
      setThumbnail(null);
    }
  }, [isOpen]);

  /**
   * Handle playlist name input changes and clear validation errors
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(e.target.value);
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  /**
   * Handle playlist description changes and clear validation errors
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event
   */
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPlaylistDescription(e.target.value);
    if (validationErrors.description) {
      setValidationErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  /**
   * Handle tag input changes and clear validation errors
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTag(value);

    if (validationErrors.tags) {
      setValidationErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  /**
   * Add a new tag to the tags array if it's valid
   */
  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  /**
   * Handle key press events in the tag input field
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  /**
   * Remove a tag from the tags array
   *
   * @param {string} tagToRemove - The tag to remove
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * Handle thumbnail image file selection and validation
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          thumbnail: "Please select a valid image file (JPEG, PNG, or WebP).",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          thumbnail: "Image must be less than 5MB.",
        }));
        return;
      }

      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));

      if (validationErrors.thumbnail) {
        setValidationErrors((prev) => ({ ...prev, thumbnail: undefined }));
      }
    }
  };

  /**
   * Trigger the hidden file input click event
   */
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Remove the current thumbnail and reset the file input
   */
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Validate form fields before submission
   *
   * @returns {boolean} True if validation passes, false otherwise
   */
  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    if (!playlistName.trim()) {
      errors.title = "Playlist name is required";
    } else if (playlistName.length > 100) {
      errors.title = "Playlist name must be less than 100 characters";
    }

    if (playlistDescription.length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    if (tags.length > 10) {
      errors.tags = "Maximum of 10 tags allowed";
    }

    if (!thumbnail) {
      errors.thumbnail = "Thumbnail image is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission to create a new playlist
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    const token = user?.access || localStorage.getItem("accessToken");

    if (!token) {
      setError("You must be logged in to create a playlist");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", playlistName);

      if (playlistDescription) {
        formData.append("description", playlistDescription);
      }

      formData.append("is_public", String(isPublic));

      if (thumbnail) {
        formData.append("cover_image", thumbnail);
      }

      if (tags.length > 0) {
        tags.forEach((tag) => {
          formData.append("tags", tag);
        });
      }

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/playlists/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`Created "${playlistName}"`, {
        theme: "dark",
      });

      setIsLoading(false);

      if (onPlaylistCreated) {
        onPlaylistCreated(response.data);
      }

      onClose();

      const username = userInfo?.username || "";
      const playlistId = response.data.id;
      navigate(`/${username}/playlists/${playlistId}`);
    } catch (err) {
      setIsLoading(false);
      console.error("Error creating playlist:", err);

      if (axios.isAxiosError(err) && err.response) {
        console.error("Response data:", err.response.data);

        if (err.response.status === 400) {
          setValidationErrors(err.response.data);
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            "An error occurred while creating your playlist. Please try again."
          );
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Playlist"
      description="Create a new playlist to organize your favorite content."
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <IconInputField
          type="text"
          placeholder="Playlist Name"
          name="playlistName"
          onChange={handleNameChange}
          value={playlistName}
          required
          autoFocus
          icon={<CiBoxList className="h-5 w-5 text-gray-400" />}
          className={validationErrors.title ? "border-red-500" : ""}
        />
        {validationErrors.title && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
        )}

        <TextAreaField
          placeholder="Description (optional, max 200 chars)"
          name="playlistDescription"
          onChange={handleDescriptionChange}
          value={playlistDescription}
          rows={3}
          maxCharacters={200}
          className={validationErrors.description ? "border-red-500" : ""}
        />
        {validationErrors.description && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.description}
          </p>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-2">Thumbnail</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleThumbnailChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {thumbnailPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-300">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <IoClose size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#c549d4] cursor-pointer"
            >
              <MdOutlineImage className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-400 mt-2">Click to upload a thumbnail</p>
              <p className="text-gray-400 text-xs mt-1">
                JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>
          )}

          {validationErrors.thumbnail && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.thumbnail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Tags (optional, max 10)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[#c549d4] py-2 px-4 rounded-full text-sm text-white"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-white hover:text-gray-400"
                >
                  <IoClose size={16} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex">
            <div className="flex-grow">
              <IconInputField
                type="text"
                name="tags"
                placeholder="Tag"
                value={newTag}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                disabled={tags.length >= 10}
                icon={<BsTag className="h-5 w-5 text-gray-400" />}
                className={validationErrors.tags ? "border-red-500" : ""}
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              disabled={!newTag.trim() || tags.length >= 10}
              className="ml-2 bg-[#c549d4] text-white rounded-md px-3 py-2 flex items-center justify-center disabled:bg-gray-400"
            >
              <IoAdd size={20} />
            </button>
          </div>

          {validationErrors.tags && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.tags}</p>
          )}
        </div>

        <CheckboxField
          id="isPublic"
          label="Make this playlist public"
          checked={isPublic}
          onChange={setIsPublic}
        />

        {validationErrors.non_field_errors && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            <ul className="list-disc pl-5">
              {validationErrors.non_field_errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <PrimaryButton
          type="submit"
          disabled={isLoading || !playlistName.trim()}
          className="w-full"
        >
          {isLoading ? (
            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
          ) : (
            "Create Playlist"
          )}
        </PrimaryButton>
      </form>
    </Modal>
  );
};

export default NewPlaylist;
