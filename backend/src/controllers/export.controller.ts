import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';
import exportService from '../services/export.service';

export class ExportController {
  /**
   * Helper to query posts based on active dashboard filter parameters
   */
  private async queryFilteredPosts(queryParams: Record<string, any>): Promise<any[]> {
    const { search, platform, category, sentiment, language, gibberish = 'false', hours } = queryParams;
    const query: any = {};

    if (search && (search as string).trim() !== '') {
      query.$text = { $search: search as string };
    }

    if (platform) {
      query.platform = { $in: (platform as string).split(',') };
    }

    if (category) {
      query.category = { $in: (category as string).split(',') };
    }

    if (sentiment) {
      query['sentiment.label'] = { $in: (sentiment as string).split(',') };
    }

    if (language) {
      query.language = { $in: (language as string).split(',') };
    }

    if (gibberish === 'false') {
      query.gibberish = false;
    } else if (gibberish === 'true') {
      query.gibberish = true;
    }

    if (hours) {
      const timeLimit = new Date(Date.now() - parseInt(hours as string, 10) * 60 * 60 * 1000);
      query.timestamp = { $gte: timeLimit };
    }

    return Post.find(query).sort({ timestamp: -1 });
  }

  /**
   * Downloads matching dataset as a structured CSV file
   */
  public async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await this.queryFilteredPosts(req.query);

      const csvContent = exportService.generateCSV(posts);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=passport-scraping-export.csv');
      
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Streams a beautifully formatted PDF report containing matching mentions
   */
  public async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await this.queryFilteredPosts(req.query);

      // Clean metadata filter overview to print on PDF
      const filtersUsed: Record<string, any> = {};
      if (req.query.platform) filtersUsed.Platform = req.query.platform;
      if (req.query.category) filtersUsed.Category = req.query.category;
      if (req.query.sentiment) filtersUsed.Sentiment = req.query.sentiment;
      if (req.query.search) filtersUsed.Search = req.query.search;
      if (req.query.gibberish) filtersUsed.Gibberish = req.query.gibberish;

      exportService.generatePDF(posts, filtersUsed, res);
    } catch (err) {
      next(err);
    }
  }
}

export default new ExportController();
