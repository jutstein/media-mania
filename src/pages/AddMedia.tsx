
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarRating from "@/components/StarRating";
import { MediaType, Season } from "@/types";
import { BookOpen, Film, Tv, Plus, Minus, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const AddMedia = () => {
  const navigate = useNavigate();
  const { addMediaItem, generateImageForTitle } = useMedia();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [creator, setCreator] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([{ number: 1, watched: false, rating: 0 }]);
  const [generateImage, setGenerateImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleAddSeason = () => {
    if (seasons.length >= 20) return;
    setSeasons([...seasons, { number: seasons.length + 1, watched: false, rating: 0 }]);
  };

  const handleRemoveSeason = () => {
    if (seasons.length <= 1) return;
    setSeasons(seasons.slice(0, -1));
  };

  const toggleSeasonWatched = (seasonNumber: number) => {
    setSeasons(
      seasons.map((season) =>
        season.number === seasonNumber
          ? { ...season, watched: !season.watched }
          : season
      )
    );
  };

  const handleSeasonRatingChange = (seasonNumber: number, newRating: number) => {
    setSeasons(
      seasons.map((season) =>
        season.number === seasonNumber
          ? { ...season, rating: newRating }
          : season
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    let finalImageUrl = imageUrl;
    
    // Generate image if requested and no image URL is provided
    if (generateImage && !imageUrl) {
      setIsGeneratingImage(true);
      try {
        finalImageUrl = await generateImageForTitle(title, type);
      } catch (error) {
        console.error("Failed to generate image:", error);
      } finally {
        setIsGeneratingImage(false);
      }
    }

    const mediaItem = {
      title,
      type,
      creator: creator || undefined,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      imageUrl: finalImageUrl || undefined,
      review: rating || review.trim() ? {
        rating,
        text: review,
        date: new Date().toISOString().split("T")[0],
      } : undefined,
      seasons: type === "tv" ? seasons : undefined,
    };

    addMediaItem(mediaItem);
    navigate("/profile");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-morph rounded-xl p-8"
        >
          <h1 className="text-2xl font-bold mb-6">Add New Media</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="media-type">Media Type</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Button
                    type="button"
                    variant={type === "movie" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setType("movie")}
                  >
                    <Film className="mr-2 h-4 w-4" />
                    Movie
                  </Button>
                  <Button
                    type="button"
                    variant={type === "tv" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setType("tv")}
                  >
                    <Tv className="mr-2 h-4 w-4" />
                    TV Show
                  </Button>
                  <Button
                    type="button"
                    variant={type === "book" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setType("book")}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Book
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creator">
                    {type === "movie"
                      ? "Director"
                      : type === "tv"
                      ? "Creator"
                      : "Author"}
                  </Label>
                  <Input
                    id="creator"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder={`Enter ${
                      type === "movie" ? "director" : type === "tv" ? "creator" : "author"
                    }`}
                  />
                </div>

                <div>
                  <Label htmlFor="year">
                    {type === "book" ? "Publication Year" : "Release Year"}
                  </Label>
                  <Input
                    id="year"
                    value={releaseYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value || /^\d+$/.test(value)) {
                        setReleaseYear(value);
                      }
                    }}
                    placeholder="Enter year"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="generate-image" className="text-sm cursor-pointer flex items-center">
                      <input
                        id="generate-image"
                        type="checkbox"
                        className="mr-2"
                        checked={generateImage}
                        onChange={(e) => setGenerateImage(e.target.checked)}
                      />
                      Auto-generate image
                    </Label>
                  </div>
                </div>
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={generateImage ? "Will be auto-generated from title" : "Enter image URL"}
                  disabled={generateImage}
                  className={generateImage ? "bg-muted" : ""}
                />
                {generateImage && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Image will be generated based on the title when you save
                  </p>
                )}
              </div>

              {type === "tv" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Seasons</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveSeason}
                        disabled={seasons.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSeason}
                        disabled={seasons.length >= 20}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    {seasons.map((season) => (
                      <div key={season.number} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`season-${season.number}`}
                              checked={season.watched}
                              onChange={() => toggleSeasonWatched(season.number)}
                              className="mr-2"
                            />
                            <Label htmlFor={`season-${season.number}`} className="cursor-pointer">
                              Season {season.number}
                            </Label>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label className="text-sm">Rating</Label>
                          <StarRating 
                            initialRating={season.rating || 0} 
                            onChange={(rating) => handleSeasonRatingChange(season.number, rating)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="rating">Overall Rating</Label>
                <div className="mt-2">
                  <StarRating initialRating={rating} onChange={setRating} />
                  {type === "tv" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      For TV shows, the overall rating will reflect the average of your season ratings
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="review">Review (max 200 words)</Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length <= 200 || words.length === 1) {
                      setReview(e.target.value);
                    }
                  }}
                  placeholder="Write your thoughts about this title..."
                  className="resize-none"
                  rows={5}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {review.trim().split(/\s+/).filter(Boolean).length}/200 words
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGeneratingImage}>
                {isGeneratingImage ? "Generating Image..." : "Save"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMedia;
