import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';

export class AnalyticsController {
  /**
   * Generates highly aggregated analytics datasets for the charts & metrics panels
   */
  public async getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Analyze posts from the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Perform a multi-facet aggregation to calculate all statistics in parallel!
      const stats = await Post.aggregate([
        { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
        {
          $facet: {
            // 1. Overall summary counters
            overallSummary: [
              {
                $group: {
                  _id: null,
                  totalPosts: { $sum: 1 },
                  averageSentimentScore: { $avg: '$sentiment.score' },
                  spamCount: { $sum: { $cond: [{ $eq: ['$gibberish', true] }, 1, 0] } },
                  uniqueClusters: { $addToSet: '$clusterId' }
                }
              },
              {
                $project: {
                  _id: 0,
                  totalPosts: 1,
                  averageSentimentScore: 1,
                  spamCount: 1,
                  clusterCount: { $size: '$uniqueClusters' }
                }
              }
            ],
            // 2. Platform share breakdown
            platformDistribution: [
              { $group: { _id: '$platform', count: { $sum: 1 } } },
              { $project: { _id: 0, platform: '$_id', count: 1 } }
            ],
            // 3. Sentiment breakdown counts
            sentimentDistribution: [
              { $group: { _id: '$sentiment.label', count: { $sum: 1 } } },
              { $project: { _id: 0, label: '$_id', count: 1 } }
            ],
            // 4. Category distribution (for Radar Chart)
            categoryDistribution: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $project: { _id: 0, category: '$_id', count: 1 } },
              { $sort: { count: -1 } }
            ],
            // 5. Regional volume mapping
            countryDistribution: [
              { $group: { _id: '$country', count: { $sum: 1 } } },
              { $project: { _id: 0, country: '$_id', count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            // 6. Keywords Cloud / Trending Topics
            keywordFrequencies: [
              { $unwind: '$keywords' },
              { $group: { _id: '$keywords', count: { $sum: 1 } } },
              { $project: { _id: 0, keyword: '$_id', count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 15 }
            ],
            // 7. Top Influencers Leaderboard
            influencerLeaderboard: [
              { $match: { gibberish: false } },
              {
                $group: {
                  _id: '$author.handle',
                  username: { $first: '$author.username' },
                  followers: { $max: '$author.followers' },
                  verified: { $first: '$author.verified' },
                  avatar: { $first: '$author.avatar' },
                  totalLikes: { $sum: '$engagement.likes' },
                  postCount: { $sum: 1 }
                }
              },
              { $sort: { followers: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  handle: '$_id',
                  username: 1,
                  followers: 1,
                  verified: 1,
                  avatar: 1,
                  totalLikes: 1,
                  postCount: 1
                }
              }
            ],
            // 8. Ingestion volume hourly trends
            hourlyVolume: [
              {
                $group: {
                  _id: { $hour: '$timestamp' },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, hour: '$_id', count: 1 } }
            ]
          }
        }
      ]);

      const analytics = stats[0];

      // Format overview stats gracefully if empty
      const summary = analytics.overallSummary[0] || {
        totalPosts: 0,
        averageSentimentScore: 0,
        spamCount: 0,
        clusterCount: 0
      };

      // Fill in hourly array for full 24h timeline representation
      const filledHours = Array.from({ length: 24 }, (_, i) => {
        const hourMatch = analytics.hourlyVolume.find((h: any) => h.hour === i);
        return {
          hour: `${i.toString().padStart(2, '0')}:00`,
          postsCount: hourMatch ? hourMatch.count : 0
        };
      });

      return res.status(200).json({
        success: true,
        metrics: {
          totalIngested: summary.totalPosts,
          averageSentiment: parseFloat(summary.averageSentimentScore?.toFixed(2) || '0'),
          spamCount: summary.spamCount,
          activeThreadsCount: summary.clusterCount,
          spamPercent: summary.totalPosts > 0 
            ? parseFloat(((summary.spamCount / summary.totalPosts) * 100).toFixed(1))
            : 0
        },
        hourlyTrend: filledHours,
        platforms: analytics.platformDistribution,
        sentiments: analytics.sentimentDistribution,
        categories: analytics.categoryDistribution,
        countries: analytics.countryDistribution,
        keywords: analytics.keywordFrequencies,
        influencers: analytics.influencerLeaderboard
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AnalyticsController();
