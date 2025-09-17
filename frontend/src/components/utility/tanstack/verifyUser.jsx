import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";

const fetchUser = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/verifyUser`, {
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Not authenticated");
  }

  return data.user;
};

export const useVerifyUser = () => {
  const { setUser, clearUser } = useAuthStore();

  return useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/verifyUser`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data.message || "Not authenticated");
        }

        // Immediately update Zustand when we get the data
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
