import { useQuery } from "@tanstack/react-query";
import type { SafetyTip } from "@shared/schema";

export function useSafetyTips(country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<SafetyTip[]>({
    queryKey: ["/api/safety-tips", country],
    queryFn: async () => {
      const response = await fetch(`/api/safety-tips${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch safety tips');
      }
      return response.json();
    },
  });
}

export function useSafetyTipsByCategory(category: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<SafetyTip[]>({
    queryKey: ["/api/safety-tips/category", category, country],
    queryFn: async () => {
      const response = await fetch(`/api/safety-tips/category/${category}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch safety tips by category');
      }
      return response.json();
    },
    enabled: !!category,
  });
}

export function useSafetyTipsByType(type: string, country?: string) {
  const countryParam = country ? `?country=${country.toUpperCase()}` : '';
  return useQuery<SafetyTip[]>({
    queryKey: ["/api/safety-tips/type", type, country],
    queryFn: async () => {
      const response = await fetch(`/api/safety-tips/type/${type}${countryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch safety tips by type');
      }
      return response.json();
    },
    enabled: !!type,
  });
}