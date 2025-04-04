import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store.tsx";
import { getUserInfo } from "../features/auth/authSlice";

import NavBar from "../components/Navigation/NavBar.tsx";
import { Modal } from "../components/Container";
import { PrimaryIconButton } from "../components/Button/PrimaryIconButton.tsx";
import { Header, SecondaryText } from "../components/Typography";
import { IconButton } from "../components/Button/IconButton.tsx";

import { CiCirclePlus } from "react-icons/ci";

import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

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

/**
 * HomePage Component
 * Main entry point for the application that handles social media link embedding
 * Supports TikTok and Instagram URL detection and embedding (TikTok only implemented)
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [inputUrl, setInputUrl] = useState<string>("");
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

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

  const nextTrending = () => {
    // setTrendingIndex((prev) =>
    //   prev + 3 >= trendingVideos.length ? 0 : prev + 3
    // );
  };

  const prevTrending = () => {
    // setTrendingIndex((prev) =>
    //   prev - 3 < 0 ? Math.max(0, trendingVideos.length - 3) : prev - 3
    // );
  };

  return (
    <>
      <NavBar />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Playlist"
        description="Name your playlist and add videos to it."
      />
      <div className="relative h-80 bg-gradient-to-r from-[#c549d4] to-[#9b36b7] overflow-hidden flex items-center px-6">
        <div className="max-w-2xl text-white">
          <Header text="Create, Collect, Share" className="text-4xl mb-2" />
          <SecondaryText
            text="Build custom playlists from your favorite online videos."
            className="text-xl mb-4"
          />
          <div className="w-3/4">
            <PrimaryIconButton
              type="button"
              icon={<CiCirclePlus className="h-7 w-7" />}
              className="bg-white text-[#c549d4] hover:bg-[#c549d4] hover:text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Create New Playlist
            </PrimaryIconButton>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Trending Now" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Popular Playlists" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Recommended Playlists" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Your Liked Playlists" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Recent Playlists" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Header text="Your Playlists" className="text-3xl font-bold" />
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={prevTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={nextTrending}
              className="h-8 w-8 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
