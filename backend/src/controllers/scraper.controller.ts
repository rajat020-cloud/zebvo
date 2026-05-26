import { Request, Response, NextFunction } from 'express';
import scraperService from '../services/scraper.service';
import Post from '../models/Post';

export class ScraperController {
  /**
   * Manually activates a background scraping cycle immediately
   */
  public async triggerScraping(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await scraperService.scrapeAllSources();
      
      return res.status(200).json({
        success: true,
        message: 'Scraping cycle executed successfully.',
        ingestedCount: count
      });
    } catch (err: any) {
      console.error('Manual scraping activation error:', err);
      return res.status(500).json({
        success: false,
        message: 'Manual scraping trigger failed.',
        error: err.message
      });
    }
  }

  /**
   * Retrieves operational variables of the scraper pipeline
   */
  public async getScraperStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const activeKeywords = [
        'passport',
        'passport renewal',
        'tatkal passport',
        'visa issue',
        'passport delay',
        'immigration',
        'travel documents',
        'passport scam',
        'passport appointment'
      ];

      const postCounts = await Post.estimatedDocumentCount();
      const intervalMinutes = process.env.SCRAPE_INTERVAL_MINUTES || '15';

      return res.status(200).json({
        success: true,
        status: 'Operational',
        totalStoredDocuments: postCounts,
        scrapingIntervalMinutes: parseInt(intervalMinutes as string, 10),
        monitoredKeywords: activeKeywords,
        activePlatforms: ['twitter', 'reddit', 'youtube', 'instagram', 'facebook', 'linkedin', 'tiktok']
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ScraperController();
