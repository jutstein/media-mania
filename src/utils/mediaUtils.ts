
import { MediaItem, MediaType, Season } from "@/types";

// Function to generate a placeholder image URL based on title and type
export const generatePlaceholderImage = (title: string, type: MediaType) => {
  // This creates a consistent "random" image based on the title
  const seed = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Select an appropriate base image based on media type
  let imageIds;
  if (type === "movie") {
    imageIds = ["photo-1478720568477-152d9b164e26", "photo-1485846234645-a62644f84728", "photo-1440404653325-ab127d49abc1"];
  } else if (type === "tv") {
    imageIds = ["photo-1522869635100-9f4c5e86aa37", "photo-1593359677879-a4bb92f829d1", "photo-1593784991095-a205069470b6"];
  } else { // books
    imageIds = ["photo-1495446815901-a7297e633e8d", "photo-1544947950-fa07a98d237f", "photo-1512820790803-83ca734da794"];
  }
  
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

