
import { useParams, Link } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Film, Tv, BookOpen } from "lucide-react";
import { MediaType } from "@/types";
import { motion } from "framer-motion";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { movies, tvShows, books } = useMedia();

  // Map category from URL to media type
  let mediaType: MediaType = "movie";
  let pageTitle = "Movies";
  let icon = <Film className="h-6 w-6 mb-1" />;
  let items = movies;

  if (category === "tv-shows") {
    mediaType = "tv";
    pageTitle = "TV Shows";
    icon = <Tv className="h-6 w-6 mb-1" />;
    items = tvShows;
  } else if (category === "books") {
    mediaType = "book";
    pageTitle = "Books";
    icon = <BookOpen className="h-6 w-6 mb-1" />;
    items = books;
  }

  console.log("Category:", category);
  console.log("Media type:", mediaType);
  console.log("Items count:", items.length);
  console.log("Movies count:", movies.length);
  console.log("TV shows count:", tvShows.length);
  console.log("Books count:", books.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold flex items-center gap-2"
          >
            {icon}
            {pageTitle}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild>
              <Link to="/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </Button>
          </motion.div>
        </div>

        {items.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MediaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {`You haven't added any ${mediaType === "movie" ? "movies" : mediaType === "tv" ? "TV shows" : "books"} yet.`}
            </p>
            <Button asChild>
              <Link to="/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First {mediaType === "movie" ? "Movie" : mediaType === "tv" ? "TV Show" : "Book"}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
