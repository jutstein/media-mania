
import { useState } from "react";
import { Link } from "react-router-dom";
import { MediaItem } from "@/types";
import StarRating from "@/components/StarRating";
import { motion } from "framer-motion";
import { Book, Film, Tv } from "lucide-react";

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard = ({ item }: MediaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconMap = {
    movie: <Film className="text-primary h-5 w-5" />,
    tv: <Tv className="text-primary h-5 w-5" />,
    book: <Book className="text-primary h-5 w-5" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="media-card relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1.5">
        {iconMap[item.type]}
      </div>
      
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            {iconMap[item.type]}
          </div>
        )}
        
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end text-white transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.review && (
            <StarRating initialRating={item.review.rating} readonly size={16} />
          )}
          <Link to={`/media/${item.id}`} className="absolute inset-0 z-10" aria-label={`View details for ${item.title}`}></Link>
        </div>
      </div>
      
      <h3 className="font-medium text-lg line-clamp-1">{item.title}</h3>
      
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{item.creator || "Unknown"}</span>
        <span>{item.releaseYear || ""}</span>
      </div>
      
      {item.type === "tv" && item.seasons && (
        <div className="mt-2 text-xs text-muted-foreground">
          {item.seasons.filter(s => s.watched).length} of {item.seasons.length} seasons watched
        </div>
      )}
    </motion.div>
  );
};

export default MediaCard;
