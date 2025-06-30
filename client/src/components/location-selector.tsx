
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, ChevronDown } from "lucide-react";

interface LocationSelectorProps {
  currentLocation: string;
  selectedCountry: string;
  onLocationSelect: (location: string) => void;
  children: React.ReactNode;
}

// Regional data for different countries
const locationData = {
  it: {
    regions: {
      "Lombardy": ["Milan", "Bergamo", "Brescia", "Como", "Cremona", "Mantua", "Pavia", "Sondrio", "Varese"],
      "Lazio": ["Rome", "Frosinone", "Latina", "Rieti", "Viterbo"],
      "Campania": ["Naples", "Avellino", "Benevento", "Caserta", "Salerno"],
      "Sicily": ["Palermo", "Catania", "Messina", "Syracuse", "Trapani", "Agrigento", "Caltanissetta", "Enna", "Ragusa"],
      "Veneto": ["Venice", "Verona", "Padua", "Vicenza", "Treviso", "Rovigo", "Belluno"],
      "Piedmont": ["Turin", "Alessandria", "Asti", "Biella", "Cuneo", "Novara", "Verbano-Cusio-Ossola", "Vercelli"],
      "Emilia-Romagna": ["Bologna", "Ferrara", "Forlì-Cesena", "Modena", "Parma", "Piacenza", "Ravenna", "Reggio Emilia", "Rimini"],
      "Tuscany": ["Florence", "Arezzo", "Grosseto", "Livorno", "Lucca", "Massa and Carrara", "Pisa", "Pistoia", "Prato", "Siena"],
      "Liguria": ["Genoa", "Imperia", "La Spezia", "Savona"],
      "Puglia": ["Bari", "Barletta-Andria-Trani", "Brindisi", "Foggia", "Lecce", "Taranto"],
      "Calabria": ["Catanzaro", "Cosenza", "Crotone", "Reggio Calabria", "Vibo Valentia"],
      "Sardinia": ["Cagliari", "Sassari", "Nuoro", "Oristano", "Sud Sardegna"],
      "Marche": ["Ancona", "Ascoli Piceno", "Fermo", "Macerata", "Pesaro and Urbino"],
      "Umbria": ["Perugia", "Terni"],
      "Abruzzo": ["L'Aquila", "Chieti", "Pescara", "Teramo"],
      "Molise": ["Campobasso", "Isernia"],
      "Basilicata": ["Potenza", "Matera"],
      "Friuli-Venezia Giulia": ["Trieste", "Gorizia", "Pordenone", "Udine"],
      "Trentino-Alto Adige": ["Trento", "Bolzano"],
      "Aosta Valley": ["Aosta"]
    }
  },
  us: {
    regions: {
      "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Fresno", "Oakland", "Long Beach", "Bakersfield"],
      "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers", "New Rochelle"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
      "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Tallahassee"],
      "Illinois": ["Chicago", "Aurora", "Peoria", "Rockford", "Joliet", "Naperville", "Springfield"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Flint"]
    }
  }
};

export function LocationSelector({ currentLocation, selectedCountry, onLocationSelect, children }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const countryData = locationData[selectedCountry as keyof typeof locationData];
  const regions = countryData ? Object.keys(countryData.regions) : [];
  const cities = selectedRegion && countryData ? countryData.regions[selectedRegion] || [] : [];

  const handleSubmit = () => {
    if (selectedCity && selectedRegion) {
      let formattedLocation: string;
      
      if (selectedCountry === 'it') {
        formattedLocation = `${selectedCity}, ${selectedRegion}`;
      } else {
        // For US, use state abbreviations
        const stateAbbreviations: Record<string, string> = {
          "California": "CA", "New York": "NY", "Texas": "TX", "Florida": "FL",
          "Illinois": "IL", "Pennsylvania": "PA", "Ohio": "OH", "Georgia": "GA",
          "North Carolina": "NC", "Michigan": "MI"
        };
        const stateAbbr = stateAbbreviations[selectedRegion] || selectedRegion;
        formattedLocation = `${selectedCity}, ${stateAbbr}`;
      }
      
      onLocationSelect(formattedLocation);
      setIsOpen(false);
      setSelectedRegion("");
      setSelectedCity("");
    }
  };

  const handleUseAutoLocation = () => {
    onLocationSelect("");
    setIsOpen(false);
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity(""); // Reset city when region changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            Current: {currentLocation}
          </div>
          
          {/* Region Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Region/State</label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          {selectedRegion && (
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reset Option */}
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              onClick={handleUseAutoLocation}
              className="w-full text-sm text-gray-600"
            >
              Use automatic location detection
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedCity || !selectedRegion}
              className="flex-1 bg-activist-blue hover:bg-activist-blue/90"
            >
              Set Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
