import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@shared/schema";

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });
}

export function useResourcesByCategory(category: string) {
  return useQuery<Resource[]>({
    queryKey: ["/api/resources/category", category],
    enabled: !!category,
  });
}

export function useResourcesByType(type: string) {
  return useQuery<Resource[]>({
    queryKey: ["/api/resources/type", type],
    enabled: !!type,
  });
}