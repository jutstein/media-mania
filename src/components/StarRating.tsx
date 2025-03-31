
import { useState, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  allowHalfStars?: boolean;
}

const StarRating = ({
  initialRating = 0,
  onChange,
  readonly = false,
  size = 24,
  allowHalfStars = true,
}: StarRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, index: number) => {
    if (readonly) return;

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - left;
    
    // If click position is in the left half of the star
    if (allowHalfStars && position < width / 2) {
      setHover(index - 0.5);
    } else {
      setHover(index);
    }
  };

  const handleClick = (e: React.MouseEvent<SVGElement>, index: number) => {
    if (readonly) return;

    let newRating;
    
    if (allowHalfStars) {
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const position = e.clientX - left;
      
      // If click position is in the left half of the star
      if (position < width / 2) {
        newRating = index - 0.5;
      } else {
        newRating = index;
      }
      
      // Toggle off if clicking the same value
      if (newRating === rating) {
        newRating = 0;
      }
    } else {
      // For full stars only
      newRating = rating === index ? 0 : index;
    }

    setRating(newRating);
    onChange?.(newRating);
  };

  const renderStar = (index: number) => {
    const fillStar = index <= Math.floor(hover || rating);
    const halfStar = allowHalfStars && 
      (Math.ceil(hover || rating) === index && 
      !Number.isInteger(hover || rating));
    
    const starProps = {
      size,
      className: `${
        fillStar || halfStar
          ? "text-yellow-400" 
          : "text-gray-300"
      } ${readonly ? "cursor-default" : "cursor-pointer"}`,
      onClick: (e: React.MouseEvent<SVGElement>) => handleClick(e, index),
      onMouseMove: (e: React.MouseEvent<SVGElement>) => handleMouseMove(e, index),
      onMouseEnter: () => !readonly && setHover(index),
      onMouseLeave: () => !readonly && setHover(0),
      "data-testid": `star-${index}`
    };
    
    return fillStar ? (
      <Star key={`star-${index}`} fill="currentColor" {...starProps} />
    ) : halfStar ? (
      <div key={`star-half-${index}`} className="relative">
        <Star {...starProps} className="text-gray-300" />
        <StarHalf 
          {...starProps} 
          className="text-yellow-400 fill-yellow-400 absolute top-0 left-0"
        />
      </div>
    ) : (
      <Star key={`star-${index}`} {...starProps} />
    );
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default StarRating;
