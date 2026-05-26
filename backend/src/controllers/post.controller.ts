import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';
import translationService from '../services/translation.service';

export class PostController {
  /**
   * Fetches posts with advanced filters, text search, sorting, and pagination
   */
  public async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        platform,
        category,
        sentiment,
        language,
        gibberish = 'false', // Default to false (hiding spam)
        country,
        clusterId,
        hours,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build MongoDB Query Object
      const query: any = {};

      // Text Search
      if (search && (search as string).trim() !== '') {
        query.$text = { $search: search as string };
      }

      // Multi-select platform filter
      if (platform) {
        query.platform = Array.isArray(platform)
          ? { $in: platform }
          : { $in: (platform as string).split(',') };
      }

      // Multi-select category filter
      if (category) {
        query.category = Array.isArray(category)
          ? { $in: category }
          : { $in: (category as string).split(',') };
      }

      // Multi-select sentiment filter
      if (sentiment) {
        const sentiments = Array.isArray(sentiment)
          ? sentiment
          : (sentiment as string).split(',');
        query['sentiment.label'] = { $in: sentiments };
      }

      // Multi-select language filter
      if (language) {
        query.language = Array.isArray(language)
          ? { $in: language }
          : { $in: (language as string).split(',') };
      }

      // Gibberish (spam) toggler
      if (gibberish === 'false') {
        query.gibberish = false;
      } else if (gibberish === 'true') {
        query.gibberish = true;
      }
      // If gibberish is 'all', we don't add the query field, returning everything.

      // Country filter
      if (country) {
        query.country = country;
      }

      // Specific Cluster ID filter
      if (clusterId) {
        query.clusterId = clusterId;
      }

      // Time Range Filter (hours)
      if (hours) {
        const hoursNum = parseInt(hours as string, 10);
        const timeLimit = new Date(Date.now() - hoursNum * 60 * 60 * 1000);
        query.timestamp = { $gte: timeLimit };
      }

      // Sorting
      const sort: any = {};
      if (search && sortBy === 'relevance') {
        sort.score = { $meta: 'textScore' };
      } else {
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute Queries in parallel
      const [posts, total] = await Promise.all([
        Post.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Post.countDocuments(query)
      ]);

      // If we are performing full-text search, return text score metadata
      const postsWithScore = search && sortBy === 'relevance'
        ? posts.map(post => {
            const obj = post.toObject();
            return {
              ...obj,
              textScore: (post as any)._doc?.score || 1
            };
          })
        : posts;

      return res.status(200).json({
        success: true,
        count: posts.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        posts: postsWithScore
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves single post document by MongoDB ID
   */
  public async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post document not found' });
      }
      return res.status(200).json({ success: true, post });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles on-demand translation of a post's content
   */
  public async translatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { lang } = req.body;
      const { id } = req.params;

      if (!lang) {
        return res.status(400).json({ success: false, message: 'Target language code (lang) is required' });
      }

      const translatedText = await translationService.translate(id, lang);

      return res.status(200).json({
        success: true,
        postId: id,
        language: lang,
        translatedText
      });
    } catch (err: any) {
      console.error('Translation controller error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Translation failed' });
    }
  }

  /**
   * Returns a specific cluster (grouped posts/thread) containing similar text
   */
  public async getClusterThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { clusterId } = req.params;
      const postsInCluster = await Post.find({ clusterId }).sort({ timestamp: 1 });

      return res.status(200).json({
        success: true,
        clusterId,
        count: postsInCluster.length,
        posts: postsInCluster
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
