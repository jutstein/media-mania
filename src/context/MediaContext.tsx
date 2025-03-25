import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem, MediaType, User } from "@/types";
import { toast } from "sonner";

interface MediaContextType {
  movies: MediaItem[];
  tvShows: MediaItem[];
  books: MediaItem[];
  currentUser: User | null;
  users: User[];
  addMediaItem: (item: Omit<MediaItem, "id" | "addedDate">) => void;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  getMediaItemById: (id: string) => MediaItem | undefined;
  getMediaItemsByType: (type: MediaType) => MediaItem[];
  getUserMediaItems: (userId: string) => MediaItem[];
  setCurrentUser: (user: User | null) => void;
}

const mockUsers: User[] = [
  {
    id: "user1",
    name: "Jane Doe",
    profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Movie enthusiast and book lover",
  },
  {
    id: "user2",
    name: "John Smith",
    profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Sci-fi fanatic and film critic",
  },
];

const mockMedia: MediaItem[] = [
  {
    id: "movie1",
    title: "Inception",
    type: "movie",
    imageUrl: "https://via.placeholder.com/300x450?text=Inception",
    creator: "Christopher Nolan",
    releaseYear: 2010,
    addedDate: "2023-08-15",
    review: {
      rating: 5,
      text: "A mind-bending masterpiece that challenges perception and reality.",
      date: "2023-08-15",
    },
  },
  {
    id: "tv1",
    title: "Breaking Bad",
    type: "tv",
    imageUrl: "https://via.placeholder.com/300x450?text=Breaking+Bad",
    creator: "Vince Gilligan",
    releaseYear: 2008,
    addedDate: "2023-07-10",
    review: {
      rating: 5,
      text: "One of the greatest television shows ever made. Walter White's transformation is unparalleled.",
      date: "2023-07-10",
    },
    seasons: [
      { number: 1, watched: true },
      { number: 2, watched: true },
      { number: 3, watched: true },
      { number: 4, watched: true },
      { number: 5, watched: true },
    ],
  },
  {
    id: "book1",
    title: "Dune",
    type: "book",
    imageUrl: "https://via.placeholder.com/300x450?text=Dune",
    creator: "Frank Herbert",
    releaseYear: 1965,
    addedDate: "2023-09-05",
    review: {
      rating: 4,
      text: "An epic science fiction masterpiece with incredible world-building.",
      date: "2023-09-05",
    },
  },
];

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<MediaItem[]>([...mockMedia]);
  const [users, setUsers] = useState<User[]>([...mockUsers]);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);

  const movies = media.filter((item) => item.type === "movie");
  const tvShows = media.filter((item) => item.type === "tv");
  const books = media.filter((item) => item.type === "book");

  const addMediaItem = (item: Omit<MediaItem, "id" | "addedDate">) => {
    const newItem: MediaItem = {
      ...item,
      id: `${item.type}${Date.now()}`,
      addedDate: new Date().toISOString().split("T")[0],
    };
    
    setMedia((prev) => [...prev, newItem]);
    toast.success(`Added "${item.title}" to your list!`);
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMedia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    toast.success("Updated successfully!");
  };

  const deleteMediaItem = (id: string) => {
    const itemToDelete = media.find(item => item.id === id);
    setMedia((prev) => prev.filter((item) => item.id !== id));
    if (itemToDelete) {
      toast.success(`Removed "${itemToDelete.title}" from your list`);
    }
  };

  const getMediaItemById = (id: string) => {
    return media.find((item) => item.id === id);
  };

  const getMediaItemsByType = (type: MediaType) => {
    return media.filter((item) => item.type === type);
  };

  const getUserMediaItems = (userId: string) => {
    return media;
  };

  return (
    <MediaContext.Provider
      value={{
        movies,
        tvShows,
        books,
        currentUser,
        users,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        getMediaItemById,
        getMediaItemsByType,
        getUserMediaItems,
        setCurrentUser,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
