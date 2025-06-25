import { useQuery } from "@tanstack/react-query";
import type { Protest } from "@shared/schema";

export function useProtests() {
  return useQuery<Protest[]>({
    queryKey: ["/api/protests"],
  });
}

export function useFeaturedProtests() {
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/featured"],
  });
}

export function useNearbyProtests() {
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/nearby"],
  });
}

export function useProtestsByCategory(category: string) {
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/category", category],
    queryFn: async () => {
      const response = await fetch(`/api/protests/category/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch protests by category');
      }
      return response.json();
    },
    enabled: !!category,
  });
}

export function useSearchProtests(query: string) {
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/search", { q: query }],
    enabled: !!query && query.length > 0,
  });
}
