
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Film, Tv, User, LogOut, Search, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link to="/" className="font-semibold text-xl tracking-tight mr-6">
            MediaTrackr
          </Link>

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
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`relative transition-all duration-300 ${
              isSearchOpen ? "w-64" : "w-8"
            }`}
          >
            {isSearchOpen ? (
              <Input
                type="text"
                placeholder="Search media..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute ${isSearchOpen ? "left-0" : "left-0 right-0"} top-0 bottom-0`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" alt={user.email || ''} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
