import {
  ApiResponse,
  AuthResponse,
  DashboardData,
  MapData,
  ProfileData,
  User,
  Coordinate,
  POI,
  Pagination,
  Comment,
  Tag,
  MapWithPOI,
  Follower,
  Following,
  NearbyPOI,
  Bookmark,
  Flag,
  FlagResponse,
  FlagCheckResponse,
  Contact,
  ContactStats,
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

  // Profile picture functions
  uploadProfilePicture: async (
    profilePictureFile: File
  ): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append("profilePicture", profilePictureFile);

    return fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then((res) => res.json());
  },

  deleteProfilePicture: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>("/users/profile-picture", {
      method: "DELETE",
    });
  },

  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>(`/users/${userId}/profile`);
  },

  updateUserProfile: async (data: {
    bio?: string;
    emailPrivate?: boolean;
  }): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  searchUsers: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ users: User[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ users: User[]; pagination: Pagination }>>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  getTopUsers: async (limit = 10): Promise<ApiResponse<User[]>> => {
    return apiRequest<ApiResponse<User[]>>(`/users/top?limit=${limit}`);
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
      comments: Comment[];
      isBookmarked: boolean;
    }>
  > => {
    return apiRequest<
      ApiResponse<{
        map: MapData;
        pois: POI[];
        comments: Comment[];
        isBookmarked: boolean;
      }>
    >(`/maps/${mapId}`);
  },

  getUserMaps: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ maps: MapData[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ maps: MapData[]; pagination: Pagination }>>(
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
  ): Promise<ApiResponse<{ maps: MapData[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ maps: MapData[]; pagination: Pagination }>>(
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
    map_id?: string;
    lat: number;
    lng: number;
    locationName?: string;
    date_visited?: Date;
    tags?: string[];
    description?: string;
    googleMapsLink?: string;
    isPrivate?: boolean;
  }): Promise<ApiResponse<POI>> => {
    return apiRequest<ApiResponse<POI>>("/pois", {
      method: "POST",
      body: JSON.stringify(poiData),
    });
  },

  getPOI: async (
    poiId: string
  ): Promise<ApiResponse<{ poi: POI; tags: Tag[] }>> => {
    return apiRequest<ApiResponse<{ poi: POI; tags: Tag[] }>>(`/pois/${poiId}`);
  },

  updatePOI: async (
    poiId: string,
    data: {
      lat?: number;
      lng?: number;
      locationName?: string;
      date_visited?: Date;
      tags?: string[];
      description?: string;
      googleMapsLink?: string;
      isPrivate?: boolean;
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

  getUserPOIs: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/user?page=${page}&limit=${limit}`
    );
  },

  searchUserPOIs: async (
    query: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/user/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
  },

  searchPOIsByLocation: async (
    lat: number,
    lng: number,
    radius = 10,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/search/location?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`
    );
  },

  searchPOIsByName: async (
    query: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/search/name?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
  },

  searchPOIsComprehensive: async (
    query: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  searchPOIs: async (
    query: string,
    options: { isPrivate?: boolean; page?: number; limit?: number } = {}
  ): Promise<ApiResponse<{ pois: POI[]; pagination: Pagination }>> => {
    const { isPrivate = undefined, page = 1, limit = 20 } = options;
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...(isPrivate !== undefined && { isPrivate: isPrivate.toString() }),
    });

    return apiRequest<ApiResponse<{ pois: POI[]; pagination: Pagination }>>(
      `/pois/search?${params.toString()}`
    );
  },

  searchMapsByPOIName: async (
    poiName: string,
    page = 1,
    limit = 20
  ): Promise<
    ApiResponse<{ poiName: string; maps: MapWithPOI[]; pagination: Pagination }>
  > => {
    return apiRequest<
      ApiResponse<{
        poiName: string;
        maps: MapWithPOI[];
        pagination: Pagination;
      }>
    >(`/pois/search/maps/${poiName}?page=${page}&limit=${limit}`);
  },

  likePOI: async (poiId: string): Promise<ApiResponse<POI>> => {
    return apiRequest<ApiResponse<POI>>(`/pois/${poiId}/like`, {
      method: "POST",
    });
  },

  addPOIToMap: async (mapId: string, poiId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/maps/${mapId}/pois/${poiId}`, {
      method: "POST",
    });
  },

  // Upload photo to POI
  uploadPhoto: async (
    poiId: string,
    photoFile: File,
    cropData?: { x: number; y: number; width: number; height: number } | null,
    isPrimary: boolean = false,
    dateVisited?: string
  ): Promise<
    ApiResponse<{ photo: { _id: string; s3Url: string; thumbnailUrl: string } }>
  > => {
    const formData = new FormData();
    formData.append("photo", photoFile);
    if (cropData) {
      formData.append("cropData", JSON.stringify(cropData));
    }
    formData.append("isPrimary", isPrimary.toString());
    if (dateVisited) {
      formData.append("date_visited", dateVisited);
    }

    return fetch(`${process.env.NEXT_PUBLIC_BACKEND}/pois/${poiId}/photos`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then((res) => res.json());
  },

  deletePhoto: async (
    photoId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND}/photos/${photoId}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  setPrimaryPhoto: async (
    photoId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/photos/${photoId}/primary`,
      {
        method: "PATCH",
        credentials: "include",
      }
    ).then((res) => res.json());
  },

  // Legacy POI API for external services
  getNearbyPOIs: async (lat: number, lng: number): Promise<NearbyPOI[]> => {
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

    const data: { results?: NearbyPOI[] } = await response.json();
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
  ): Promise<
    ApiResponse<{ followers: Follower[]; pagination: Pagination }>
  > => {
    return apiRequest<
      ApiResponse<{ followers: Follower[]; pagination: Pagination }>
    >(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  },

  getFollowing: async (
    userId: string,
    page = 1,
    limit = 20
  ): Promise<
    ApiResponse<{ following: Following[]; pagination: Pagination }>
  > => {
    return apiRequest<
      ApiResponse<{ following: Following[]; pagination: Pagination }>
    >(`/users/${userId}/following?page=${page}&limit=${limit}`);
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
  ): Promise<
    ApiResponse<{ bookmarks: Bookmark[]; pagination: Pagination }>
  > => {
    return apiRequest<
      ApiResponse<{ bookmarks: Bookmark[]; pagination: Pagination }>
    >(`/users/${userId}/bookmarks?page=${page}&limit=${limit}`);
  },

  // Comment management
  addComment: async (
    mapId: string,
    comment: string
  ): Promise<ApiResponse<Comment>> => {
    return apiRequest<ApiResponse<Comment>>(`/maps/${mapId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  },

  getMapComments: async (
    mapId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ comments: Comment[]; pagination: Pagination }>> => {
    return apiRequest<
      ApiResponse<{ comments: Comment[]; pagination: Pagination }>
    >(`/maps/${mapId}/comments?page=${page}&limit=${limit}`);
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

// ===== STRIPE API =====
export const stripeApi = {
  createCheckoutSession: async (
    userId: string
  ): Promise<ApiResponse<{ sessionId: string; url: string }>> => {
    return apiRequest<ApiResponse<{ sessionId: string; url: string }>>(
      "/stripe/create-checkout-session",
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
  },

  getSubscriptionStatus: async (
    userId: string
  ): Promise<
    ApiResponse<{
      subscriptionStatus: string;
      currentPeriodEnd: string | null;
      stripeCustomerId: string | null;
    }>
  > => {
    return apiRequest<
      ApiResponse<{
        subscriptionStatus: string;
        currentPeriodEnd: string | null;
        stripeCustomerId: string | null;
      }>
    >(`/stripe/subscription/${userId}`);
  },

  cancelSubscription: async (userId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/stripe/cancel-subscription", {
      method: "POST",
      body: JSON.stringify({ userId }),
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

  getPopularPOIs: async (): Promise<
    ApiResponse<
      {
        _id: string;
        locationName: string;
        likes: string[];
        likesCount: number;
        photos: Array<{
          _id: string;
          s3Url?: string;
          thumbnailUrl?: string;
          fullUrl?: string;
        }>;
        user_id: {
          _id: string;
          username: string;
        };
        map_id: {
          _id: string;
          mapName: string;
        };
      }[]
    >
  > => {
    return apiRequest<
      ApiResponse<
        {
          _id: string;
          locationName: string;
          likes: string[];
          likesCount: number;
          photos: Array<{
            _id: string;
            s3Url?: string;
            thumbnailUrl?: string;
            fullUrl?: string;
          }>;
          user_id: {
            _id: string;
            username: string;
          };
          map_id: {
            _id: string;
            mapName: string;
          };
        }[]
      >
    >("/pois/popular");
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

// ===== FLAG API =====
export const flagApi = {
  createFlag: async (data: {
    photoId: string;
    reason?: string;
    details?: string;
  }): Promise<ApiResponse<Flag>> => {
    return apiRequest<ApiResponse<Flag>>("/flags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAllFlags: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FlagResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    return apiRequest<ApiResponse<FlagResponse>>(
      `/flags?${searchParams.toString()}`
    );
  },

  updateFlagStatus: async (
    flagId: string,
    data: { status: string; adminNotes?: string }
  ): Promise<ApiResponse<Flag>> => {
    return apiRequest<ApiResponse<Flag>>(`/flags/${flagId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getFlagsByUser: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FlagResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    return apiRequest<ApiResponse<FlagResponse>>(
      `/flags/user?${searchParams.toString()}`
    );
  },

  checkUserFlag: async (
    photoId: string
  ): Promise<ApiResponse<FlagCheckResponse>> => {
    return apiRequest<ApiResponse<FlagCheckResponse>>(
      `/flags/check/${photoId}`
    );
  },
};

// ===== CONTACT API =====
export const contactApi = {
  submitContact: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
  }): Promise<ApiResponse<{ id: string; submittedAt: string }>> => {
    return apiRequest<ApiResponse<{ id: string; submittedAt: string }>>(
      "/contact",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  getAllContacts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Contact[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.priority) searchParams.append("priority", params.priority);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    return apiRequest<ApiResponse<Contact[]>>(
      `/admin/contacts?${searchParams.toString()}`
    );
  },

  getContactById: async (id: string): Promise<ApiResponse<Contact>> => {
    return apiRequest<ApiResponse<Contact>>(`/admin/contacts/${id}`);
  },

  updateContactStatus: async (
    id: string,
    data: { status?: string; assignedTo?: string }
  ): Promise<ApiResponse<Contact>> => {
    return apiRequest<ApiResponse<Contact>>(`/admin/contacts/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  addContactNote: async (
    id: string,
    data: { note: string }
  ): Promise<ApiResponse<Contact>> => {
    return apiRequest<ApiResponse<Contact>>(`/admin/contacts/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteContact: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/contacts/${id}`, {
      method: "DELETE",
    });
  },

  getContactStats: async (): Promise<ApiResponse<ContactStats>> => {
    return apiRequest<ApiResponse<ContactStats>>("/admin/contacts/stats");
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
