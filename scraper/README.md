# Italian Protest Scraper

A comprehensive web scraper designed to collect Italian protest and activism event data from multiple sources and store them in a Supabase database.

## Features

### 🚀 Core Functionality
- **Multi-source scraping**: Collects data from 11+ Italian activism websites
- **Smart filtering**: Uses Italian keywords to identify protest events while excluding non-protest events
- **Duplicate detection**: Prevents duplicate events using normalized text matching
- **Geocoding**: Automatically converts addresses to latitude/longitude coordinates
- **Category classification**: Automatically categorizes events into 9 different categories
- **Image handling**: Extracts event images or applies category-specific fallbacks
- **Rate limiting**: Respectful scraping with built-in delays

### ✨ Enhanced Features (July 2025)
- **Title Cleaning**: Removes dates, locations, and quotes from event titles
  - Example: "15/07 Venezia - Assemblea" → "Assemblea"
  - Example: ""Fermiamo la guerra!"" → "Fermiamo la guerra!"
- **Pagination Support**: Automatically follows multiple pages and "load more" buttons
- **Enhanced Address Extraction**: Gets full street addresses, venues, and postal codes
- **Improved Time Parsing**: Extracts actual event times (HH:MM) or null if not available
- **Event URL Extraction**: Links to detailed event pages when available
- **Deep Content Analysis**: Fetches additional details from event detail pages
- **Comprehensive Logging**: Detailed progress tracking and event-by-event information

## Scraped Sources

### Activism & Movement Websites
- globalproject.info
- dinamopress.it
- milanoinmovimento.com
- romatoday.it
- umanitanova.org
- fridaysforfutureitalia.it
- nonunadimeno.wordpress.com
- eventbrite.it
- extinctionrebellion.it
- usb.it
- sicobas.org
- adlcobas.it (Labor union activism)
- notav.info (No TAV movement and territorial struggles)

### Italian News Sources
- it.euronews.com/tag/manifestazioni-in-italia (Euronews Italy - Protest coverage)
- globalist.it (Globalist)
- open.online (Open - Digital newspaper)
- ilmanifesto.it (Il Manifesto - Left-wing newspaper)

### New Specialized Sources
- ilrovescio.info/category/iniziative/ (Il Rovescio - Initiatives and Events)
- rivoluzioneanarchica.it (Rivoluzione Anarchica - Anarchist Movement)

**Total Sources: 17 websites**

## Event Categories

The scraper automatically categorizes events into:

- **Environment**: Climate activism, Extinction Rebellion, Fridays for Future
- **LGBTQ+**: Pride events, anti-homophobia campaigns
- **Women's Rights**: Anti-violence, reproductive rights, Non Una di Meno
- **Labor**: Strikes, worker rights, union events
- **Racial & Social Justice**: Anti-racism, migrant rights
- **Civil & Human Rights**: Democracy, constitution, freedoms
- **Healthcare & Education**: Medical system, schools, universities
- **Peace & Anti-War**: Anti-militarism, peace movements
- **Transparency & Anti-Corruption**: Anti-mafia, government transparency
- **Other**: Events that don't fit other categories

## Requirements

Before running the scraper, ensure you have:

1. Node.js installed (v16 or higher)
2. Required npm packages:
   ```bash
   npm install @supabase/supabase-js axios cheerio
   ```
3. Supabase database with a `protests` table containing these fields:
   - `title` (text)
   - `description` (text)
   - `category` (text)
   - `location` (text)
   - `address` (text)
   - `latitude` (text)
   - `longitude` (text)
   - `date` (date)
   - `time` (text)
   - `image_url` (text)
   - `country_code` (text)
   - `featured` (boolean)
   - `attendees` (integer)
   - `created_at` (timestamp)
   - `event_url` (text)

## Usage

### Enhanced Scraper (Recommended)

Run the enhanced scraper with all new features:

```bash
cd scraper
node enhanced-italian-scraper.js
```

### Test Functionality

Test the enhanced features:

```bash
cd scraper
node test-enhanced-scraper.js
```

### Original Basic Scraper

Run the basic scraper:

```bash
cd scraper
node italian-protest-scraper.js
```

### As a Module

You can also import and use the scraper in other Node.js applications:

```javascript
import { runScraper } from './italian-protest-scraper.js';

// Run the scraper
await runScraper();
```

## Configuration

### Supabase Connection

