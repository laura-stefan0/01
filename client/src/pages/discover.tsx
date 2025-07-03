import { MapView } from "@/components/map-view";

/**
 * Discover Page - Interactive map showing protests and events
 * This page displays the map view for users to discover protests in their area
 */
export default function DiscoverPage() {
  return (
    <div className="max-w-md mx-auto app-background min-h-screen">
      <div className="max-w-md mx-auto h-[calc(100vh-5rem)] overflow-hidden relative">
        <MapView />
      </div>
    </div>
  );
}