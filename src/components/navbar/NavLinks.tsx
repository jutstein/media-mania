
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Film, Tv } from "lucide-react";

export const NavLinks = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link
        to="/movies"
        className={`nav-link ${isActive("/movies") ? "active" : ""}`}
      >
        <span className="flex items-center gap-1.5">
          <Film className="h-4 w-4" />
          Movies
        </span>
      </Link>
      <Link
        to="/tv-shows"
        className={`nav-link ${isActive("/tv-shows") ? "active" : ""}`}
      >
        <span className="flex items-center gap-1.5">
          <Tv className="h-4 w-4" />
          TV Shows
        </span>
      </Link>
      <Link
        to="/books"
        className={`nav-link ${isActive("/books") ? "active" : ""}`}
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          Books
        </span>
      </Link>
    </nav>
  );
};
