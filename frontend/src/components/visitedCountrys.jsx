import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000";

// TanStack Query function to search countries by name
export function useSearchCountries(name) {
  return useQuery({
    queryKey: ["search-countries", name],
    queryFn: async () => {
      if (!name || name.length < 1) return [];
      const res = await fetch(
        `${API_BASE_URL}/search-country?name=${encodeURIComponent(name)}`
      );
      if (!res.ok) throw new Error("Failed to fetch countries");
      return res.json();
    },
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 60,
  });
}

// Get all visited countries for a user
export function useVisitedCountries(userId) {
  return useQuery({
    queryKey: ["visited-countries", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(
        `${API_BASE_URL}/users/${userId}/visited-countries`
      );
      if (!res.ok) throw new Error("Failed to fetch visited countries");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

// Add a country to visited countries
export function useAddVisitedCountry(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (countryId) => {
      const res = await fetch(`${API_BASE_URL}/users/visited-countries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ countryId }),
      });
      if (!res.ok) throw new Error("Failed to add visited country");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["visited-countries", userId],
      });
    },
  });
}

// Remove a country from visited countries
export function useRemoveVisitedCountry(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (countryId) => {
      const res = await fetch(
        `${API_BASE_URL}/users/visited-countries/${countryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to remove visited country");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["visited-countries", userId],
      });
    },
  });
}
