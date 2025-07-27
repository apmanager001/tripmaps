import {
  ApiResponse,
  AuthResponse,
  DashboardData,
  MapData,
  ProfileData,
  User,
  Coordinate,
  POI,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "API request failed");
  }

  return data;
}

// ===== AUTH API =====
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  logout: async (): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/logout", {
      method: "POST",
    });
  },

  verifyUser: async (): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/verifyUser");
  },
};

// ===== USER API =====
export const userApi = {
  getProfile: async (userId: string): Promise<ApiResponse<ProfileData>> => {
    return apiRequest<ApiResponse<ProfileData>>(`/users/profile/${userId}`);
  },

  updateProfile: async (
    userId: string,
    data: { username?: string; bio?: string; emailPrivate?: boolean }
  ): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>(`/users/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getDashboard: async (userId: string): Promise<DashboardData> => {
    return apiRequest<DashboardData>(`/users/dashboard/${userId}`);
  },

  searchUsers: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ users: User[]; pagination: any }>>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  getTopUsers: async (limit = 10): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>(`/users/top?limit=${limit}`);
  },

  deleteAccount: async (userId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ===== MAP API =====
export const mapApi = {
  createMap: async (mapData: {
    mapName: string;
    coordArray: Coordinate[];
    isPrivate?: boolean;
  }): Promise<ApiResponse<MapData>> => {
    return apiRequest<ApiResponse<MapData>>("/maps", {
      method: "POST",
      body: JSON.stringify(mapData),
    });
  },

  getMap: async (
    mapId: string
  ): Promise<
    ApiResponse<{
      map: MapData;
      pois: POI[];
      comments: any[];
      isBookmarked: boolean;
    }>
  > => {
    return apiRequest<
      ApiResponse<{
        map: MapData;
        pois: POI[];
        comments: any[];
        isBookmarked: boolean;
      }>
    >(`/maps/${mapId}`);
  },

  getUserMaps: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ maps: MapData[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ maps: MapData[]; pagination: any }>>(
      `/users/${userId}/maps?page=${page}&limit=${limit}`
    );
  },

  updateMap: async (
    mapId: string,
    data: { mapName?: string; isPrivate?: boolean }
  ): Promise<ApiResponse<MapData>> => {
    return apiRequest<ApiResponse<MapData>>(`/maps/${mapId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteMap: async (mapId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/maps/${mapId}`, {
      method: "DELETE",
    });
  },

  togglePrivacy: async (mapId: string): Promise<ApiResponse<MapData>> => {
    return apiRequest<ApiResponse<MapData>>(`/maps/${mapId}/privacy`, {
      method: "PATCH",
    });
  },

  searchMaps: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ maps: MapData[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ maps: MapData[]; pagination: any }>>(
      `/maps/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  getPopularMaps: async (limit = 10): Promise<ApiResponse<MapData[]>> => {
    return apiRequest<ApiResponse<MapData[]>>(`/maps/popular?limit=${limit}`);
  },

  likeMap: async (mapId: string): Promise<ApiResponse<MapData>> => {
    return apiRequest<ApiResponse<MapData>>(`/maps/${mapId}/like`, {
      method: "POST",
    });
  },
};

// ===== POI API =====
export const poiApi = {
  createPOI: async (poiData: {
    map_id: string;
    lat: number;
    lng: number;
    locationName?: string;
    date_visited?: Date;
    tags?: string[];
  }): Promise<ApiResponse<POI>> => {
    return apiRequest<ApiResponse<POI>>("/pois", {
      method: "POST",
      body: JSON.stringify(poiData),
    });
  },

  getPOI: async (
    poiId: string
  ): Promise<ApiResponse<{ poi: POI; tags: any[] }>> => {
    return apiRequest<ApiResponse<{ poi: POI; tags: any[] }>>(`/pois/${poiId}`);
  },

  updatePOI: async (
    poiId: string,
    data: {
      lat?: number;
      lng?: number;
      locationName?: string;
      date_visited?: Date;
      tags?: string[];
    }
  ): Promise<ApiResponse<POI>> => {
    return apiRequest<ApiResponse<POI>>(`/pois/${poiId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePOI: async (poiId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/pois/${poiId}`, {
      method: "DELETE",
    });
  },

  getPOIsByMap: async (mapId: string): Promise<ApiResponse<POI[]>> => {
    return apiRequest<ApiResponse<POI[]>>(`/maps/${mapId}/pois`);
  },

  searchPOIsByLocation: async (
    lat: number,
    lng: number,
    radius = 10,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: any }>>(
      `/pois/search/location?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`
    );
  },

  searchMapsByPOIName: async (
    poiName: string,
    page = 1,
    limit = 20
  ): Promise<
    ApiResponse<{ poiName: string; maps: any[]; pagination: any }>
  > => {
    return apiRequest<
      ApiResponse<{ poiName: string; maps: any[]; pagination: any }>
    >(`/pois/search/maps/${poiName}?page=${page}&limit=${limit}`);
  },

  likePOI: async (poiId: string): Promise<ApiResponse<POI>> => {
    return apiRequest<ApiResponse<POI>>(`/pois/${poiId}/like`, {
      method: "POST",
    });
  },

  // Legacy POI API for external services
  getNearbyPOIs: async (lat: number, lng: number): Promise<any[]> => {
    const response = await fetch(
      `https://trueway-places.p.rapidapi.com/FindPlacesNearby?location=${lat.toFixed(
        4
      )},${lng.toFixed(4)}&radius=60&language=en`,
      {
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPID_KEY || "",
          "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPID_HOST || "",
        },
      }
    );

    if (!response.ok) {
      throw new ApiError(response.status, "Failed to fetch POIs");
    }

    const data = await response.json();
    return data.results || [];
  },
};

// ===== SOCIAL API =====
export const socialApi = {
  // Friend management
  followUser: async (userId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/users/${userId}/follow`, {
      method: "POST",
    });
  },

  unfollowUser: async (userId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/users/${userId}/follow`, {
      method: "DELETE",
    });
  },

  getFollowers: async (
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ followers: any[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ followers: any[]; pagination: any }>>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    );
  },

  getFollowing: async (
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ following: any[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ following: any[]; pagination: any }>>(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    );
  },

  // Bookmark management
  bookmarkMap: async (mapId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/maps/${mapId}/bookmark`, {
      method: "POST",
    });
  },

  removeBookmark: async (mapId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/maps/${mapId}/bookmark`, {
      method: "DELETE",
    });
  },

  getUserBookmarks: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ bookmarks: any[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ bookmarks: any[]; pagination: any }>>(
      `/users/${userId}/bookmarks?page=${page}&limit=${limit}`
    );
  },

  // Comment management
  addComment: async (
    mapId: string,
    comment: string
  ): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/maps/${mapId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  },

  getMapComments: async (
    mapId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ comments: any[]; pagination: any }>> => {
    return apiRequest<ApiResponse<{ comments: any[]; pagination: any }>>(
      `/maps/${mapId}/comments?page=${page}&limit=${limit}`
    );
  },

  deleteComment: async (commentId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  // Comment like management
  likeComment: async (commentId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/comments/${commentId}/like`, {
      method: "POST",
    });
  },

  unlikeComment: async (commentId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/comments/${commentId}/like`, {
      method: "DELETE",
    });
  },
};

