import { authApi } from "./api";
import { toast } from "react-hot-toast";

/**
 * Perform a standardized logout flow.
 * Options:
 *  - clearUser: function to clear auth state (required)
 *  - queryClient: React Query client instance (optional)
 *  - router: next/navigation router (optional)
 *  - setIsLoggingOut: optional state setter to indicate pending state
 */
export async function performLogout({
  clearUser,
  queryClient,
  router,
  setIsLoggingOut,
} = {}) {
  if (setIsLoggingOut) setIsLoggingOut(true);

  try {
    const res = await authApi.logout();
    if (res && typeof res === "object" && "success" in res && !res.success) {
      throw new Error(res.message || "Logout failed");
    }
    toast.success("Logged out successfully");
  } catch (err) {
    console.error("Logout error:", err);
    toast.error(err?.message || "Logout failed");
  } finally {
    try {
      if (typeof clearUser === "function") clearUser();
      if (queryClient && typeof queryClient.clear === "function")
        queryClient.clear();
    } catch (e) {
      console.error("Error during client cleanup:", e);
    }

    try {
      if (router && typeof router.push === "function") {
        router.push("/");
      } else if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (e) {
      try {
        window.location.href = "/";
      } catch (_) {
        /* ignore */
      }
    }

    if (setIsLoggingOut) setIsLoggingOut(false);
  }
}
