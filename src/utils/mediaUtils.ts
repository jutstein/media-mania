
import { MediaItem, MediaType, Season } from "@/types";

// Function to generate a placeholder image URL based on title and type
export const generatePlaceholderImage = (title: string, type: MediaType) => {
  // This creates a consistent "random" image based on the title
  const seed = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIds = ["photo-1526374965328-7f61d4dc18c5", "photo-1535268647677-300dbf3d78d1", "photo-1470813740244-df37b8c1edcb"];
  const selectedImage = imageIds[seed % imageIds.length];
  
  return `https://images.unsplash.com/${selectedImage}?auto=format&fit=crop&w=800&q=80`;
};

// Calculate average rating for TV shows based on season ratings
export const calculateAverageRating = (seasons: Season[]) => {
  const ratedSeasons = seasons.filter(season => season.rating !== undefined);
  if (ratedSeasons.length === 0) return 0;
  
  const sum = ratedSeasons.reduce((total, season) => total + (season.rating || 0), 0);
  return sum / ratedSeasons.length;
};

// Transform data from database format to app format
export const transformDbItemToMediaItem = (item: any): MediaItem => ({
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
});
