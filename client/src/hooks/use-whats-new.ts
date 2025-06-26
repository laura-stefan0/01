import { useQuery } from "@tanstack/react-query";
import type { WhatsNew } from "@shared/schema";

export function useWhatsNew(country?: string) {
  return useQuery<WhatsNew[]>({
    queryKey: ["/api/whats-new", country],
    queryFn: async () => {
      const response = await fetch(`/api/whats-new${country ? `?country=${country}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch what's new: ${response.statusText}`);
      }
      
      return response.json();
    },
  });
}