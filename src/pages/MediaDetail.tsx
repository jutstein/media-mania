
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Share,
  ArrowLeft,
  Book,
  Film,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { Season } from "@/types";
import { motion } from "framer-motion";

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMediaItemById, updateMediaItem, deleteMediaItem, generateImageForTitle } = useMedia();
  
  const mediaItem = getMediaItemById(id || "");
  
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(mediaItem?.review?.rating || 0);
  const [reviewText, setReviewText] = useState(mediaItem?.review?.text || "");
  const [watchedSeasons, setWatchedSeasons] = useState<Season[]>(
    mediaItem?.seasons || []
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (!mediaItem) {
      navigate("/not-found");
    }
  }, [mediaItem, navigate]);

  useEffect(() => {
    if (mediaItem?.seasons) {
      setWatchedSeasons(mediaItem.seasons);
    }
  }, [mediaItem]);

  if (!mediaItem) {
    return null;
  }

  const handleSaveReview = () => {
    updateMediaItem(mediaItem.id, {
      review: {
        rating,
        text: reviewText,
        date: new Date().toISOString().split("T")[0],
      },
      ...(mediaItem.type === "tv" && { seasons: watchedSeasons }),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMediaItem(mediaItem.id);
    navigate(-1);
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

  const handleGenerateImage = async () => {
    if (!mediaItem.title) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImageForTitle(mediaItem.title, mediaItem.type);
      updateMediaItem(mediaItem.id, { imageUrl });
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. Please try again later.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const iconMap = {
    movie: <Film className="h-6 w-6" />,
    tv: <Tv className="h-6 w-6" />,
    book: <Book className="h-6 w-6" />,
  };

  // Calculate the average rating for TV shows
  const averageSeasonRating = watchedSeasons.length > 0
    ? watchedSeasons
        .filter(s => s.rating !== undefined && s.rating > 0)
        .reduce((sum, s) => sum + (s.rating || 0), 0) / 
        watchedSeasons.filter(s => s.rating !== undefined && s.rating > 0).length
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Media Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 flex flex-col"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden glass-morph p-1 mb-4">
              {mediaItem.imageUrl ? (
                <img
                  src={mediaItem.imageUrl}
                  alt={mediaItem.title}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="h-full w-full bg-muted flex flex-col items-center justify-center rounded-lg text-center p-4">
                  {iconMap[mediaItem.type]}
                  <p className="mt-4 text-sm text-muted-foreground">No image available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? "Generating..." : "Generate Image"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <Button onClick={() => setIsEditing(!isEditing)}>
                <Pencil className="mr-2 h-4 w-4" />
                {isEditing ? "Cancel Editing" : "Edit Review"}
              </Button>

              <Button variant="outline" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete "{mediaItem.title}" from your collection.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Media Details and Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
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
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Seasons</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    {watchedSeasons.map((season) => (
                      <div
                        key={season.number}
                        className="p-3 border rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`season-${season.number}`}
                              checked={season.watched}
                              onCheckedChange={() => handleSeasonToggle(season.number)}
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
                              onChange={(rating) => handleSeasonRatingChange(season.number, rating)}
                              size={18}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {mediaItem.type === "tv" && averageSeasonRating > 0 && (
                      <div className="mt-3 text-sm">
                        <p className="text-muted-foreground">Average season rating: {averageSeasonRating.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mediaItem.seasons.map((season) => (
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
                    {mediaItem.type === "tv" && averageSeasonRating > 0 && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Average season rating: {averageSeasonRating.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Review Section */}
            <div className="glass-morph rounded-xl p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Your Review</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="mt-2">
                      <StarRating initialRating={rating} onChange={setRating} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="review">Review (max 200 words)</Label>
                    <Textarea
                      id="review"
                      value={reviewText}
                      onChange={(e) => {
                        const words = e.target.value.trim().split(/\s+/);
                        if (words.length <= 200 || words.length === 1) {
                          setReviewText(e.target.value);
                        }
                      }}
                      placeholder="Write your thoughts about this title..."
                      className="mt-2 resize-none"
                      rows={6}
                    />
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {reviewText.trim().split(/\s+/).filter(Boolean).length}/200 words
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveReview}>Save Review</Button>
                  </div>
                </div>
              ) : mediaItem.review ? (
                <div>
                  <div className="mb-4">
                    <StarRating initialRating={mediaItem.review.rating} readonly />
                    <div className="text-sm text-muted-foreground mt-1">
                      Reviewed on {mediaItem.review.date}
                    </div>
                  </div>

                  <p className="whitespace-pre-line">{mediaItem.review.text}</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't reviewed this yet.</p>
                  <Button onClick={() => setIsEditing(true)}>Add Review</Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
