import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@shared/schema";

export function useResources(country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Resource[]>({
    queryKey: ["/api/resources", country],
    queryFn: async () => {
      const response = await fetch(`/api/resources${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      return response.json();
    },
  });
}

export function useResourcesByCategory(category: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Resource[]>({
    queryKey: ["/api/resources/category", category, country],
    queryFn: async () => {
      const response = await fetch(`/api/resources/category/${category}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources by category');
      }
      return response.json();
    },
    enabled: !!category,
  });
}

export function useResourcesByType(type: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Resource[]>({
    queryKey: ["/api/resources/type", type, country],
    queryFn: async () => {
      const response = await fetch(`/api/resources/type/${type}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources by type');
      }
      return response.json();
    },
    enabled: !!type,
  });
}