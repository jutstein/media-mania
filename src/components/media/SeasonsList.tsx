
import { Season } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface SeasonsListProps {
  seasons: Season[];
  isEditing: boolean;
  onSeasonToggle: (seasonNumber: number) => void;
  onSeasonRatingChange: (seasonNumber: number, rating: number) => void;
  onAddSeason: () => void;
  onRemoveSeason: () => void;
}

const SeasonsList = ({
  seasons,
  isEditing,
  onSeasonToggle,
  onSeasonRatingChange,
  onAddSeason,
  onRemoveSeason,
}: SeasonsListProps) => {
  // Calculate the average rating for TV shows
  const averageSeasonRating = seasons.length > 0
    ? seasons
        .filter(s => s.rating !== undefined && s.rating > 0)
        .reduce((sum, s) => sum + (s.rating || 0), 0) / 
        seasons.filter(s => s.rating !== undefined && s.rating > 0).length
    : 0;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Seasons</h3>
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <Label>Seasons</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemoveSeason}
                disabled={seasons.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddSeason}
                disabled={seasons.length >= 20}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {seasons.map((season) => (
            <div
              key={season.number}
              className="p-3 border rounded-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`season-${season.number}`}
                    checked={season.watched}
                    onCheckedChange={() => onSeasonToggle(season.number)}
                  />
                  <Label htmlFor={`season-${season.number}`} className="cursor-pointer">
                    Season {season.number}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`rating-${season.number}`} className="text-sm mr-2">
                    Rating:
                  </Label>
                  <StarRating 
                    initialRating={season.rating || 0} 
                    onChange={(rating) => onSeasonRatingChange(season.number, rating)}
                    size={18}
                  />
                </div>
              </div>
            </div>
          ))}
          {averageSeasonRating > 0 && (
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">Average season rating: {averageSeasonRating.toFixed(1)}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {seasons.map((season) => (
              <div
                key={season.number}
                className={`px-3 py-1 rounded-full text-sm ${
                  season.watched
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Season {season.number}
                {season.watched ? " ✓" : ""}
                {season.rating ? ` (${season.rating}★)` : ""}
              </div>
            ))}
          </div>
          {averageSeasonRating > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground">Average season rating: {averageSeasonRating.toFixed(1)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeasonsList;
