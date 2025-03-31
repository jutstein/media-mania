
import { useState } from "react";
import { MediaItem, MediaType, Season } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MediaTypeSelector from "./MediaTypeSelector";
import SeasonsList from "./SeasonsList";

interface MediaEditFormProps {
  mediaItem: MediaItem;
  onSave: (updates: Partial<MediaItem>) => void;
  onCancel: () => void;
}

const MediaEditForm = ({ mediaItem, onSave, onCancel }: MediaEditFormProps) => {
  const [editTitle, setEditTitle] = useState(mediaItem.title || "");
  const [editCreator, setEditCreator] = useState(mediaItem.creator || "");
  const [editReleaseYear, setEditReleaseYear] = useState(mediaItem.releaseYear?.toString() || "");
  const [editType, setEditType] = useState<MediaType>(mediaItem.type || "movie");
  const [watchedSeasons, setWatchedSeasons] = useState<Season[]>(
    mediaItem.seasons || []
  );

  const handleSaveDetails = () => {
    // Validate year input
    const releaseYear = editReleaseYear ? parseInt(editReleaseYear) : undefined;
    
    onSave({
      title: editTitle,
      creator: editCreator || undefined,
      releaseYear: releaseYear,
      type: editType,
      seasons: watchedSeasons,
    });
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

  return (
    <div className="glass-morph rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Edit Details</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="media-type">Media Type</Label>
          <MediaTypeSelector 
            selectedType={editType}
            onChange={(type) => setEditType(type)}
          />
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveDetails}>Save Details</Button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditForm;
