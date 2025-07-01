
# Italian Protest Scraper

A comprehensive web scraper designed to collect Italian protest and activism event data from multiple sources and store them in a Supabase database.

## Features

### 🚀 Core Functionality
- **Multi-source scraping**: Collects data from 12+ Italian activism websites
- **Smart filtering**: Uses Italian keywords to identify protest events while excluding non-protest events
- **Duplicate detection**: Prevents duplicate events using normalized text matching
- **Geocoding**: Automatically converts addresses to latitude/longitude coordinates
- **Category classification**: Automatically categorizes events into 9 different categories
- **Image handling**: Extracts event images or applies category-specific fallbacks
- **Rate limiting**: Respectful scraping with built-in delays

### ⚡ Performance Optimizations (Latest Update)
- **Pagination Limits**: Maximum 10 pages per website to prevent excessive scraping
- **Date Cutoff**: Only scrapes events from the last 30 days (configurable)
- **Early Pagination Stop**: Stops paginating when encountering events older than cutoff
- **Request Timeouts**: 10-second timeout for HTTP requests to prevent hanging
- **Concurrency Control**: Limits to 3 concurrent requests to avoid overwhelming servers
- **Smart Delays**: 2s between requests, 3s between pages, 5s between sources
- **Comprehensive Logging**: Detailed statistics including pages scraped, events skipped by date, and performance metrics

### ✨ Enhanced Features
- **Title Cleaning**: Removes dates, locations, and quotes from event titles
- **Pagination Support**: Automatically follows multiple pages and "load more" buttons
- **Enhanced Address Extraction**: Gets full street addresses, venues, and postal codes
- **Improved Time Parsing**: Extracts actual event times (HH:MM) or null if not available
- **Event URL Extraction**: Links to detailed event pages when available
- **Deep Content Analysis**: Fetches additional details from event detail pages
- **Performance Monitoring**: Real-time statistics and early stop mechanisms

## Performance Configuration

The scraper includes configurable performance settings:

```javascript
const PERFORMANCE_CONFIG = {
  MAX_PAGES_PER_WEBSITE: 10,          // Maximum pages to scrape per website
  DATE_CUTOFF_DAYS: 30,               // Only scrape events from last 30 days
  REQUEST_TIMEOUT: 10000,             // 10 seconds timeout
  MAX_CONCURRENT_REQUESTS: 3,         // Limit concurrent requests
  DELAY_BETWEEN_REQUESTS: 2000,       // 2 seconds between requests
  DELAY_BETWEEN_PAGES: 3000,          // 3 seconds between page requests
  DELAY_BETWEEN_SOURCES: 5000         // 5 seconds between different sources
};
```

## Scraped Sources

### Activism & Movement Websites
- globalproject.info
- dinamopress.it
- fridaysforfutureitalia.it
- extinctionrebellion.it
- adlcobas.it (Labor union activism)
- notav.info (No TAV movement and territorial struggles)

### Italian News Sources
- it.euronews.com/tag/manifestazioni-in-italia (Euronews Italy - Protest coverage)
- globalist.it (Globalist)
- open.online (Open - Digital newspaper)
- ilmanifesto.it (Il Manifesto - Left-wing newspaper)

### Specialized Sources
- ilrovescio.info/category/iniziative/ (Il Rovescio - Initiatives and Events)
- rivoluzioneanarchica.it (Rivoluzione Anarchica - Anarchist Movement)

**Total Sources: 12 websites**

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
   - `city` (text)
   - `address` (text)
   - `latitude` (text)
   - `longitude` (text)
   - `date` (date)
   - `time` (text)
   - `image_url` (text)
   - `event_url` (text)
   - `country_code` (text)
   - `featured` (boolean)
   - `attendees` (integer)
   - `source_name` (text)
   - `source_url` (text)
   - `scraped_at` (timestamp)
   - `created_at` (timestamp)

## Usage

### Enhanced Scraper with Performance Optimizations

Run the enhanced scraper with all performance features:

```bash
cd scraper
node enhanced-italian-scraper.js
```

### TypeScript Runner

Run via the TypeScript runner:

```bash
cd scraper
npx tsx run-scraper.ts
```

### Workflow Runner

Use the pre-configured workflow:

```bash
# In Replit, use the "Run Event Scraper" workflow
# Or manually run:
npx tsx scraper/run-scraper.ts
```

### As a Module

You can also import and use the scraper in other Node.js applications:

```javascript
import { main as runScraper, PERFORMANCE_CONFIG } from './enhanced-italian-scraper.js';

// Customize performance settings if needed
PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE = 10;
PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS = 14;

// Run the scraper
const stats = await runScraper();
console.log('Scraping completed:', stats);
```

## Configuration

### Performance Settings

You can modify the performance configuration at the top of the scraper file:

