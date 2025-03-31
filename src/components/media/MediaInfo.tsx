
import { MediaItem } from "@/types";
import { Film, Tv, Book } from "lucide-react";
import SeasonsList from "./SeasonsList";

interface MediaInfoProps {
  mediaItem: MediaItem;
}

const MediaInfo = ({ mediaItem }: MediaInfoProps) => {
  const iconMap = {
    movie: <Film className="h-6 w-6" />,
    tv: <Tv className="h-6 w-6" />,
    book: <Book className="h-6 w-6" />,
  };

  return (
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
  );
};

export default MediaInfo;
