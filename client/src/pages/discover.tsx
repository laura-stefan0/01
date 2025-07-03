import { MapView } from "@/components/map-view";

/**
 * Discover Page - Interactive map showing protests and events
 * This page displays the map view for users to discover protests in their area
 */
export default function DiscoverPage() {
  return (
    <div className="fixed inset-0 bottom-16 w-full overflow-hidden">
      <MapView />
    </div>
  );
}