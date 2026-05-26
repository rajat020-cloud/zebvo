import scraperService from './scraper.service';

export class CronService {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 15 * 60 * 1000; // Default 15 minutes

  constructor() {
    const configMinutes = process.env.SCRAPE_INTERVAL_MINUTES || '15';
    this.intervalMs = parseInt(configMinutes, 10) * 60 * 1000;
  }

  /**
   * Activates the background ingestion timer loops
   */
  public startScheduler() {
    if (this.timer) {
      console.warn('Scraping Scheduler already running. Ignoring duplicate start call.');
      return;
    }

    console.log(`Activating Ingestion Cron Scheduler. Interval: ${this.intervalMs / (60 * 1000)} minutes.`);
    
    // Trigger initial scrape after 5 seconds to load seed feeds smoothly, then set the recurring interval
    setTimeout(() => {
      this.executeScrapingCycle();
    }, 5000);

    this.timer = setInterval(() => {
      this.executeScrapingCycle();
    }, this.intervalMs);
  }

  /**
   * Halts the background scheduler
   */
  public stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('Ingestion Cron Scheduler successfully halted.');
    }
  }

  /**
   * Executes a single scraping cycle
   */
  private async executeScrapingCycle() {
    try {
      console.log(`[Scheduler: ${new Date().toISOString()}] Initiating background social scraping...`);
      const ingested = await scraperService.scrapeAllSources();
      console.log(`[Scheduler] Scraped successfully. Loaded ${ingested} new unique posts.`);
    } catch (err) {
      console.error('[Scheduler] Error during automated scraping cycle:', err);
    }
  }
}

export default new CronService();
