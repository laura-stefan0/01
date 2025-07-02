
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, ChevronDown } from "lucide-react";

interface LocationSelectorProps {
  currentLocation: string;
  selectedCountry: string;
  onLocationSelect: (location: string) => void;
  onCountryChange: (country: string) => void;
  children: React.ReactNode;
}

// Available countries
const countryOptions = [
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'us', name: 'United States', flag: '🇺🇸' }
];

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
      "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Dothan"],
      "Alaska": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai"],
      "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert"],
      "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway"],
      "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Fresno", "Oakland", "Long Beach", "Bakersfield"],
      "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada"],
      "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury"],
      "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford"],
      "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Tallahassee"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell"],
      "Hawaii": ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Mililani"],
      "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene"],
      "Illinois": ["Chicago", "Aurora", "Peoria", "Rockford", "Joliet", "Naperville", "Springfield"],
      "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Bloomington", "Fishers"],
      "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Council Bluffs"],
      "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe", "Lawrence", "Shawnee"],
      "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Richmond", "Georgetown"],
      "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City"],
      "Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford"],
      "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis"],
      "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Flint"],
      "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth"],
      "Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo"],
      "Missouri": ["Kansas City", "St. Louis", "Springfield", "Independence", "Columbia", "Lee's Summit", "O'Fallon"],
      "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell"],
      "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings"],
      "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley"],
      "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Rochester", "Salem", "Dover"],
      "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood"],
      "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis"],
      "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers", "New Rochelle"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary"],
      "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma"],
      "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore"],
      "Oregon": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro", "Bend", "Beaverton"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem"],
      "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Newport"],
      "South Carolina": ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville"],
      "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton"],
      "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
      "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden"],
      "Vermont": ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland", "Montpelier", "Winooski"],
      "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett"],
      "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Morgantown", "Wheeling", "Martinsburg", "Fairmont"],
      "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha"],
      "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River"]
    }
  }
};

export function LocationSelector({ currentLocation, selectedCountry, onLocationSelect, onCountryChange, children }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedCountry, setTempSelectedCountry] = useState(selectedCountry);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Parse current location to pre-populate region/state
  const parseCurrentLocation = () => {
    if (currentLocation && currentLocation !== "Unknown Location") {
      const parts = currentLocation.split(', ');
      if (parts.length >= 2) {
        const city = parts[0];
        const regionOrState = parts[1];
        
        // For Italy, the second part is the full region name
        if (selectedCountry === 'it') {
          return { city, region: regionOrState };
        }
        // For US, convert state abbreviation to full name
        else if (selectedCountry === 'us') {
          const stateNameMapping: Record<string, string> = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
            "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
            "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
            "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
            "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
            "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
            "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
            "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
            "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
            "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
          };
          const fullStateName = stateNameMapping[regionOrState] || regionOrState;
          return { city, region: fullStateName };
        }
      }
    }
    return { city: "", region: "" };
  };

  // Pre-populate when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Only pre-populate if the current country matches the temp selected country
      setTempSelectedCountry(selectedCountry);
      if (selectedCountry === tempSelectedCountry) {
        const parsed = parseCurrentLocation();
        setSelectedRegion(parsed.region);
        setSelectedCity(parsed.city);
      } else {
        setSelectedRegion("");
        setSelectedCity("");
      }
    } else {
      // Reset when closing
      setSelectedRegion("");
      setSelectedCity("");
      setTempSelectedCountry(selectedCountry);
    }
  };

  const countryData = locationData[tempSelectedCountry as keyof typeof locationData];
  const regions = countryData ? Object.keys(countryData.regions) : [];
  const cities = selectedRegion && countryData ? (countryData.regions as any)[selectedRegion] || [] : [];

  const handleSubmit = () => {
    if (selectedCity && selectedRegion) {
      // Apply country change if different
      if (tempSelectedCountry !== selectedCountry) {
        onCountryChange(tempSelectedCountry);
      }
      
      let formattedLocation: string;
      
      if (tempSelectedCountry === 'it') {
        formattedLocation = `${selectedCity}, ${selectedRegion}`;
      } else {
        // For US, use state abbreviations
        const stateAbbreviations: Record<string, string> = {
          "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
          "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
          "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
          "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
          "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
          "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
          "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
          "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
          "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
          "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
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

  const handleCountryChange = (country: string) => {
    setTempSelectedCountry(country);
    setSelectedRegion(""); // Reset region when country changes
    setSelectedCity(""); // Reset city when country changes
    
    // Only pre-populate if changing to the same country as the current location
    if (country === selectedCountry && currentLocation !== "Unknown Location") {
      const parsed = parseCurrentLocation();
      if (parsed.region) {
        setSelectedRegion(parsed.region);
        setSelectedCity(parsed.city);
      }
    }
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity(""); // Reset city when region changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
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
          
          {/* Country Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select value={tempSelectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Region Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {tempSelectedCountry === 'it' ? 'Region' : 'State'}
            </label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a ${tempSelectedCountry === 'it' ? 'region' : 'state'}`} />
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

          {/* City Selection - Only show after region is selected */}
          {selectedRegion && (
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city: string) => (
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
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Set Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