- **MAX_PAGES_PER_WEBSITE**: Limit pages scraped per source (default: 10)
- **DATE_CUTOFF_DAYS**: Only scrape events from last N days (default: 30)
- **REQUEST_TIMEOUT**: HTTP request timeout in milliseconds (default: 10000)
- **MAX_CONCURRENT_REQUESTS**: Concurrent request limit (default: 3)
- **DELAY_BETWEEN_REQUESTS**: Delay between individual requests (default: 2000ms)
- **DELAY_BETWEEN_PAGES**: Delay between page requests (default: 3000ms)
- **DELAY_BETWEEN_SOURCES**: Delay between different sources (default: 5000ms)

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
  { 
    url: 'https://newsite.com', 
    name: 'newsite.com',
    type: 'news_list'
  }
];
```

## How It Works

### Performance Flow

1. **Source Processing**: Processes each source with pagination limits and date cutoffs
2. **Page Limiting**: Stops after reaching maximum pages per website
3. **Date Filtering**: Skips events older than the cutoff date
4. **Early Stopping**: Breaks pagination loop when encountering old events
5. **Concurrency Control**: Limits simultaneous requests to avoid overwhelming servers
6. **Smart Delays**: Implements delays between requests, pages, and sources

### Data Processing Flow

1. **Website Scraping**: Visits each configured website and extracts content using CSS selectors
2. **Content Filtering**: Analyzes text for protest-related keywords while excluding non-protest events
3. **Date Validation**: Parses and validates event dates against the cutoff
4. **Data Extraction**: For each valid event, extracts title, description, date, time, address, and images
5. **Duplicate Detection**: Checks for existing events with the same title, date, and city
6. **Geocoding**: Converts addresses to coordinates using OpenStreetMap's Nominatim service
7. **Category Assignment**: Automatically categorizes events based on content analysis
8. **Database Storage**: Saves valid, non-duplicate events to the Supabase database

## Output and Statistics

The scraper provides comprehensive logging and statistics:

### Real-time Output
- Page-by-page processing updates
- Event extraction and validation results
- Date cutoff filtering notifications
- Early stop triggers
- Request and error logging

### Final Statistics
- Total scraping duration
- Sources processed successfully
- Total pages scraped across all sources
- Events found vs. events saved
- Events skipped by date cutoff
- Events skipped by keyword filtering
- Duplicate events detected
- Sources that triggered early stop
- Overall success rate

### Example Output

```
🚀 Starting Enhanced Italian Protest Scraper with Performance Optimizations...
📊 Configuration:
   📄 Max pages per website: 10
   📅 Date cutoff: 30 days
   ⏱️ Request timeout: 10000ms
   🔄 Max concurrent requests: 3
   📊 Scraping 12 sources

🔍 Processing source 1/12: globalproject.info
📄 Processing page 1/10: https://www.globalproject.info/...
📊 Page 1: Found 5 valid events. Total: 5
🛑 Early stop triggered: Found events older than 30 days cutoff

📊 globalproject.info Statistics:
   📄 Pages scraped: 3/10
   📋 Events found: 15
   ✅ Valid events: 5
   📅 Skipped by date: 8
   🔍 Skipped by keywords: 2
   🛑 Early stop: Yes

...

🎉 Scraping completed!

📊 FINAL STATISTICS:
   ⏱️ Total duration: 342 seconds
   🌐 Sources processed: 12/12
   📄 Total pages scraped: 67
   📋 Total events found: 234
   ✅ Events saved to database: 89
   📅 Events skipped by date cutoff: 98
   🔍 Events skipped by keywords: 47
   ⏭️ Duplicates skipped: 23
   🛑 Sources with early stop: 8
   📈 Success rate: 38%
```

## Performance Benefits

The optimizations provide several benefits:

1. **Faster Execution**: Pagination limits and early stopping reduce total scraping time
2. **Relevant Data**: Date cutoffs ensure only recent, relevant events are collected
3. **Server Respect**: Concurrency limits and delays prevent overwhelming target websites
4. **Resource Efficiency**: Early stopping saves bandwidth and processing time
5. **Better Monitoring**: Comprehensive statistics help track performance and issues
6. **Configurable Limits**: Easy to adjust performance parameters based on needs

## Troubleshooting

### Common Issues

1. **Network Timeouts**: Increase `REQUEST_TIMEOUT` if websites are consistently slow
2. **Rate Limiting**: Increase delays if you receive 429 (Too Many Requests) errors
3. **Memory Issues**: Reduce `MAX_PAGES_PER_WEBSITE` if running out of memory
4. **Old Events**: Adjust `DATE_CUTOFF_DAYS` to include more or fewer historical events

### Performance Tuning

- **For Speed**: Reduce delays and increase concurrent requests (be respectful)
- **For Reliability**: Increase delays and reduce concurrent requests
- **For Completeness**: Increase page limits and date cutoff days
- **For Recent Events**: Decrease date cutoff days and page limits

### Debugging

Enable more verbose logging by modifying console.log statements or adjusting the performance configuration values.

## Recent Updates

### January 2025 (Performance Optimization Update)
- **Pagination Limits**: Added maximum 10 pages per website to prevent excessive scraping
- **Date Cutoff**: Implemented 30-day cutoff to only scrape recent events
- **Early Stopping**: Added logic to stop pagination when encountering old events
- **Request Management**: Implemented 10-second timeouts and concurrency control (max 3 requests)
- **Enhanced Logging**: Added comprehensive statistics and performance monitoring
- **Smart Delays**: Implemented graduated delays between requests, pages, and sources
- **Configuration**: Made all performance settings easily configurable

### Previous Updates
- Enhanced title cleaning and address extraction
- Added comprehensive logging system
- Improved duplicate detection and data validation
- Enhanced address extraction and geocoding accuracy

## Future Enhancements

Potential improvements for the scraper:

- **Machine Learning**: Use AI to better identify protest events and extract details
- **Dynamic Adjustment**: Automatically adjust performance settings based on website response times
- **Caching**: Implement intelligent caching to avoid re-scraping unchanged pages
- **API Integration**: Add support for websites with public APIs
- **Real-time Monitoring**: Add webhook notifications for performance issues

## License

This scraper is designed for educational and research purposes. Please respect the terms of service of the websites being scraped and use responsibly. The performance optimizations ensure respectful scraping practices.
