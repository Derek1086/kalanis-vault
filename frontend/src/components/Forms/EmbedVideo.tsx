import { useState } from "react";

/**
 * Interface for the result of a social media link analysis
 * Stores platform type, validity status, and embed data
 */
interface LinkAnalysisResult {
  platform: "tiktok" | "instagram" | "unknown";
  url: string;
  isValid: boolean;
  embedHtml?: string;
  metadata?: {
    title?: string;
    author?: string;
    thumbnailUrl?: string;
  };
}

/**
 * Interface for TikTok oEmbed API response
 * Contains all the data returned by TikTok's oEmbed endpoint
 */
interface TikTokOEmbedResponse {
  version: string;
  type: string;
  title: string;
  author_url: string;
  author_name: string;
  width: string;
  height: string;
  html: string;
  thumbnail_width: number;
  thumbnail_height: number;
  thumbnail_url: string;
  provider_url: string;
  provider_name: string;
  author_unique_id: string;
}

const EmbedVideo = () => {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Detects which social media platform a URL belongs to
   * Currently supports TikTok and Instagram
   * @param url The URL to analyze
   * @returns LinkAnalysisResult with platform and validity info
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
   * Fetches embed data from TikTok's oEmbed API
   * @param url The TikTok video URL
   * @returns Promise resolving to TikTok's oEmbed response
   */
  const fetchTikTokEmbed = async (
    url: string
  ): Promise<TikTokOEmbedResponse> => {
    try {
      const response = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch TikTok embed data");
      }

      return await response.json();
    } catch (err) {
      throw new Error("Error fetching TikTok embed data.");
    }
  };

  /**
   * Main handler for analyzing and embedding social media links
   * Detects platform and fetches embed data if available
   */
  const handleAnalyzeLink = async () => {
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const detectionResult = detectPlatform(inputUrl);

      if (detectionResult.platform === "tiktok" && detectionResult.isValid) {
        try {
          const oembedData = await fetchTikTokEmbed(inputUrl);

          detectionResult.embedHtml = oembedData.html;
          detectionResult.metadata = {
            title: oembedData.title,
            author: oembedData.author_name,
            thumbnailUrl: oembedData.thumbnail_url,
          };

          console.log(oembedData);
        } catch (err) {
          setError(
            "Failed to fetch TikTok embed data. The link may be private or invalid."
          );
        }
      } else if (
        detectionResult.platform === "instagram" &&
        detectionResult.isValid
      ) {
        setError("Instagram embedding is currently not implemented.");
      }

      setResult(detectionResult);
    } catch {
      setError("Failed to process the link.");
    } finally {
      setIsLoading(false);
    }
  };

  return <div>EmbedVideo</div>;
};

export default EmbedVideo;
