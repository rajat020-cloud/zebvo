import { v4 as uuidv4 } from 'uuid';
import Post from '../models/Post';

export class ClusteringService {
  /**
   * Tokenizes text and builds a term-frequency (TF) map
   */
  private buildTermFrequencyVector(text: string): Map<string, number> {
    const vector = new Map<string, number>();
    // Clean, lowercase, and tokenize
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // filter out short stop words

    words.forEach(word => {
      vector.set(word, (vector.get(word) || 0) + 1);
    });

    return vector;
  }

  /**
   * Computes the cosine similarity between two term-frequency maps
   */
  private calculateCosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Calculate dot product and magnitude for vecA
    vecA.forEach((val, key) => {
      magnitudeA += val * val;
      if (vecB.has(key)) {
        dotProduct += val * (vecB.get(key) || 0);
      }
    });

    // Calculate magnitude for vecB
    vecB.forEach(val => {
      magnitudeB += val * val;
    });

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }

  /**
   * Clusters a new post by comparing it to recently scraped posts (last 24 hours).
   * Returns a clusterId (either an existing matching cluster, or a fresh UUID).
   */
  public async clusterPost(text: string, postIdToExclude?: string): Promise<string> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Fetch recent posts with existing clusters
    const query: any = {
      timestamp: { $gte: twentyFourHoursAgo },
      clusterId: { $ne: null }
    };
    
    if (postIdToExclude) {
      query.postId = { $ne: postIdToExclude };
    }

    const recentPosts = await Post.find(query).select('postId originalContent clusterId');
    if (recentPosts.length === 0) {
      // First post in the last 24h, provision new cluster
      return uuidv4();
    }

    const targetVector = this.buildTermFrequencyVector(text);
    
    let maxSimilarity = 0;
    let bestClusterId: string | null = null;
    const SIM_THRESHOLD = 0.70; // 70% textual cosine similarity threshold

    for (const post of recentPosts) {
      const compareVector = this.buildTermFrequencyVector(post.originalContent);
      const similarity = this.calculateCosineSimilarity(targetVector, compareVector);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestClusterId = post.clusterId ?? null;
      }
    }

    if (maxSimilarity >= SIM_THRESHOLD && bestClusterId) {
      return bestClusterId;
    }

    // No similar post found, create a new cluster ID
    return uuidv4();
  }
}

export default new ClusteringService();
