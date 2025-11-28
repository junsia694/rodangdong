import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  // Gemini API Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCDqXoE3jbTKQlnSUHJ17Z_orNctN0edVA',
    model: 'gemini-3.0-flash'
  },

  // Blogger API Configuration
  blogger: {
    blogId: process.env.BLOGGER_BLOG_ID || '4116188036281914326',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  },

  // Unsplash API Configuration
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    baseUrl: 'https://api.unsplash.com'
  },

  // Application Configuration
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    minWordCount: parseInt(process.env.MIN_WORD_COUNT) || 1200,
    minImagesCount: parseInt(process.env.MIN_IMAGES_COUNT) || 2
  },

  // Scheduling Configuration
  schedule: {
    cronSchedule: process.env.CRON_SCHEDULE || '0 */3 * * *', // 3시간마다
    postScheduleHours: parseInt(process.env.POST_SCHEDULE_HOURS) || 24
  },

  // File Paths
  paths: {
    dataDir: join(__dirname, '../data'),
    usedKeywordsFile: join(__dirname, '../data/used_keywords.json'),
    logsDir: join(__dirname, '../logs')
  }
};

// Validate required environment variables
export const validateConfig = () => {
  const required = [
    'GEMINI_API_KEY',
    'BLOGGER_BLOG_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env file or environment configuration.');
  }

  return missing.length === 0;
};
