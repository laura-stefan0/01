import { MapView } from "@/components/map-view";

/**
 * Discover Page - Interactive map showing protests and events
 * This page displays the map view for users to discover protests in their area
 */
export default function DiscoverPage() {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50 min-h-screen">
      <div className="max-w-md mx-auto h-[calc(100vh-5rem)] overflow-hidden">
        <MapView />
      </div>
    </div>
  );
}