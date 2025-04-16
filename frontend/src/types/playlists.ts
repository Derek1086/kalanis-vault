export interface PlaylistData {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_public: boolean;
  video_count?: number;
  like_count?: number;
  tags?: TagData[];
}

export interface UserPlaylistData {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  thumbnail: string | null;
  is_public: boolean;
  user: {
    username: string;
    id: number;
  };
  video_count: number;
  like_count: number;
  is_liked: boolean;
  view_count: number;
  share_count: number;
  videos: VideoData[];
  tags?: TagData[];
}

export interface VideoData {
  id: number;
  title: string | null;
  tiktok_url: string;
  tiktok_id: string;
  thumbnail_url: string | null;
  custom_thumbnail: string | null;
  added_at: string;
  order: number;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  thumbnail?: string;
  tags?: string;
  non_field_errors?: string[];
}

export interface LinkAnalysisResult {
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

export interface TagData {
  id: number;
  name: string;
}

export const BACKEND_DOMAIN =
  import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";
