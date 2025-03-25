
import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem, MediaType, Season } from "@/types";
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
  generateImageForTitle: (title: string, type: MediaType) => Promise<string>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

// Function to generate a placeholder image URL based on title and type
const generatePlaceholderImage = (title: string, type: MediaType) => {
  // This creates a consistent "random" image based on the title
  const seed = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIds = ["photo-1526374965328-7f61d4dc18c5", "photo-1535268647677-300dbf3d78d1", "photo-1470813740244-df37b8c1edcb"];
  const selectedImage = imageIds[seed % imageIds.length];
  
  return `https://images.unsplash.com/${selectedImage}?auto=format&fit=crop&w=800&q=80`;
};

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);

  const movies = media.filter((item) => item.type === "movie");
  const tvShows = media.filter((item) => item.type === "tv");
  const books = media.filter((item) => item.type === "book");

  // Function to generate an image using title
  const generateImageForTitle = async (title: string, type: MediaType) => {
    try {
      // For now, we'll use a placeholder image generator
      // In a real implementation, this would call an AI image generation API
      return generatePlaceholderImage(title, type);
    } catch (error) {
      console.error("Error generating image:", error);
      return generatePlaceholderImage(title, type);
    }
  };

  // Calculate average rating for TV shows based on season ratings
  const calculateAverageRating = (seasons: Season[]) => {
    const ratedSeasons = seasons.filter(season => season.rating !== undefined);
    if (ratedSeasons.length === 0) return 0;
    
    const sum = ratedSeasons.reduce((total, season) => total + (season.rating || 0), 0);
    return sum / ratedSeasons.length;
  };

  const addMediaItem = (item: Omit<MediaItem, "id" | "addedDate">) => {
    const newItem: MediaItem = {
      ...item,
      id: `${item.type}${Date.now()}`,
      addedDate: new Date().toISOString().split("T")[0],
    };
    
    // Calculate average rating for TV shows
    if (item.type === "tv" && item.seasons) {
      const avgRating = calculateAverageRating(item.seasons);
      if (avgRating > 0 && (!item.review || item.review.rating === 0)) {
        newItem.review = {
          ...newItem.review || { text: "", date: new Date().toISOString().split("T")[0] },
          rating: avgRating,
        };
      }
    }
    
    setMedia((prev) => [...prev, newItem]);
    toast.success(`Added "${item.title}" to your list!`);
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMedia((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          
          // If updating seasons, recalculate the average rating
          if (updates.seasons && updatedItem.type === "tv") {
            const avgRating = calculateAverageRating(updatedItem.seasons);
            if (avgRating > 0) {
              updatedItem.review = {
                ...updatedItem.review || { text: "", date: new Date().toISOString().split("T")[0] },
                rating: avgRating,
              };
            }
          }
          
          return updatedItem;
        }
        return item;
      })
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
        generateImageForTitle,
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
