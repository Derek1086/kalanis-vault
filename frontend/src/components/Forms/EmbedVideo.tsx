import axios from "axios";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  VideoData,
  LinkAnalysisResult,
  BACKEND_DOMAIN,
} from "../../types/playlists";

import { Modal } from "../Container";
import { IconInputField } from "../Input";
import { PrimaryButton, SecondaryButton } from "../Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { CiLink } from "react-icons/ci";
import { BsCardHeading } from "react-icons/bs";

/**
 * Global TypeScript declaration for TikTok's embed functionality
 * @global
 */
declare global {
  interface Window {
    tiktokEmbed?: {
      reloadEmbeds: () => void;
    };
  }
}

/**
 * Props for the EmbedVideo component
 * @interface EmbedVideoProps
 */
interface EmbedVideoProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoAdded: (video: VideoData) => void;
  playlistId: string | undefined;
}

/**
 * Interface for validation errors from the form or API
 * @interface ValidationErrors
 */
interface ValidationErrors {
  tiktok_url?: string;
  title?: string;
  non_field_errors?: string[];
}

/**
 * Component for embedding TikTok videos into a playlist
 *
 * Allows users to add TikTok videos to their playlists by providing
 * a TikTok video URL. The component handles validation, link analysis,
 * and API submission.
 *
 * @component
 * @param {EmbedVideoProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const EmbedVideo: React.FC<EmbedVideoProps> = ({
  isOpen,
  onClose,
  onVideoAdded,
  playlistId,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [linkResult, setLinkResult] = useState<LinkAnalysisResult | null>(null);

  /**
   * Reset form state when modal is closed
   */
  useEffect(() => {
    if (!isOpen) {
      setVideoUrl("");
      setVideoTitle("");
      setThumbnailUrl(null);
      setError(null);
      setValidationErrors({});
      setLinkResult(null);
    }
  }, [isOpen]);

  /**
   * Handle TikTok embed script loading and cleanup
   * Manages the loading of TikTok's embed script and removal of
   * any existing iframe elements to prevent duplicates
   */
  useEffect(() => {
    const embedContainers = document.querySelectorAll(".tiktok-embed");
    embedContainers.forEach((container) => {
      Array.from(container.children).forEach((child) => {
        if (child.tagName === "IFRAME") {
          child.remove();
        }
      });
    });

    if (linkResult?.platform === "tiktok" && linkResult.isValid) {
      const existingScript = document.getElementById("tiktok-embed-script");
      if (existingScript) {
        existingScript.remove();
      }

      setTimeout(() => {
        const script = document.createElement("script");
        script.id = "tiktok-embed-script";
        script.src = "https://www.tiktok.com/embed.js";
        script.async = true;
        script.onload = () => {
          if (window.tiktokEmbed) {
            window.tiktokEmbed.reloadEmbeds();
          }
        };

        document.body.appendChild(script);
      }, 100);

      return () => {
        const script = document.getElementById("tiktok-embed-script");
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [linkResult]);

  /**
   * Retrieves the authentication token either from Redux state or localStorage
   * @returns {string|null} The authentication token or null if not found
   */
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

  /**
   * Updates video URL state and clears related validation errors
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    if (validationErrors.tiktok_url) {
      setValidationErrors((prev) => ({ ...prev, tiktok_url: undefined }));
    }
  };

  /**
   * Updates video title state and clears related validation errors
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoTitle(e.target.value);
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  /**
   * Detects the social media platform from a URL
   * Currently supports TikTok and Instagram detection
   *
   * @param {string} url - The URL to analyze
   * @returns {LinkAnalysisResult} Result object with platform and validity
   */
  const detectPlatform = (url: string): LinkAnalysisResult => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      if (domain.includes("tiktok.com") || domain.includes("vm.tiktok.com")) {
        return { platform: "tiktok", url, isValid: true };
      }

      if (domain.includes("instagram.com") || domain.includes("instagr.am")) {
        return { platform: "instagram", url, isValid: true };
      }

      return { platform: "unknown", url, isValid: false };
    } catch {
      return { platform: "unknown", url, isValid: false };
    }
  };

  /**
   * Extracts the TikTok video ID from a TikTok URL
   *
   * @param {string} url - The TikTok URL
   * @returns {string|null} The TikTok video ID or null if not found
   */
  const extractTikTokId = (url: string): string | null => {
    try {
      if (url.includes("vm.tiktok.com")) {
        return "unknown"; // We'll need to handle this on the backend
      }

      const regex = /\/video\/(\d+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  /**
   * Analyzes the provided link to determine if it's a valid TikTok URL
   * If valid, fetches metadata from TikTok's oEmbed API
   */
  const analyzeLink = async () => {
    if (!videoUrl.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setThumbnailUrl(null);
    setLinkResult(null);

    try {
      const detectionResult = detectPlatform(videoUrl);

      if (detectionResult.platform === "tiktok" && detectionResult.isValid) {
        const tiktokId = extractTikTokId(videoUrl);
        if (!tiktokId) {
          setError(
            "Invalid TikTok URL format. Please check the URL and try again."
          );
          setLinkResult(null);
          return;
        }

        try {
          const response = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`
          );

          if (response.ok) {
            const data = await response.json();
            detectionResult.embedHtml = data.html;
            detectionResult.metadata = {
              title: data.title,
              author: data.author_name,
              thumbnailUrl: data.thumbnail_url,
            };

            setVideoTitle(data.title || "");

            if (data.thumbnail_url) {
              setThumbnailUrl(data.thumbnail_url);
              console.log("Thumbnail URL set:", data.thumbnail_url);
            }
          }
        } catch (err) {
          console.warn("Could not fetch TikTok oEmbed data:", err);
        }

        setLinkResult(detectionResult);
      } else if (
        detectionResult.platform === "instagram" &&
        detectionResult.isValid
      ) {
        setError("Instagram videos are not supported at this time.");
        setLinkResult(null);
      } else {
        setError("Please enter a valid TikTok URL.");
        setLinkResult(null);
      }
    } catch (err) {
      console.error("Error analyzing link:", err);
      setError("Failed to analyze the link. Please try again.");
      setLinkResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Validates form input before submission
   *
   * @returns {boolean} True if validation passes, false otherwise
   */
  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    if (!videoUrl.trim()) {
      errors.tiktok_url = "Video URL is required";
    } else {
      const result = detectPlatform(videoUrl);
      if (!result.isValid || result.platform !== "tiktok") {
        errors.tiktok_url = "Please enter a valid TikTok URL";
      }
    }

    if (videoTitle && videoTitle.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission to add a video to the playlist
   *
   * @param {React.FormEvent} e - The form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You need to be logged in to add videos");
        setIsLoading(false);
        return;
      }

      const tiktokId = extractTikTokId(videoUrl) || "";

      const videoData = {
        tiktok_url: videoUrl,
        tiktok_id: tiktokId,
        title: videoTitle || null,
        playlist: playlistId,
        thumbnail_url: thumbnailUrl || null,
      };

      console.log("Sending video data:", videoData);

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/videos/`,
        videoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      onVideoAdded(response.data);
      onClose();
    } catch (err) {
      setIsLoading(false);
      console.error("Error adding video:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setValidationErrors(err.response.data);
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to add video. Please try again.");
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
      title="Add Video to Playlist"
      description="Embed a TikTok video to your playlist."
      minWidth="min-w-lg"
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
          placeholder="TikTok Video URL"
          name="videoUrl"
          onChange={handleUrlChange}
          value={videoUrl}
          required
          autoFocus
          icon={<CiLink className="h-5 w-5 text-gray-400" />}
          className={validationErrors.tiktok_url ? "border-red-500" : ""}
        />
        {validationErrors.tiktok_url && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.tiktok_url}
          </p>
        )}
        <IconInputField
          type="text"
          placeholder="Video Title (Optional)"
          name="videoTitle"
          onChange={handleTitleChange}
          value={videoTitle}
          icon={<BsCardHeading className="h-5 w-5 text-gray-400" />}
          className={validationErrors.title ? "border-red-500" : ""}
        />
        {validationErrors.title && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
        )}
        <PrimaryButton
          type="button"
          onClick={analyzeLink}
          disabled={isAnalyzing || !videoUrl.trim()}
          className="whitespace-nowrap"
        >
          {isAnalyzing ? (
            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
          ) : (
            "Analyze"
          )}
        </PrimaryButton>

        {/* Link Preview with Playable TikTok Embed */}
        {linkResult && linkResult.platform === "tiktok" && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">Link Preview</h3>

            {/* TikTok Embed */}
            <div className="mb-3">
              <blockquote
                key={linkResult.url}
                className="tiktok-embed"
                cite={linkResult.url}
                data-video-id={extractTikTokId(linkResult.url)}
                style={{ maxWidth: "100%", minWidth: "325px" }}
              >
                <section>
                  {linkResult.metadata?.author && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`@${linkResult.metadata.author}`}
                      href={`https://www.tiktok.com/@${linkResult.metadata.author}?refer=embed`}
                    >
                      @{linkResult.metadata.author}
                    </a>
                  )}
                  {linkResult.metadata?.title && (
                    <p>{linkResult.metadata.title}</p>
                  )}
                </section>
              </blockquote>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-400 truncate">{videoUrl}</p>
              {thumbnailUrl && (
                <p className="text-xs text-gray-500">
                  Thumbnail URL detected:{" "}
                  <span className="text-green-600">&#10003;</span>
                </p>
              )}
            </div>
          </div>
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

        <div className="flex gap-3">
          <PrimaryButton
            type="submit"
            disabled={isLoading || !videoUrl.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Add Video"
            )}
          </PrimaryButton>

          <SecondaryButton type="button" onClick={onClose} className="flex-1">
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default EmbedVideo;
