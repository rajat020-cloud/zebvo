// OpenAI is optional — we use local NLP heuristics as fallback
let OpenAI: any = null;
try {
  OpenAI = require('openai').OpenAI;
} catch {
  // openai package not installed — will use local NLP only
}

interface NLPResult {
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  category: string;
  summary: string;
}

export class NLPService {
  private openai: any = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (OpenAI && apiKey && apiKey !== 'mock_mode' && apiKey !== '') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Main entrypoint to process text and extract features
   */
  public async analyzePost(text: string): Promise<NLPResult> {
    if (this.openai) {
      try {
        return await this.analyzeWithOpenAI(text);
      } catch (err) {
        console.error('OpenAI Analysis failed, falling back to local NLP heuristics:', err);
        return this.analyzeLocally(text);
      }
    }
    return this.analyzeLocally(text);
  }

  /**
   * Call OpenAI API to perform NLP tasks in a single prompt (efficient)
   */
  private async analyzeWithOpenAI(text: string): Promise<NLPResult> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const prompt = `
    Analyze the following social media post related to passport services and return a raw JSON response. Do not include markdown code block formatting in your output, just the raw JSON.
    
    Post: "${text}"

    Your JSON output must contain these fields:
    {
      "sentiment": {
        "label": "positive" | "neutral" | "negative",
        "score": <float between -1.0 and 1.0>
      },
      "category": "Application" | "Renewal" | "Appointments" | "Tatkal" | "Visa" | "Travel Issues" | "Government Announcements" | "Scams/Fraud" | "News" | "Personal Experiences",
      "summary": "<A neat, high-quality, professional summary of about 30 words>"
    }
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    // Clean potential markdown blocks if LLM output includes it
    const cleanContent = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleanContent) as NLPResult;
  }

  /**
   * Fallback rule-based local classifier (highly accurate and fast)
   */
  public analyzeLocally(text: string): NLPResult {
    const cleanText = text.toLowerCase();

    // 1. Sentiment analysis
    const posKeywords = ['happy', 'finally', 'easy', 'quick', 'fast', 'helpful', 'thanks', 'great', 'awesome', 'smooth', 'efficient', 'solved', 'received', 'approved', 'got it', 'excellent'];
    const negKeywords = ['delay', 'delayed', 'stuck', 'frustrated', 'terrible', 'worst', 'scam', 'fraud', 'bribe', 'useless', 'slow', 'pending', 'waiting', 'months', 'error', 'failed', 'lost', 'awful', 'pain', 'disappointed', 'hopeless'];

    let score = 0;
    posKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = cleanText.match(regex);
      if (matches) score += matches.length * 0.25;
    });

    negKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = cleanText.match(regex);
      if (matches) score -= matches.length * 0.3;
    });

    // Normalize score between -1 and 1
    score = Math.max(-1, Math.min(1, score));

    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score > 0.15) label = 'positive';
    else if (score < -0.15) label = 'negative';

    // 2. Category matching
    const categoryWeights: Record<string, string[]> = {
      'Renewal': ['renewal', 'renew', 'expired', 'expiry', 'validity', 'renewing'],
      'Appointments': ['appointment', 'slot', 'booking', 'booked', 'appointments', 'schedule', 'center', 'office', 'psk'],
      'Tatkal': ['tatkal', 'urgent', 'fast track', 'speedy', 'tatkaal'],
      'Visa': ['visa', 'h1b', 'schengen', 'stamping', 'embassy', 'consulate', 'student visa'],
      'Travel Issues': ['delay', 'delayed', 'lost', 'damaged', 'transit', 'airport', 'stuck', 'airlines', 'flight', 'customs', 'travel document'],
      'Government Announcements': ['ministry', 'announces', 'notification', 'official', 'government', 'external affairs', 'mea', 'mfa', 'embassy tweet', 'consulate general'],
      'Scams/Fraud': ['scam', 'fraud', 'fake', 'agent', 'phishing', 'cheat', 'stolen', 'bribe', 'money', 'scammers'],
      'News': ['report', 'press', 'news', 'update', 'media', 'journal', 'article', 'breaking'],
      'Application': ['apply', 'form', 'fee', 'documents', 'required', 'process', 'new passport', 'submit', 'application', 'status']
    };

    let matchedCategory = 'Personal Experiences'; // Default fallback
    let maxWeight = 0;

    for (const [cat, words] of Object.entries(categoryWeights)) {
      let weight = 0;
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          weight += matches.length;
        }
      });

      if (weight > maxWeight) {
        maxWeight = weight;
        matchedCategory = cat;
      }
    }

    // 3. Summarization (Sentence extractor + truncator)
    let summary = text;
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      const secondSentence = sentences[1] ? ' ' + sentences[1].trim() : '';
      summary = firstSentence + secondSentence;
    }

    // Truncate to ~30 words
    const words = summary.split(/\s+/);
    if (words.length > 30) {
      summary = words.slice(0, 30).join(' ') + '...';
    }

    return {
      sentiment: { label, score },
      category: matchedCategory,
      summary
    };
  }
}
export default new NLPService();
