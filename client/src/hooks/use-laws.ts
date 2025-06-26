import { useQuery } from "@tanstack/react-query";
import type { Law } from "@shared/schema";

export function useLaws() {
  return useQuery<Law[]>({
    queryKey: ["/api/laws"],
  });
}

export function useLawsByCategory(category: string) {
  return useQuery<Law[]>({
    queryKey: ["/api/laws/category", category],
    enabled: !!category,
  });
}

export function useLaw(id: string) {
  return useQuery<Law>({
    queryKey: ["/api/laws", id],
    enabled: !!id,
  });
}