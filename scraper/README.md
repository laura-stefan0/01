# Enhanced Italian Protest Scraper

A streamlined web scraper designed to collect Italian protest and activism event data from high-quality sources and store them in a Supabase database.

## Features

### 🚀 Core Functionality
- **Multi-source scraping**: Collects data from 17 Italian activism websites and major news sources
- **Smart filtering**: Uses Italian keywords to identify protest events while excluding non-protest events
- **Duplicate detection**: Prevents duplicate events using normalized text matching
- **Automatic geocoding**: Converts Italian city names to coordinates
- **Category classification**: Automatically categorizes events into 10 different categories
- **Image handling**: Applies category-specific high-quality Unsplash images
- **Database integration**: Direct integration with Supabase protests table

### ⚡ Performance Optimizations
- **Reduced scope**: Maximum 3 pages per website for faster processing
- **Extended date range**: Scrapes events from the last 60 days
- **Fast timeouts**: 8-second timeout for HTTP requests
- **Controlled concurrency**: Limits to 2 concurrent requests
- **Smart delays**: 1s between requests, 2s between sources
- **Comprehensive logging**: Detailed statistics and success rates

### ✨ Data Quality Features
- **Title cleaning**: Preserves original titles, only removes quotes and normalizes spacing
- **Enhanced address extraction**: Extracts Italian cities and coordinates
- **Time parsing**: Extracts event times or defaults to 'N/A' if not found
- **Category detection**: Smart categorization based on content analysis
- **Duplicate prevention**: Checks existing events before saving

## Scraped Sources

The scraper collects data from these comprehensive Italian sources:

### Activism and Social Movement Sites
1. **globalproject.info** - Independent activism and social movements
2. **dinamopress.it** - Alternative journalism and activism events
3. **adlcobas.it** - Labor union activism and worker rights
4. **notav.info** - No TAV movement and territorial struggles
5. **ilrovescio.info** - Social initiatives and community events

### Environmental Activism
6. **fridaysforfutureitalia.it** - Climate activism and environmental events
7. **extinctionrebellion.it** - Climate emergency and environmental events

### Major Italian News Sources
8. **euronews.com** - European news with Italian protest coverage
9. **ilfattoquotidiano.it** - Independent Italian news
10. **repubblica.it** - Major Italian national newspaper
11. **corriere.it** - Corriere della Sera national newspaper
12. **fanpage.it** - Digital news platform
13. **ilsole24ore.com** - Business and financial news
14. **globalist.it** - International and political news
15. **open.online** - Digital journalism platform
16. **ilmanifesto.it** - Left-wing daily newspaper
17. **rivoluzioneanarchica.it** - Anarchist movement news

## Event Categories

Events are automatically categorized into:

- **Environment** - Climate, ecology, environmental protection
- **LGBTQ+** - Pride events and LGBTQ+ rights
- **Labor** - Worker rights, strikes, union activities
- **Peace & Anti-War** - Anti-war movements, peace activism
- **Civil & Human Rights** - General rights and justice movements
- **Women's Rights** - Gender equality and women's rights
- **Racial & Social Justice** - Anti-racism and social justice
- **Healthcare & Education** - Public services and education
- **Transparency & Anti-Corruption** - Government accountability
- **Other** - General activism and other causes

## Requirements

- Node.js 16+ with ES modules support
- Supabase database with `protests` table
- Required npm packages: `@supabase/supabase-js`, `axios`, `cheerio`

## Database Schema

The scraper expects a `protests` table with these fields:

```sql
- title (text)
- description (text) 
- category (text)
- city (text)
- address (text)
- latitude (text)
- longitude (text)
- date (date)
- time (text) - required field, defaults to 'N/A' if not found
- image_url (text)
- event_url (text)
- country_code (text) - set to 'IT'
- featured (boolean)
- attendees (integer)
- source_name (text)
- source_url (text)
- scraped_at (timestamp)
```

## Usage

### Running the Enhanced Scraper

```bash
# Navigate to scraper directory
cd scraper

# Run the enhanced scraper
node enhanced-italian-scraper.mjs
```

### Expected Output

```
🚀 Starting Enhanced Italian Protest Scraper...
📊 Configuration: 60 days, 17 sources

🌐 Processing source 1/17: globalproject.info
🔍 Scraping globalproject.info...
📋 Event found: "Manifestazione per il clima..." | environment | Milano | 2025-07-15
✅ Saved event: "Manifestazione per il clima" (ID: abc123...)

📊 FINAL STATISTICS:
   ⏱️ Duration: 45 seconds
   🌐 Sources processed: 5/5
   📋 Events found: 23
   ✅ Events saved: 18
   📅 Skipped by date: 3
   🔍 Skipped by keywords: 2
   ⏭️ Duplicates skipped: 0
   📈 Success rate: 78%
```

## Configuration

You can modify the performance settings in `enhanced-italian-scraper.mjs`:

```javascript
const PERFORMANCE_CONFIG = {
  MAX_PAGES_PER_WEBSITE: 3,    // Pages to scrape per site
  DATE_CUTOFF_DAYS: 60,        // Only events from last 60 days
  REQUEST_TIMEOUT: 8000,       // 8 second timeout
  MAX_CONCURRENT_REQUESTS: 2,  // 2 concurrent requests
  DELAY_BETWEEN_SOURCES: 2000  // 2 second delay between sources
};
```

## Data Quality

The scraper implements several data quality measures:

- **Keyword filtering**: Only events containing protest-related Italian keywords
- **Exclusion filters**: Removes concerts, festivals, and non-activism events
- **Date validation**: Ensures dates are within the specified range
- **Duplicate detection**: Compares titles and cities to prevent duplicates
- **Data cleaning**: Normalizes titles, descriptions, and addresses
- **Default values**: Provides fallbacks for missing data (city defaults to Milano, time to 'N/A')

## Troubleshooting

**Common Issues:**

1. **Database connection errors**: Verify Supabase credentials in the script
2. **Timeout errors**: Some websites may be slow; the scraper will continue with other sources
3. **No events found**: Check if the source websites have changed their structure
4. **Duplicate key violations**: The scraper handles this automatically by skipping duplicates

**Performance Tips:**

- Run during off-peak hours for better website response times
- Monitor the logs for any specific source failures
- The scraper is designed to continue even if individual sources fail

## Recent Updates

- **July 1, 2025**: Changed default time value from '18:00' to 'N/A' when no time is found
- **July 1, 2025**: Reverted title cleaning to preserve original titles with dates and cities
- **July 1, 2025**: Fixed database constraint issues with null time values
- **July 1, 2025**: Streamlined to 5 high-quality sources for better performance
- **July 1, 2025**: Simplified architecture and improved error handling
- **July 1, 2025**: Enhanced duplicate detection and data validation