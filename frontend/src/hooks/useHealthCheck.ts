import { useQuery } from "@tanstack/react-query";
import { healthService, metadataService } from "@/services/health.service";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => healthService.check(),
  });
}

export function useProjectMetadata() {
  return useQuery({
    queryKey: ["metadata"],
    queryFn: () => metadataService.get(),
  });
}
