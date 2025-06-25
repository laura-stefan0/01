import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });
}