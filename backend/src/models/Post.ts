import { Schema, model } from 'mongoose';

const PostSchema = new Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit', 'youtube', 'instagram', 'facebook', 'linkedin', 'tiktok'],
    index: true
  },
  originalContent: {
    type: String,
    required: true
  },
  translatedContent: {
    type: Map,
    of: String,
    default: {}
  },
  summary: {
    type: String,
    default: ''
  },
  sentiment: {
    label: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: true // value between -1 and 1
    }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Application',
      'Renewal',
      'Appointments',
      'Tatkal',
      'Visa',
      'Travel Issues',
      'Government Announcements',
      'Scams/Fraud',
      'News',
      'Personal Experiences'
    ],
    index: true
  },
  gibberish: {
    type: Boolean,
    default: false,
    index: true
  },
  gibberishReason: {
    type: String,
    default: ''
  },
  clusterId: {
    type: String,
    default: null,
    index: true
  },
  author: {
    username: { type: String, required: true },
    handle: { type: String, required: true },
    avatar: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    followers: { type: Number, default: 0 }
  },
  engagement: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  country: {
    type: String,
    default: 'Global',
    index: true
  },
  language: {
    type: String,
    default: 'en',
    index: true
  },
  keywords: [{
    type: String,
    index: true
  }],
  url: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Configure full-text indexes for advanced search on original text, translations, summaries, and handles
PostSchema.index({
  originalContent: 'text',
  summary: 'text',
  'translatedContent.$**': 'text',
  'author.username': 'text',
  'author.handle': 'text'
}, {
  weights: {
    originalContent: 10,
    'translatedContent.$**': 5,
    summary: 3,
    'author.username': 1,
    'author.handle': 1
  },
  name: 'PostTextSearchIndex'
});

export const Post = model('Post', PostSchema);
export default Post;
