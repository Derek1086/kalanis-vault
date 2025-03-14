import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store.tsx";
import { getUserInfo } from "../features/auth/authSlice";
import NavBar from "../components/Navigation/NavBar.tsx";

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

const HomePage = () => {
  const dispatch = useDispatch();
  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const [inputUrl, setInputUrl] = useState<string>("");
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user info when component mounts if it's not already available
  useEffect(() => {
    if (user && Object.keys(userInfo || {}).length === 0) {
      dispatch(getUserInfo() as any);
    }
  }, [user, userInfo, dispatch]);

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

  return (
    <>
      <NavBar />
      <nav className="navbar">
        <ul className="nav-links">
          {user ? (
            <>
              <div>
                <h1>Welcome, {userInfo?.first_name || "User"}</h1>
              </div>
              <div className="">
                <div className="mb-4">
                  <label
                    htmlFor="url-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Video URL
                  </label>
                  <input
                    id="url-input"
                    type="text"
                    placeholder="https://www.tiktok.com/... or https://www.instagram.com/..."
                    className=""
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyzeLink()}
                  />
                </div>
                <button
                  onClick={handleAnalyzeLink}
                  disabled={isLoading || !inputUrl.trim()}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                    isLoading || !inputUrl.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                >
                  {isLoading ? "Loading..." : "Embed Video"}
                </button>
              </div>

              {error && <div className="text-red-600">{error}</div>}

              {result && result.isValid && result.platform === "tiktok" && (
                <div className="p-4 border rounded">
                  <h2 className="text-lg font-semibold">Detection Result:</h2>
                  <p>Platform: {result.platform}</p>
                  <p>URL: {result.url}</p>
                  {result.metadata?.author && (
                    <p>Author: {result.metadata.author}</p>
                  )}
                  {result.metadata?.title && (
                    <p>Title: {result.metadata.title}</p>
                  )}
                  {result.embedHtml && (
                    <>
                      <blockquote
                        className="tiktok-embed"
                        cite={result.url}
                        data-video-id={new URL(result.url).pathname
                          .split("/")
                          .pop()}
                        style={{ maxWidth: "605px", minWidth: "325px" }}
                      >
                        <section>
                          <a
                            target="_blank"
                            title={`@${result.metadata?.author}`}
                            href={
                              result.metadata?.author
                                ? `https://www.tiktok.com/@${result.metadata.author}?refer=embed`
                                : "#"
                            }
                          >
                            @{result.metadata?.author}
                          </a>
                          {result.metadata?.title && (
                            <p>{result.metadata.title}</p>
                          )}
                        </section>
                      </blockquote>
                      <script
                        async
                        src="https://www.tiktok.com/embed.js"
                      ></script>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="">
                <div className="mb-4">
                  <label
                    htmlFor="url-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Video URL
                  </label>
                  <input
                    id="url-input"
                    type="text"
                    placeholder="https://www.tiktok.com/... or https://www.instagram.com/..."
                    className=""
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyzeLink()}
                  />
                </div>
                <button
                  onClick={handleAnalyzeLink}
                  disabled={isLoading || !inputUrl.trim()}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                    isLoading || !inputUrl.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                >
                  {isLoading ? "Loading..." : "Embed Video"}
                </button>
              </div>

              {error && <div className="text-red-600">{error}</div>}

              {result && result.isValid && result.platform === "tiktok" && (
                <div className="p-4 border rounded">
                  <h2 className="text-lg font-semibold">Detection Result:</h2>
                  <p>Platform: {result.platform}</p>
                  <p>URL: {result.url}</p>
                  {result.metadata?.author && (
                    <p>Author: {result.metadata.author}</p>
                  )}
                  {result.metadata?.title && (
                    <p>Title: {result.metadata.title}</p>
                  )}
                  {result.embedHtml && (
                    <>
                      <blockquote
                        className="tiktok-embed"
                        cite={result.url}
                        data-video-id={new URL(result.url).pathname
                          .split("/")
                          .pop()}
                        style={{ maxWidth: "605px", minWidth: "325px" }}
                      >
                        <section>
                          <a
                            target="_blank"
                            title={`@${result.metadata?.author}`}
                            href={
                              result.metadata?.author
                                ? `https://www.tiktok.com/@${result.metadata.author}?refer=embed`
                                : "#"
                            }
                          >
                            @{result.metadata?.author}
                          </a>
                          {result.metadata?.title && (
                            <p>{result.metadata.title}</p>
                          )}
                        </section>
                      </blockquote>
                      <script
                        async
                        src="https://www.tiktok.com/embed.js"
                      ></script>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default HomePage;
