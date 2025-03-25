
export type MediaType = "movie" | "tv" | "book";

export interface Season {
  number: number;
  watched: boolean;
  episodesWatched?: number;
  totalEpisodes?: number;
  rating?: number; // Add rating property to seasons
}

export interface Review {
  rating: number;
  text: string;
  date: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  imageUrl?: string;
  creator?: string; // director, author, etc.
  releaseYear?: number;
  addedDate: string;
  review?: Review;
  seasons?: Season[]; // only for TV shows
}

export interface User {
  id: string;
  name: string;
  profilePic?: string;
  bio?: string;
}
