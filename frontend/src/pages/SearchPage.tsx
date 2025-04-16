import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import NavBar from "../components/Navigation/NavBar.tsx";
import { Header, SecondaryText } from "../components/Typography";
import PlaylistCard from "../components/Playlists/PlaylistCard.tsx";
import { Link } from "react-router-dom";
import { PrimaryButton } from "../components/Button";
import { UserPlaylistData, BACKEND_DOMAIN } from "../types/playlists.ts";

const SearchPage = () => {
  const { query } = useParams();
  const [playlists, setPlaylists] = useState<UserPlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").access
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/v1/playlists/search/?q=${encodeURIComponent(
          searchQuery
        )}`,
        { headers }
      );

      // Sort results by relevance: title matches first, then tag matches, then description matches
      const sortedPlaylists = sortPlaylistsByRelevance(
        response.data,
        searchQuery
      );
      setPlaylists(sortedPlaylists);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Search results fetch error:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load search results. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  const sortPlaylistsByRelevance = (
    playlists: UserPlaylistData[],
    searchQuery: string
  ): UserPlaylistData[] => {
    const lowerQuery = searchQuery.toLowerCase();

    const scoredPlaylists = playlists.map((playlist) => {
      let score = 0;

      // Title matches: +3
      if (playlist.title.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }

      // Tag matches: +2
      if (
        playlist.tags &&
        playlist.tags.some((tag) => tag.name.toLowerCase().includes(lowerQuery))
      ) {
        score += 2;
      }

      // Description matches: +1
      if (
        playlist.description &&
        playlist.description.toLowerCase().includes(lowerQuery)
      ) {
        score += 1;
      }

      // Username matches: +4
      if (
        playlist.user &&
        playlist.user.username &&
        playlist.user.username.toLowerCase().includes(lowerQuery)
      ) {
        score += 4;
      }

      return { ...playlist, relevanceScore: score };
    });

    return scoredPlaylists
      .filter((playlist) => playlist.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Function to handle when a playlist is unliked
  const handlePlaylistUnliked = (playlistId: number): void => {
    setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <Header text={`${playlists.length} results for "${query}"`} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <IoWarningOutline className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <Header text="No Results Found" />
            <SecondaryText
              text={`We couldn't find any playlists matching "${query}"`}
              className="text-gray-400 mt-2"
            />
            <Link to="/explore">
              <PrimaryButton className="mt-6 mx-auto">
                Explore Playlists
              </PrimaryButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onUnlike={handlePlaylistUnliked}
                isLiked={playlist.is_liked}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
