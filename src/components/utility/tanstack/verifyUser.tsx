import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";

export const useVerifyUser = () => {
  const { setUser, clearUser } = useAuthStore();

  return useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      try {
        const data = await authApi.verifyUser();
        setUser(data.user);
        return data.user;
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
