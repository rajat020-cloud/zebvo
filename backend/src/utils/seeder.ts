import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Post } from '../models/Post';
import nlpService from '../services/nlp.service';
import gibberishService from '../services/gibberish.service';
import clusteringService from '../services/clustering.service';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zebvo_scraper';

// Comprehensive set of realistic multilingual posts to seed the database
const seedTemplateData = [
  // English - Renewal
  {
    platform: 'twitter',
    author: { username: 'Aravind K', handle: '@aravind_k', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', verified: false, followers: 154 },
    content: 'Just sent my passport renewal application today. I was worried it would take months but the passport seva portal made the form filling extremely straightforward! Hopefully it gets approved soon.',
    country: 'India',
    language: 'en'
  },
  {
    platform: 'twitter',
    author: { username: 'Karan Mehra', handle: '@karan_mehra', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', verified: false, followers: 88 },
    content: 'My passport has expired and I need to travel next month. Initiated my passport renewal under Tatkal scheme today. The urgent passport process is quite fast.',
    country: 'India',
    language: 'en'
  },
  // English - Appointments
  {
    platform: 'reddit',
    author: { username: 'visa_seeker', handle: 'u/visa_seeker', avatar: '', verified: false, followers: 5 },
    content: 'Is anyone else facing absolute lockouts for booking passport appointment slots? I check the passport seva portal daily at 5 PM but all slots in Bangalore are booked within seconds. Highly frustrated!',
    country: 'India',
    language: 'en'
  },
  // English - Tatkal
  {
    platform: 'youtube',
    author: { username: 'Travel Hacks India', handle: '@travel_hacks_in', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', verified: true, followers: 45000 },
    content: 'Highly recommended tatkal service. Needed my passport within 5 days for an emergency business meet. Applied tatkal passport online, got police verification done in 24 hours, passport in hand on day 3. Exceptional efficiency!',
    country: 'India',
    language: 'en'
  },
  // English - Visa Issues
  {
    platform: 'twitter',
    author: { username: 'Sarah Jenkins', handle: '@sarah_j', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', verified: false, followers: 3100 },
    content: 'Still waiting on my visa issue resolution. The embassy has held my travel documents for over six weeks. Customer support is completely unresponsive and my travel tickets are non-refundable. So stressful.',
    country: 'United States',
    language: 'en'
  },
  // English - Scams / Fraud
  {
    platform: 'instagram',
    author: { username: 'watchdog_security', handle: '@watchdog_sec', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', verified: true, followers: 28000 },
    content: 'scam alert: fake agent charged me double. Warning to all travel enthusiasts! Fake passport booking portals are mimicking the official Government site. They charge heavy premiums and steal credentials.',
    country: 'Canada',
    language: 'en'
  },
  // English - Government Announcements
  {
    platform: 'linkedin',
    author: { username: 'Global Mobility Group', handle: 'global-mobility-gp', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', verified: true, followers: 54000 },
    content: 'The Ministry of External Affairs has officially introduced AI-based chatbots to expedite passport renewal queries and police verification schedules. A major upgrade in eliminating passport delays.',
    country: 'India',
    language: 'en'
  },
  // English - Travel Issues
  {
    platform: 'facebook',
    author: { username: 'Markus Vance', handle: 'markus.vance', avatar: '', verified: false, followers: 1100 },
    content: 'Stuck at customs due to a passport delay and minor mismatch in my travel documents. The authorities are being extremely strict. Double check all names and spellings before flying out!',
    country: 'United Kingdom',
    language: 'en'
  },
  // Punjabi - Renewal / Delay
  {
    platform: 'twitter',
    author: { username: 'Harpreet Singh', handle: '@harpreet_s', avatar: '', verified: false, followers: 120 },
    content: 'ਮੈਂ 2 ਮਹੀਨਿਆਂ ਤੋਂ ਆਪਣੇ ਪਾਸਪੋਰਟ ਦੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹਾਂ। ਪਤਾ ਨਹੀਂ ਪਾਸਪੋਰਟ ਦਫ਼ਤਰ ਵਾਲੇ ਕੀ ਕਰ ਰਹੇ ਨੇ। My passport delay is putting my student visa process at huge risk.',
    country: 'India',
    language: 'pa'
  },
  // Hindi - Renewal / Appointment
  {
    platform: 'twitter',
    author: { username: 'Pooja Verma', handle: '@pooja_v', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', verified: false, followers: 340 },
    content: 'पासपोर्ट रिन्यू कराने में बहुत देरी हो रही है। पासपोर्ट अपॉइंटमेंट के लिए स्लॉट ही नहीं मिल रहे। तत्काल पासपोर्ट का आवेदन किया था पर पुलिस वेरिफिकेशन अटका पड़ा है।',
    country: 'India',
    language: 'hi'
  },
  // Spanish - Visa issue / Scam
  {
    platform: 'facebook',
    author: { username: 'Elena Gómez', handle: 'elena.gomez.es', avatar: '', verified: false, followers: 670 },
    content: 'Cuidado con los fraudes de visas y pasaportes. Un agente falso me cobró el doble prometiendo una renovación rápida y me dio un documento falso. Hagan sus trámites solo en canales oficiales.',
    country: 'Spain',
    language: 'es'
  },
  // French - Travel Issues
  {
    platform: 'instagram',
    author: { username: 'Pierre Dubois', handle: '@pierre_travels', avatar: '', verified: false, followers: 1800 },
    content: 'Problème de visa et retard de passeport à l\'ambassade. Mon voyage d\'affaires en Asie est annulé car les documents ne sont pas arrivés à temps. Très déçu de l\'administration.',
    country: 'France',
    language: 'fr'
  },
  // German - Renewal
  {
    platform: 'twitter',
    author: { username: 'Jonas Weber', handle: '@jonas_w', avatar: '', verified: false, followers: 95 },
    content: 'Ich warte seit 2 Monaten auf meinen Reisepass. Die Passverlängerung dauert bei der Behörde viel zu lange. Meine Einwanderungspapiere sind fast abgelaufen.',
    country: 'Germany',
    language: 'de'
  },
  // Arabic - Visa / Travel
  {
    platform: 'twitter',
    author: { username: 'Fatima Al-Harbi', handle: '@fatima_h', avatar: '', verified: false, followers: 520 },
    content: 'عملية التأشيرة بطيئة للغاية وقد تسببت في تأخر جواز السفر الخاص بي. سأفقد منحة الجامعة بسبب هذه الإجراءات الطويلة في القنصلية.',
    country: 'United Arab Emirates',
    language: 'ar'
  },
  // Russian - Scam / Fraud
  {
    platform: 'reddit',
    author: { username: 'traveler_ru', handle: 'u/traveler_ru', avatar: '', verified: false, followers: 110 },
    content: 'Осторожно, мошенники! Фальшивый агент взял с меня вдвое больше за срочный загранпаспорт и пропал. Обращайтесь только через официальный портал Госуслуг.',
    country: 'Russia',
    language: 'ru'
  },
  // Chinese - Government Announcements
  {
    platform: 'linkedin',
    author: { username: 'Li Wei', handle: 'li-wei-immigration', avatar: '', verified: false, followers: 2300 },
    content: '领事馆发布最新通知：护照更新和签证办理将启用全新的数字化流程，以解决之前的护照延误和旅行证件积压问题。这是极好的消息。',
    country: 'Singapore',
    language: 'zh'
  },
  // Japanese - Personal Experience
  {
    platform: 'twitter',
    author: { username: 'Takahiro Sato', handle: '@taka_sato', avatar: '', verified: false, followers: 410 },
    content: 'パスポート申請予約が2日以内に取れました！即日パスポートの申請手続きは非常にスムーズで驚きました。新しい渡航文書を手に入れて大満足です。',
    country: 'Japan',
    language: 'ja'
  },
  // Gibberish / Bot Spam
  {
    platform: 'twitter',
    author: { username: 'SpamBot01', handle: '@spambot01', avatar: '', verified: false, followers: 0 },
    content: 'Haaaaahahahaaaaaa buy fast passport visa issue h1b visa scams cheat fake passports call 1-800-SPAM-NOW free visa guarantee! $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$',
    country: 'Global',
    language: 'en'
  },
  {
    platform: 'reddit',
    author: { username: 'troll_face', handle: 'u/troll_face_11', avatar: '', verified: false, followers: 0 },
    content: 'qwertypassportyuiopasdghjklzxcvbnmqwerty visa scam tatkal delay slots qwertypassportyuiop',
    country: 'Global',
    language: 'en'
  }
];

// Identical/Highly similar tweets to trigger Cosine Similarity Clustering
const clusteredTemplates = [
  {
    platform: 'twitter',
    author: { username: 'Rahul Roy', handle: '@rahul_roy', avatar: '', verified: false, followers: 15 },
    content: 'WARNING: Fake passport visa agent scam active! Do not transfer money to agents claiming fast-track renewals. scam alert: fake agent charged me double.',
    country: 'India',
    language: 'en'
  },
  {
    platform: 'twitter',
    author: { username: 'Vikas Kumar', handle: '@vikas_k', avatar: '', verified: false, followers: 30 },
    content: 'scam alert: fake agent charged me double. They claim they have connections to book passport appointments instantly under Tatkal but it is 100% fraud.',
    country: 'India',
    language: 'en'
  },
  {
    platform: 'twitter',
    author: { username: 'Sunita Rao', handle: '@sunita_rao', avatar: '', verified: false, followers: 145 },
    content: 'scam alert: fake agent charged me double. Spread the word! Official portals are the only safe way to get passport appointments booked.',
    country: 'India',
    language: 'en'
  }
];

const keywordsList = [
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

async function seedDatabase() {
  console.log('Connecting to database for seeding...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  // 1. Clean collections
  console.log('Cleaning up existing database records...');
  await User.deleteMany({});
  await Post.deleteMany({});
  console.log('Database collections cleared.');

  // 2. Seed Admin User
  console.log('Seeding default administrator...');
  const adminUser = new User({
    username: 'admin',
    email: 'admin@zebvo.com',
    password: 'password123', // Will be hashed via pre-save middleware
    role: 'admin'
  });
  await adminUser.save();
  console.log('Default administrator created: admin@zebvo.com / password123');

  // 3. Seed Posts
  console.log('Starting seed operations for 100+ realistic social media posts...');
  
  let totalSeeded = 0;
  
  // Combine individual templates and replicate with random dates/engagement metrics to reach 100+ entries
  const basePool = [...seedTemplateData, ...clusteredTemplates];

  for (let i = 0; i < 110; i++) {
    const template = basePool[i % basePool.length];
    
    // Create random details to make posts unique
    const uniquePostId = `seed_${i}_${Math.floor(Math.random() * 100000)}`;
    let content = template.content;

    // Add some random variation to content to show clustering cosine margins
    if (i >= basePool.length) {
      const suffix = ` [Update ref #${Math.floor(Math.random() * 9000) + 1000}]`;
      content = template.content + suffix;
    }

    // Run core services to build NLP/Gibberish/Clustering exactly matching active scraper pipelines
    const gibCheck = gibberishService.evaluateText(content);
    const nlpResult = nlpService.analyzeLocally(content);
    const clusterId = await clusteringService.clusterPost(content, uniquePostId);

    // Extract matched keywords
    const matchedKeywords = keywordsList.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matchedKeywords.length === 0) {
      matchedKeywords.push('passport');
    }

    // Generate realistic timestamp within the last 24 hours
    const hoursAgo = Math.random() * 24;
    const postDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const post = new Post({
      postId: uniquePostId,
      platform: template.platform,
      originalContent: content,
      translatedContent: {}, // Caches on-demand via dashboard translation clicks
      summary: nlpResult.summary,
      sentiment: nlpResult.sentiment,
      category: nlpResult.category,
      gibberish: gibCheck.isGibberish,
      gibberishReason: gibCheck.reason,
      clusterId: clusterId,
      author: {
        username: template.author.username,
        handle: template.author.handle,
        avatar: template.author.avatar || `https://images.unsplash.com/photo-${1500000000000 + i}?w=150`,
        verified: template.author.verified || Math.random() > 0.85,
        followers: template.author.followers || Math.floor(Math.random() * 1200)
      },
      engagement: {
        likes: Math.floor(Math.random() * 1200),
        shares: Math.floor(Math.random() * 300),
        comments: Math.floor(Math.random() * 150),
        views: Math.floor(Math.random() * 8000)
      },
      country: template.country,
      language: template.language,
      keywords: matchedKeywords,
      url: `https://www.${template.platform}.com/status/${uniquePostId}`,
      timestamp: postDate
    });

    await post.save();
    totalSeeded++;
  }

  console.log(`Successfully completed seeding! Seeded ${totalSeeded} posts and 1 administrator account.`);
  await mongoose.disconnect();
  console.log('Database seeding finished. Disconnected.');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('Error during seeding database:', err);
  process.exit(1);
});
