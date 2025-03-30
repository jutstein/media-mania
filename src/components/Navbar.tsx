
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Film, Tv, User, LogOut, Search, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset search when popover closes
  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Search for users with a username containing the query (case insensitive)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${value}%`)
        .limit(10);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching for users:", err);
      setSearchResults([]); // Ensure searchResults is always an array
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    // Close the popover before navigating to prevent any state issues
    setIsSearchOpen(false);
    // Reset search state
    setQuery("");
    setSearchResults([]);
    // Navigate after a small delay to ensure state is cleared
    setTimeout(() => {
      navigate(`/profile/${userId}`);
    }, 0);
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
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search users..."
                  value={query}
                  onValueChange={handleSearch}
                  autoFocus
                />
                <CommandList>
                  {query.trim() !== "" && (
                    <>
                      {isLoading ? (
                        <div className="py-6 text-center">
                          <p className="text-sm text-muted-foreground">Searching...</p>
                        </div>
                      ) : (
                        <>
                          {searchResults.length === 0 ? (
                            <CommandEmpty>No users found</CommandEmpty>
                          ) : (
                            <CommandGroup heading="Users">
                              {searchResults.map((profile) => (
                                <CommandItem
                                  key={profile.id}
                                  onSelect={() => handleSelectUser(profile.id)}
                                  className="cursor-pointer"
                                  value={profile.username || profile.id}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={profile.avatar_url || ""} />
                                      <AvatarFallback>
                                        {profile.username?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{profile.username || "User"}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
