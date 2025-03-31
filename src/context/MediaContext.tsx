
import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem, MediaType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useMediaCrud } from "@/hooks/useMediaCrud";
import { useImageGeneration } from "@/hooks/useImageGeneration";

interface MediaContextType {
  movies: MediaItem[];
  tvShows: MediaItem[];
  books: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, "id" | "addedDate">) => Promise<void>;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => Promise<string | undefined>;
  deleteMediaItem: (id: string) => Promise<void>;
  getMediaItemById: (id: string) => MediaItem | undefined;
  getMediaItemsByType: (type: MediaType) => MediaItem[];
  getUserMediaItems: (userId: string) => MediaItem[];
  generateImageForTitle: (title: string, type: MediaType) => Promise<string>;
  isLoading: boolean;
  loadMediaItems: (userId?: string) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const { generateImageForTitle } = useImageGeneration();
  const { 
    isLoading, 
    loadMediaItems, 
    addMediaItem, 
    updateMediaItem, 
    deleteMediaItem 
  } = useMediaCrud(user?.id, setMedia, media);

  // Correctly filter the media items by type
  const movies = media.filter((item) => item.type === "movie");
  const tvShows = media.filter((item) => item.type === "tv");
  const books = media.filter((item) => item.type === "book");

  useEffect(() => {
    console.log("MediaContext - Loading media items for user:", user?.id);
    loadMediaItems();
  }, [user]);

  const getMediaItemById = (id: string) => {
    return media.find((item) => item.id === id);
  };

  const getMediaItemsByType = (type: MediaType) => {
    return media.filter((item) => item.type === type);
  };

  const getUserMediaItems = (userId: string) => {
    return media;
  };

  return (
    <MediaContext.Provider
      value={{
        movies,
        tvShows,
        books,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        getMediaItemById,
        getMediaItemsByType,
        getUserMediaItems,
        generateImageForTitle,
        isLoading,
        loadMediaItems
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
