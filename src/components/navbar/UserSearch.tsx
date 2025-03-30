
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export const UserSearch = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset search when popover closes
  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

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
  );
};
