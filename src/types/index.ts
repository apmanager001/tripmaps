// User related types
export interface User {
  _id: string;
  username: string;
  email: string;
  emailPrivate?: boolean;
  role: "member" | "admin" | "moderator";
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

// Map related types
export interface Coordinate {
  lat: number;
  lng: number;
  name?: string;
  locationName?: string;
  date_visited?: Date;
}

export interface MapData {
  _id: string;
  mapName: string;
  user_id: string | User;
  likes: number;
  views: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MapResponse {
  success: boolean;
  data: MapData[];
  message?: string;
}

// POI related types
export interface POI {
  _id: string;
  map_id: string | MapData;
  lat: number;
  lng: number;
  locationName?: string;
  date_visited?: Date;
  likes: number;
  user_id: string | User;
  createdAt: string;
  updatedAt: string;
}

// Social types
export interface Friend {
  _id: string;
  following_user_id: string | User;
  followed_user_id: string | User;
  createdAt: string;
}

export interface Follower {
  _id: string;
  user_id: string | User;
  createdAt: string;
}

export interface Following {
  _id: string;
  user_id: string | User;
  createdAt: string;
}

export interface Bookmark {
  _id: string;
  user_id: string | User;
  map_id: string | MapData;
}

export interface MapComment {
  _id: string;
  map_id: string | MapData;
  user_id: string | User;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  map_id: string | MapData;
  user_id: string | User;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentLike {
  _id: string;
  comment_id: string | MapComment;
  user_id: string | User;
  createdAt: string;
}

// Tag types
export interface Tag {
  _id: string;
  name: string;
}

export interface POITag {
  _id: string;
  poi_id: string | POI;
  tag_id: string | Tag;
}

// Edit history types
export interface EditHistory {
  _id: string;
  user_id: string | User;
  target_type: "map" | "poi";
  target_id: string;
  change_summary: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard types
export interface DashboardData {
  user: User;
  maps: MapData[];
  friends: Friend[];
  bookmarks: Bookmark[];
}

// Profile types
export interface ProfileData {
  user: User;
  maps: MapData[];
  stats: {
    followers: number;
    following: number;
    totalMaps: number;
  };
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Search result types
export interface SearchResults<T> {
  data: T[];
  pagination: Pagination;
}

// Zustand store types
export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (userData: User | null) => void;
  clearUser: () => void;
}

// Component props types
export interface MapComponentProps {
  coordArray: Coordinate[];
  setCoordArray?: (
    coords: Coordinate[] | ((prev: Coordinate[]) => Coordinate[])
  ) => void;
}

export interface ShareButtonsProps {
  id: string;
  name: string;
}

export interface PrivateToggleProps {
  isPrivate: boolean;
  id: string;
  onToggle: () => void;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface CreateMapFormData {
  mapName: string;
  coordArray: Coordinate[];
  isPrivate?: boolean;
}

export interface CreatePOIFormData {
  map_id: string;
  lat: number;
  lng: number;
  locationName?: string;
  date_visited?: Date;
  tags?: string[];
}

export interface UpdateProfileFormData {
  username?: string;
  bio?: string;
  emailPrivate?: boolean;
}

// API endpoint types
export interface MapWithDetails {
  map: MapData;
  pois: POI[];
  comments: MapComment[];
  isBookmarked: boolean;
}

export interface MapWithPOI {
  _id: string;
  mapName: string;
  user_id: {
    _id: string;
    username: string;
  };
  isPrivate: boolean;
  createdAt: string;
  pois: POI[];
}

export interface POIWithTags {
  poi: POI;
  tags: Tag[];
}

export interface UserStats {
  followers: number;
  following: number;
  totalMaps: number;
  totalLikes: number;
  totalViews: number;
}

// External API types
export interface ExternalPOI {
  name: string;
  address: string;
  rating?: number;
  types?: string[];
  place_id?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