The scraper is pre-configured with Supabase credentials. If you need to change them, update these variables in the script:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### Keywords

The scraper uses two sets of Italian keywords:

**Protest Keywords** (events MUST contain at least one):
- manifestazione, protesta, sciopero, presidio, corteo, occupazione
- sit-in, mobilitazione, marcia, picchetto, concentramento
- assemblea pubblica, iniziativa politica, blocco stradale, pride

**Exclude Keywords** (events containing these are filtered out):
- concerto, spettacolo, festival, mostra, fiera, mercatino
- messa, celebrazione, evento gastronomico, laboratorio
- evento sportivo, corsa, maratona, dj set, sagra, reading
- workshop, meditazione, presentazione

### Adding New Sources

To add new websites to scrape, add them to the `SCRAPE_SOURCES` array:

```javascript
const SCRAPE_SOURCES = [
  // existing sources...
  { url: 'https://newsite.com', name: 'newsite.com' }
];
```

## How It Works

1. **Website Scraping**: The scraper visits each configured website and extracts content using CSS selectors
2. **Content Filtering**: Text is analyzed for protest-related keywords while excluding non-protest events
3. **Data Extraction**: For each valid event, the scraper extracts:
   - Title and description
   - Date and time (converted to YYYY-MM-DD format)
   - Address and city
   - Event images
4. **Duplicate Detection**: Before saving, the scraper checks for existing events with the same title, date, and city
5. **Geocoding**: Addresses are converted to coordinates using OpenStreetMap's Nominatim service
6. **Category Assignment**: Events are automatically categorized based on content analysis
7. **Database Storage**: Valid, non-duplicate events are saved to the Supabase database

## Output

The scraper provides detailed console output including:

- Number of events found per source
- Duplicate detection notifications
- Successful saves to database
- Final statistics and category breakdown

Example output:

## Recent Updates

### January 2025 (Latest Update)
- **Source Optimization**: Removed large mainstream news sites that were too resource-intensive to scrape (Il Fatto Quotidiano, La Repubblica, Corriere della Sera, Fanpage, Il Sole 24 Ore)
- **New Specialized Sources**: Added ilrovescio.info (initiatives and events) and rivoluzioneanarchica.it (anarchist movement)
- **Total Sources**: Now scraping 17 focused sources optimized for protest and activism content
- **Enhanced Performance**: Faster scraping with more targeted content extraction

### Previous Updates
- Enhanced title cleaning: Removes dates, locations, and quotes from event titles
- Added comprehensive logging system with event-by-event tracking
- Improved duplicate detection and data validation
- Enhanced address extraction and geocoding accuracy
```
🚀 Starting Italian Protest Scraper...
📊 Scraping 11 sources for protest events
🔍 Scraping globalproject.info...
📊 Found 5 potential events from globalproject.info
✅ Saved: Manifestazione per il clima in Milano
Duplicate event skipped: Sciopero generale 25 gennaio
...
🎉 Scraping completed!
📊 Total events found: 47
💾 Events saved to database: 34
🚫 Duplicates skipped: 13
```

## Limitations

- **Rate Limiting**: The scraper includes 1-second delays between operations to be respectful to external services
- **Website Changes**: If target websites change their HTML structure, the scraper may need updates
- **Geocoding**: Uses free OpenStreetMap service which has rate limits
- **Static Content Only**: Cannot scrape JavaScript-rendered content (would need Playwright/Puppeteer for that)

## Troubleshooting

### Common Issues

1. **Network Timeouts**: Some websites may be slow or unavailable. The scraper will continue with other sources.

2. **Geocoding Failures**: If geocoding fails, events default to Milan coordinates (45.4642, 9.1900).

3. **No Events Found**: Check if the target websites have changed their HTML structure.

### Debugging

Enable verbose logging by adding console.log statements or modify the timeout values if websites are consistently timing out.

## Future Enhancements

Potential improvements for the scraper:

- **Social Media Integration**: Add Facebook and X/Twitter scraping using Playwright
- **Advanced Content Extraction**: Use AI/NLP for better event detail extraction
- **Image Processing**: Download and host images locally instead of hotlinking
- **Scheduling**: Add cron job support for automated daily scraping
- **Webhook Integration**: Send notifications when new events are found

## License

This scraper is designed for educational and research purposes. Please respect the terms of service of the websites being scraped and use responsibly.