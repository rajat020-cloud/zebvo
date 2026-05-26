import { Post } from '../models/Post';
import nlpService from './nlp.service';
import gibberishService from './gibberish.service';
import clusteringService from './clustering.service';
import { v4 as uuidv4 } from 'uuid';

export class ScraperService {
  private keywords = [
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

  private platforms = ['twitter', 'reddit', 'youtube', 'instagram', 'facebook', 'linkedin', 'tiktok'];

  private countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'United Arab Emirates', 'Singapore'];

  private languages = ['en', 'hi', 'pa', 'es', 'fr', 'de', 'ar', 'zh', 'ru', 'ja'];

  // Realistic mock templates to feed the dashboard out-of-the-box
  private mockTemplates = [
    {
      platform: 'twitter',
      author: { username: 'Ramesh Patel', handle: '@ramesh_p', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', verified: false, followers: 230 },
      content: 'Extremely frustrated with the passport renewal process. I applied under Tatkal passport scheme but the slot bookings are completely locked out. Any tips? #PassportRenewal #Tatkal',
      country: 'India',
      language: 'en'
    },
    {
      platform: 'twitter',
      author: { username: 'Sofia Alvarez', handle: '@sofia_travels', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', verified: true, followers: 15400 },
      content: 'Finally renewed my travel documents today! The online appointment scheduling at the local agency was very easy and quick. Highly recommended tatkal service.',
      country: 'United States',
      language: 'en'
    },
    {
      platform: 'reddit',
      author: { username: 'visa_stuck_99', handle: 'u/visa_stuck_99', avatar: '', verified: false, followers: 12 },
      content: 'visa process is extremely slow. Applied for student visa stamping 3 months ago at the consulate and the status is still "administrative processing". I missed my college orientation. Visa issue is ruining my year.',
      country: 'Canada',
      language: 'en'
    },
    {
      platform: 'youtube',
      author: { username: 'Tech & Travel Vlog', handle: '@tech_travel_vlog', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', verified: true, followers: 120000 },
      content: 'scam alert: fake agent charged me double. Do not use unauthorized websites for booking passport appointment slots. They are phishing for your bank details! Always use government portals.',
      country: 'India',
      language: 'en'
    },
    {
      platform: 'twitter',
      author: { username: 'Amit Singh', handle: '@amits_punjab', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', verified: false, followers: 450 },
      content: 'ਮੈਂ 2 ਮਹੀਨਿਆਂ ਤੋਂ ਆਪਣੇ ਪਾਸਪੋਰਟ ਦੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹਾਂ। ਕੋਈ ਸੁਣਵਾਈ ਨਹੀਂ ਹੋ ਰਹੀ। Passport delay is causing huge issues for my job abroad. Please help!',
      country: 'India',
      language: 'pa'
    },
    {
      platform: 'facebook',
      author: { username: 'Rahul Sharma', handle: 'rahul.sharma.fb', avatar: '', verified: false, followers: 800 },
      content: 'पासपोर्ट अपॉइंटमेंट मिलना बहुत मुश्किल हो गया है। तत्काल पासपोर्ट की फीस भरने के बाद भी वेबसाइट पर एरर आ रहा है। Need help regarding passport appointment errors.',
      country: 'India',
      language: 'hi'
    },
    {
      platform: 'twitter',
      author: { username: 'Carlos Mendez', handle: '@carlos_m', avatar: '', verified: false, followers: 98 },
      content: 'Alerta de estafa: el agente falso me cobró el doble. Me prometieron una cita de pasaporte rápido pero desaparecieron con mi dinero. Tengan mucho cuidado con los tramitadores falsos.',
      country: 'Spain',
      language: 'es'
    },
    {
      platform: 'linkedin',
      author: { username: 'Global HR Consult', handle: 'global-hr-consulting', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', verified: true, followers: 85000 },
      content: 'Official external affairs ministry announces structural upgrades to passport seva program. Processing capacities will double starting next month. Excellent news for corporate immigration and visa issues.',
      country: 'United Kingdom',
      language: 'en'
    },
    {
      platform: 'instagram',
      author: { username: 'travel_with_marie', handle: '@travel_marie', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', verified: false, followers: 4200 },
      content: 'My passport renewal is stuck due to some backend police verification issue. Police visited my house but status hasn\'t updated in weeks. Passport delay is real. Has anyone faced this?',
      country: 'India',
      language: 'en'
    },
    // Keyboard smashes and spam to demonstrate gibberish filter
    {
      platform: 'twitter',
      author: { username: 'SpamBot999', handle: '@spambot999', avatar: '', verified: false, followers: 1 },
      content: 'Haaaaahahahaaaaaa cheap visa services call +19998888777 immediately buy fake passport fast shipping easy visa guarantee $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$!!!',
      country: 'Global',
      language: 'en'
    },
    {
      platform: 'reddit',
      author: { username: 'keyboard_masher', handle: 'u/qwerty_mash', avatar: '', verified: false, followers: 0 },
      content: 'asdfghjklqwertyuiopzxcvbnm passport status booking slot hgfdsazxcvbnm hjklhgfds',
      country: 'Global',
      language: 'en'
    }
  ];

  /**
   * Scrapes/Generates new posts and ingests them into the DB.
   * Can be triggered on demand or from a cron job.
   */
  public async scrapeAllSources(): Promise<number> {
    console.log('Initiating scraping cycle across all platforms for passport keywords...');
    let ingestedCount = 0;

    // In production, you would fetch from active endpoints.
    // Here we run our advanced simulation loader that reads templates,
    // matches keywords, analyzes NLP features, checks for gibberish, 
    // runs clustering vector math, and stores unique objects.
    
    // Select a subset of templates randomly to simulate active streams
    const activeSample = this.shuffleArray([...this.mockTemplates]).slice(0, 5);

    for (const postData of activeSample) {
      const uniquePostId = this.generateDeterministicId(postData.platform, postData.content);

      // Check if duplicate post exists to avoid database clutter
      const duplicate = await Post.findOne({ postId: uniquePostId });
      if (duplicate) {
        continue;
      }

      // 1. Gibberish Detection
      const gibberCheck = gibberishService.evaluateText(postData.content);

      // 2. NLP Analysis (Sentiment, Category, Summarization)
      const nlpResult = await nlpService.analyzePost(postData.content);

      // 3. Vector Space Clustering (Cosine Similarity)
      // Pass the text to cluster it against previous posts
      const clusterId = await clusteringService.clusterPost(postData.content);

      // Extract matched keywords
      const matchedKeywords = this.keywords.filter(keyword => 
        postData.content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedKeywords.length === 0) {
        matchedKeywords.push('passport');
      }

      // Construct Post Model
      const newPost = new Post({
        postId: uniquePostId,
        platform: postData.platform,
        originalContent: postData.content,
        translatedContent: {}, // Caches on-demand
        summary: nlpResult.summary,
        sentiment: nlpResult.sentiment,
        category: nlpResult.category,
        gibberish: gibberCheck.isGibberish,
        gibberishReason: gibberCheck.reason,
        clusterId: clusterId,
        author: {
          username: postData.author.username,
          handle: postData.author.handle,
          avatar: postData.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // placeholder avatar
          verified: postData.author.verified,
          followers: postData.author.followers
        },
        engagement: {
          likes: Math.floor(Math.random() * 500),
          shares: Math.floor(Math.random() * 80),
          comments: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 3000)
        },
        country: postData.country,
        language: postData.language,
        keywords: matchedKeywords,
        url: `https://www.${postData.platform}.com/status/${uniquePostId}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 12 * 60 * 60 * 1000)) // within last 12 hours
      });

      await newPost.save();
      ingestedCount++;
    }

    console.log(`Scraping cycle completed. Ingested ${ingestedCount} brand new unique social media records.`);
    return ingestedCount;
  }

  /**
   * Generates a deterministic hash-like unique ID for mock platforms based on text content
   */
  private generateDeterministicId(platform: string, content: string): string {
    let hash = 0;
    const str = platform + content;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export default new ScraperService();
