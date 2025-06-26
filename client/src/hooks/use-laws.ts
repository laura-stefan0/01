import { useQuery } from "@tanstack/react-query";
import type { Law } from "@shared/schema";

export function useLaws(country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Law[]>({
    queryKey: ["/api/laws", country],
    queryFn: async () => {
      const response = await fetch(`/api/laws${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch laws');
      }
      return response.json();
    },
  });
}

export function useLawsByCategory(category: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Law[]>({
    queryKey: ["/api/laws/category", category, country],
    queryFn: async () => {
      const response = await fetch(`/api/laws/category/${category}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch laws by category');
      }
      return response.json();
    },
    enabled: !!category,
  });
}

export function useLaw(id: string) {
  return useQuery<Law>({
    queryKey: ["/api/laws", id],
    queryFn: async () => {
      const response = await fetch(`/api/laws/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch law');
      }
      return response.json();
    },
    enabled: !!id,
  });
}