// ===== TAG API =====
export const tagApi = {
  getAllTags: async (): Promise<
    ApiResponse<{ _id: string; name: string }[]>
  > => {
    return apiRequest<ApiResponse<{ _id: string; name: string }[]>>("/tags");
  },

  createTag: async (
    name: string
  ): Promise<ApiResponse<{ _id: string; name: string }>> => {
    return apiRequest<ApiResponse<{ _id: string; name: string }>>("/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
};

// ===== HOMEPAGE API =====
export const homepageApi = {
  getPopularMaps: async (): Promise<ApiResponse<MapData[]>> => {
    return apiRequest<ApiResponse<MapData[]>>("/maps/popular");
  },

  getPopularLocations: async (): Promise<
    ApiResponse<{ _id: string; name: string; count: number }[]>
  > => {
    return apiRequest<
      ApiResponse<{ _id: string; name: string; count: number }[]>
    >("/pois/popular-locations");
  },

  getTopUsers: async (): Promise<
    ApiResponse<
      { _id: string; username: string; mapsCount: number; totalViews: number }[]
    >
  > => {
    return apiRequest<
      ApiResponse<
        {
          _id: string;
          username: string;
          mapsCount: number;
          totalViews: number;
        }[]
      >
    >("/users/top");
  },
};

// ===== LEGACY API (for backward compatibility) =====
export const legacyApi = {
  getDashboard: async (userId: string): Promise<DashboardData> => {
    return apiRequest<DashboardData>(`/dashboard/${userId}`);
  },

  createMap: async (mapData: {
    coordArray: Array<{ lat: number; lng: number; name?: string }>;
    userId: string;
    mapName: string;
  }): Promise<ApiResponse<MapData>> => {
    return apiRequest<ApiResponse<MapData>>("/mymaps", {
      method: "POST",
      body: JSON.stringify(mapData),
    });
  },

  togglePrivacy: async (mapId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/mapPrivacy/${mapId}/privacy`, {
      method: "PATCH",
    });
  },

  getMap: async (mapId: string): Promise<MapData[]> => {
    return apiRequest<MapData[]>(`/map/${mapId}`);
  },

  getProfile: async (userId: string): Promise<ProfileData> => {
    return apiRequest<ProfileData>(`/profile/${userId}`);
  },
};
