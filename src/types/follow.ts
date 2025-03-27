
export interface FollowCounts {
  followers: number;
  following: number;
}

export interface ProfileWithFollow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
}
