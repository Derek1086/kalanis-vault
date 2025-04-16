import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Modal } from "../Container";
import { toast } from "react-toastify";
import { IconInputField } from "../Input";
import { PrimaryButton, SecondaryButton } from "../Button";
import {
  VideoData,
  LinkAnalysisResult,
  BACKEND_DOMAIN,
} from "../../types/playlists";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { CiLink } from "react-icons/ci";
import { BsCardHeading } from "react-icons/bs";

declare global {
  interface Window {
    tiktokEmbed?: {
      reloadEmbeds: () => void;
    };
  }
}

interface EmbedVideoProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoAdded: (video: VideoData) => void;
  playlistId: string | undefined;
}

interface ValidationErrors {
  tiktok_url?: string;
  title?: string;
  non_field_errors?: string[];
}

const EmbedVideo: React.FC<EmbedVideoProps> = ({
  isOpen,
  onClose,
  onVideoAdded,
  playlistId,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [linkResult, setLinkResult] = useState<LinkAnalysisResult | null>(null);
  const [embedInitialized, setEmbedInitialized] = useState<boolean>(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      // Reset form
      setVideoUrl("");
      setVideoTitle("");
      setError(null);
      setValidationErrors({});
      setLinkResult(null);
      setEmbedInitialized(false);
    }
  }, [isOpen]);

  // Load TikTok embed script when needed
  useEffect(() => {
    if (
      linkResult?.platform === "tiktok" &&
      linkResult.isValid &&
      !embedInitialized
    ) {
      // Remove any existing TikTok embed script to avoid duplicates
      const existingScript = document.getElementById("tiktok-embed-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Create and append the TikTok embed script
      const script = document.createElement("script");
      script.id = "tiktok-embed-script";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.onload = () => {
        // Script has loaded and is ready
        setEmbedInitialized(true);

        // If TikTok's widget object exists, call it to process embeds
        if (window.tiktokEmbed) {
          window.tiktokEmbed.reloadEmbeds();
        }
      };

      document.body.appendChild(script);

      return () => {
        // Clean up script when component unmounts
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [linkResult, embedInitialized]);

  const getAuthToken = (): string | null => {
    // First try from Redux state
    if (user?.access) {
      return user.access;
    }

    // Then fallback to localStorage
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    // Clear validation error when user starts typing
    if (validationErrors.tiktok_url) {
      setValidationErrors((prev) => ({ ...prev, tiktok_url: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoTitle(e.target.value);
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

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

  const extractTikTokId = (url: string): string | null => {
    try {
      // Handle shortened TikTok URLs
      if (url.includes("vm.tiktok.com")) {
        return "unknown"; // We'll need to handle this on the backend
      }

      // Handle regular TikTok URLs
      const regex = /\/video\/(\d+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const analyzeLink = async () => {
    if (!videoUrl.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setEmbedInitialized(false);

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
          // Try to fetch preview data from TikTok's oEmbed API
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

            // Auto-populate title if empty
            if (!videoTitle && data.title) {
              setVideoTitle(data.title);
            }
          }
        } catch (err) {
          // Silently fail on oEmbed, as we don't need it to continue
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
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

      // Extract TikTok ID from URL
      const tiktokId = extractTikTokId(videoUrl) || "";

      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/v1/videos/`,
        {
          tiktok_url: videoUrl,
          tiktok_id: tiktokId,
          title: videoTitle || null,
          playlist: playlistId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      setIsLoading(false);
      toast.success("Video added successfully", {
        theme: "dark",
      });

      // Call the callback function with the new video data
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
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <IoWarningOutline className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <div className="flex gap-2">
            <div className="flex-grow">
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
            </div>
            <SecondaryButton
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
            </SecondaryButton>
          </div>
          {validationErrors.tiktok_url && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.tiktok_url}
            </p>
          )}
        </div>

        <div>
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
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.title}
            </p>
          )}
        </div>

        {/* Link Preview with Playable TikTok Embed */}
        {linkResult && linkResult.platform === "tiktok" && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">Link Preview</h3>

            {/* TikTok Embed */}
            <div className="mb-3">
              <blockquote
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
