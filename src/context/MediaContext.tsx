
import React, { createContext, useContext, useState } from "react";
import { MediaItem, MediaType, User } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface MediaContextType {
  movies: MediaItem[];
  tvShows: MediaItem[];
  books: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, "id" | "addedDate">) => void;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  getMediaItemById: (id: string) => MediaItem | undefined;
  getMediaItemsByType: (type: MediaType) => MediaItem[];
  getUserMediaItems: (userId: string) => MediaItem[];
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);

  const movies = media.filter((item) => item.type === "movie");
  const tvShows = media.filter((item) => item.type === "tv");
  const books = media.filter((item) => item.type === "book");

  const addMediaItem = (item: Omit<MediaItem, "id" | "addedDate">) => {
    const newItem: MediaItem = {
      ...item,
      id: `${item.type}${Date.now()}`,
      addedDate: new Date().toISOString().split("T")[0],
    };
    
    setMedia((prev) => [...prev, newItem]);
    toast.success(`Added "${item.title}" to your list!`);
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMedia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    toast.success("Updated successfully!");
  };

  const deleteMediaItem = (id: string) => {
    const itemToDelete = media.find(item => item.id === id);
    setMedia((prev) => prev.filter((item) => item.id !== id));
    if (itemToDelete) {
      toast.success(`Removed "${itemToDelete.title}" from your list`);
    }
  };

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
