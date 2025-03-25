import { motion } from "framer-motion";
import { useMedia } from "@/context/MediaContext";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Film, Tv, BookOpen } from "lucide-react";

const Home = () => {
  const { movies, tvShows, books } = useMedia();

  // Get recent media across all types, sorted by added date
  const recentMedia = [...movies, ...tvShows, ...books]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 6);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/10 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070')] bg-cover bg-center opacity-10 z-[-1]"></div>
        
        <div className="container relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Track What You Watch & Read
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
          >
            Your personal media library for movies, TV shows, and books.
            Rate, review, and share what you love.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/add">
                <PlusCircle className="h-5 w-5" />
                Add New Media
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/profile">View Your Collection</Link>
            </Button>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Recent Media Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Recently Added</h2>
            <Button asChild variant="ghost">
              <Link to="/profile">View All</Link>
            </Button>
          </div>
          
          {recentMedia.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
            >
              {recentMedia.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <MediaCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No media added yet.</p>
              <Button asChild>
                <Link to="/add">Add Your First Item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Browse Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-morph rounded-xl p-8 text-center"
            >
              <Film className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Movies</h3>
              <p className="text-muted-foreground mb-4">
                Track and rate your favorite films from any genre.
              </p>
              <Button asChild variant="outline">
                <Link to="/movies">Browse Movies</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-morph rounded-xl p-8 text-center"
            >
              <Tv className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">TV Shows</h3>
              <p className="text-muted-foreground mb-4">
                Keep track of which seasons you've watched across series.
              </p>
              <Button asChild variant="outline">
                <Link to="/tv-shows">Browse Shows</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-morph rounded-xl p-8 text-center"
            >
              <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Books</h3>
              <p className="text-muted-foreground mb-4">
                Log your reading journey and share literary thoughts.
              </p>
              <Button asChild variant="outline">
                <Link to="/books">Browse Books</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
