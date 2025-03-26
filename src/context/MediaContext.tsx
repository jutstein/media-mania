
import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem, MediaType, Season } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface MediaContextType {
  movies: MediaItem[];
  tvShows: MediaItem[];
  books: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, "id" | "addedDate">) => Promise<void>;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  getMediaItemById: (id: string) => MediaItem | undefined;
  getMediaItemsByType: (type: MediaType) => MediaItem[];
  getUserMediaItems: (userId: string) => MediaItem[];
  generateImageForTitle: (title: string, type: MediaType) => Promise<string>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  const movies = media.filter((item) => item.type === "movie");
  const tvShows = media.filter((item) => item.type === "tv");
  const books = media.filter((item) => item.type === "book");

  // Load media items from Supabase when user changes
  useEffect(() => {
    const loadMediaItems = async () => {
      if (!user) {
        setMedia([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // Transform the data from database format to app format
        const transformedData: MediaItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type as MediaType,
          imageUrl: item.image_url,
          creator: item.creator,
          releaseYear: item.release_year,
          addedDate: item.added_date,
          review: item.review_rating ? {
            rating: item.review_rating,
            text: item.review_text || '',
            date: item.review_date || new Date().toISOString().split("T")[0]
          } : undefined,
          seasons: item.seasons ? (item.seasons as unknown as Season[]) : undefined
        }));

        setMedia(transformedData);
      } catch (error: any) {
        console.error("Error loading media items:", error.message);
        toast.error("Failed to load your media items");
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaItems();
  }, [user]);

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

  const addMediaItem = async (item: Omit<MediaItem, "id" | "addedDate">) => {
    if (!user) {
      toast.error("You need to be logged in to add items");
      return;
    }

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
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('media_items')
        .insert({
          user_id: user.id,
          title: newItem.title,
          type: newItem.type,
          image_url: newItem.imageUrl,
          creator: newItem.creator,
          release_year: newItem.releaseYear,
          added_date: newItem.addedDate,
          review_rating: newItem.review?.rating,
          review_text: newItem.review?.text,
          review_date: newItem.review?.date,
          seasons: newItem.seasons as unknown as Json
        });

      if (error) throw error;

      // Optimistically update local state
      setMedia((prev) => [...prev, newItem]);
      toast.success(`Added "${item.title}" to your list!`);
    } catch (error: any) {
      console.error("Error adding media item:", error.message);
      toast.error("Failed to add media item");
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    if (!user) {
      toast.error("You need to be logged in to update items");
      return;
    }

    try {
      const updatedItem = { ...media.find(item => item.id === id), ...updates } as MediaItem;
      
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
      
      // Update in Supabase
      const { error } = await supabase
        .from('media_items')
        .update({
          title: updatedItem.title,
          type: updatedItem.type,
          image_url: updatedItem.imageUrl,
          creator: updatedItem.creator,
          release_year: updatedItem.releaseYear,
          review_rating: updatedItem.review?.rating,
          review_text: updatedItem.review?.text,
          review_date: updatedItem.review?.date,
          seasons: updatedItem.seasons as unknown as Json
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMedia((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return updatedItem;
          }
          return item;
        })
      );
      toast.success("Updated successfully!");
    } catch (error: any) {
      console.error("Error updating media item:", error.message);
      toast.error("Failed to update media item");
    }
  };

  const deleteMediaItem = async (id: string) => {
    if (!user) {
      toast.error("You need to be logged in to delete items");
      return;
    }

    try {
      const itemToDelete = media.find(item => item.id === id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMedia((prev) => prev.filter((item) => item.id !== id));
      
      if (itemToDelete) {
        toast.success(`Removed "${itemToDelete.title}" from your list`);
      }
    } catch (error: any) {
      console.error("Error deleting media item:", error.message);
      toast.error("Failed to delete media item");
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
        isLoading
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
