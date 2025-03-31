
import { useState } from "react";
import { MediaItem, MediaType, Season } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Film, Tv, Book } from "lucide-react";
import SeasonsList from "./SeasonsList";

interface MediaDetailsSectionProps {
  mediaItem: MediaItem;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<string | undefined>;
}

const MediaDetailsSection = ({ mediaItem, updateMediaItem }: MediaDetailsSectionProps) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(mediaItem?.title || "");
  const [editCreator, setEditCreator] = useState(mediaItem?.creator || "");
  const [editReleaseYear, setEditReleaseYear] = useState(mediaItem?.releaseYear?.toString() || "");
  const [editType, setEditType] = useState<MediaType>(mediaItem?.type || "movie");
  const [watchedSeasons, setWatchedSeasons] = useState<Season[]>(
    mediaItem?.seasons || []
  );

  const handleSaveDetails = () => {
    // Validate year input
    const releaseYear = editReleaseYear ? parseInt(editReleaseYear) : undefined;
    
    updateMediaItem(mediaItem.id, {
      title: editTitle,
      creator: editCreator || undefined,
      releaseYear: releaseYear,
      type: editType,
      seasons: watchedSeasons,
    });
    setIsEditingDetails(false);
  };

  const handleSeasonToggle = (seasonNumber: number) => {
    setWatchedSeasons((prev) =>
      prev.map((season) =>
        season.number === seasonNumber
          ? { ...season, watched: !season.watched }
          : season
      )
    );
  };

  const handleSeasonRatingChange = (seasonNumber: number, newRating: number) => {
    setWatchedSeasons((prev) =>
      prev.map((season) =>
        season.number === seasonNumber
          ? { ...season, rating: newRating }
          : season
      )
    );
  };
  
  const handleAddSeason = () => {
    if (watchedSeasons.length >= 20) return;
    setWatchedSeasons([...watchedSeasons, { number: watchedSeasons.length + 1, watched: false, rating: 0 }]);
  };

  const handleRemoveSeason = () => {
    if (watchedSeasons.length <= 1) return;
    setWatchedSeasons(watchedSeasons.slice(0, -1));
  };

  const iconMap = {
    movie: <Film className="h-6 w-6" />,
    tv: <Tv className="h-6 w-6" />,
    book: <Book className="h-6 w-6" />,
  };

  return (
    <>
      {/* Edit Details Form */}
      {isEditingDetails ? (
        <div className="glass-morph rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="media-type">Media Type</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <Button
                  type="button"
                  variant={editType === "movie" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setEditType("movie")}
                >
                  <Film className="mr-2 h-4 w-4" />
                  Movie
                </Button>
                <Button
                  type="button"
                  variant={editType === "tv" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setEditType("tv")}
                >
                  <Tv className="mr-2 h-4 w-4" />
                  TV Show
                </Button>
                <Button
                  type="button"
                  variant={editType === "book" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setEditType("book")}
                >
                  <Book className="mr-2 h-4 w-4" />
                  Book
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="creator">
                {editType === "movie"
                  ? "Director"
                  : editType === "tv"
                  ? "Creator"
                  : "Author"}
              </Label>
              <Input
                id="creator"
                value={editCreator}
                onChange={(e) => setEditCreator(e.target.value)}
                placeholder={`Enter ${
                  editType === "movie" ? "director" : editType === "tv" ? "creator" : "author"
                }`}
              />
            </div>
            
            <div>
              <Label htmlFor="year">
                {editType === "book" ? "Publication Year" : "Release Year"}
              </Label>
              <Input
                id="year"
                value={editReleaseYear}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || /^\d+$/.test(value)) {
                    setEditReleaseYear(value);
                  }
                }}
                placeholder="Enter year"
                maxLength={4}
              />
            </div>
            
            {/* TV Show Seasons editing */}
            {editType === "tv" && (
              <SeasonsList 
                seasons={watchedSeasons}
                isEditing={true}
                onSeasonToggle={handleSeasonToggle}
                onSeasonRatingChange={handleSeasonRatingChange}
                onAddSeason={handleAddSeason}
                onRemoveSeason={handleRemoveSeason}
              />
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setEditTitle(mediaItem.title);
                setEditCreator(mediaItem.creator || "");
                setEditReleaseYear(mediaItem.releaseYear?.toString() || "");
                setEditType(mediaItem.type);
                setIsEditingDetails(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveDetails}>Save Details</Button>
            </div>
          </div>
        </div>
      ) : (
        // Display media details when not editing
        <>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="flex items-center">
              {iconMap[mediaItem.type]}
              <span className="ml-1 capitalize">{mediaItem.type}</span>
            </span>
            {mediaItem.releaseYear && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{mediaItem.releaseYear}</span>
              </>
            )}
            {mediaItem.creator && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{mediaItem.creator}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{mediaItem.title}</h1>

          {/* TV Show Seasons */}
          {mediaItem.type === "tv" && mediaItem.seasons && (
            <SeasonsList 
              seasons={mediaItem.seasons}
              isEditing={false}
              onSeasonToggle={() => {}}
              onSeasonRatingChange={() => {}}
              onAddSeason={() => {}}
              onRemoveSeason={() => {}}
            />
          )}
        </>
      )}

      <Button onClick={() => setIsEditingDetails(!isEditingDetails)} className="mb-4">
        {isEditingDetails ? "Cancel Editing Details" : "Edit Details"}
      </Button>
    </>
  );
};

export default MediaDetailsSection;
