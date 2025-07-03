import { MapView } from "@/components/map-view";

/**
 * Discover Page - Interactive map showing protests and events
 * This page displays the map view for users to discover protests in their area
 */
export default function DiscoverPage() {
  return (
    <div className="max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      <MapView />
    </div>
  );
}