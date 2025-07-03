import { useQuery } from "@tanstack/react-query";
import type { Protest } from "@shared/schema";

export function useProtests(country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Protest[]>({
    queryKey: ["/api/protests", country],
    queryFn: async () => {
      const response = await fetch(`/api/protests${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch protests');
      }
      return response.json();
    },
  });
}

export function useFeaturedProtests(country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/featured", country],
    queryFn: async () => {
      const response = await fetch(`/api/protests/featured${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured protests');
      }
      return response.json();
    },
  });
}

export function useNearbyProtests(country?: string, userLat?: number, userLng?: number) {
  const params = new URLSearchParams();
  if (country) params.append('country', country.toUpperCase());
  if (userLat !== undefined && userLng !== undefined) {
    params.append('lat', userLat.toString());
    params.append('lng', userLng.toString());
  }
  
  const queryString = params.toString();
  const url = `/api/protests/nearby${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/nearby", country, userLat, userLng],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch nearby protests');
      }
      return response.json();
    },
  });
}

export function useProtestsByCategory(category: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<Protest[]>({
    queryKey: ["/api/protests/category", category, country],
    queryFn: async () => {
      const response = await fetch(`/api/protests/category/${category}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch protests by category');
      }
      return response.json();
    },
    enabled: !!category,
  });
}

export function useSearchProtests(query: string, country?: string) {
  const countryCode = country ? country.toUpperCase() : '';
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (countryCode) params.append('country', countryCode);
  
  return useQuery<Protest[]>({
    queryKey: [`/api/protests/search`, query, country],
    queryFn: async () => {
      const response = await fetch(`/api/protests/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search protests');
      }
      return response.json();
    },
    enabled: !!query && query.length > 0,
  });
}

export function useSavedProtests(userId?: number) {
  return useQuery<Protest[]>({
    queryKey: ["/api/saved-protests", userId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-protests`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved protests');
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useTodaysEvents(userId?: number, userLat?: number, userLng?: number) {
  return useQuery<Protest[]>({
    queryKey: ["/api/saved-protests/today", userId, userLat, userLng],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await fetch(`/api/saved-protests/today?date=${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s events');
      }
      return response.json();
    },
    enabled: !!userId,
  });
}
