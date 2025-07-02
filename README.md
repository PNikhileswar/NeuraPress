# TrendWise - AI-Powered Blog Platform

A full-stack, SEO-optimized blog platform that automatically generates content from trending topics using AI.

## 🚀 Features

- **AI Content Generation**: Automatically creates articles using OpenAI GPT
- **Trending Topics**: Fetches trending topics from Google Trends and Twitter
- **SEO Optimized**: Complete meta tags, sitemaps, and structured data
- **User Authentication**: Google OAuth integration
- **Comment System**: Interactive commenting with replies
- **Responsive Design**: Beautiful, modern UI with TailwindCSS
- **Admin Dashboard**: Content management and bulk generation tools
- **Smart Image System**: Optimized image loading with unique, category-specific images
- **Performance Optimized**: Fast loading with Next.js Image optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TailwindCSS, TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4/3.5 Turbo
- **Scraping**: Playwright, Cheerio
- **Deployment**: Vercel

## 📋 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd TrendWise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Next.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/trendwise
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trendwise
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)

### 5. Set Up OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add it to your environment variables

### 6. Set Up MongoDB

Option A - Local MongoDB:
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

Option B - MongoDB Atlas:
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to environment variables

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3001` to see the application.

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

In Vercel dashboard, add these environment variables:

- `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET`: A secure random string
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `MONGODB_URI`: Your MongoDB connection string

## 📁 Project Structure

```
TrendWise/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── article/[slug]/    # Article detail pages
│   ├── admin/             # Admin dashboard
│   ├── login/             # Login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
├── lib/                   # Utility functions
│   ├── models/           # Database models
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   ├── openai.ts         # OpenAI integration
│   ├── trending.ts       # Trending topics scraper
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── package.json
```

## 🔧 Key Features Implementation

### Content Generation
- Trending topics are scraped from Google Trends
- OpenAI generates SEO-optimized articles
- Automatic meta tags and structured data

### SEO Optimization
- Dynamic sitemaps (`/sitemap.xml`)
- Robots.txt (`/robots.txt`)
- Meta tags and Open Graph
- JSON-LD structured data

### User Authentication
- Google OAuth via NextAuth.js
- Secure session management
- Protected routes and API endpoints

### Admin Features
- Content management dashboard
- Bulk article generation
- Featured article management
- Analytics overview

## 🎯 Usage

1. **Browse Articles**: Visit homepage to see latest articles
2. **Search**: Use search bar to find specific topics
3. **Filter by Category**: Click category links in navigation
4. **Read Articles**: Full article pages with comments
5. **Admin Panel**: Visit `/admin` for content management
6. **Generate Content**: Use admin panel to auto-generate articles

## 📊 API Endpoints

- `GET /api/articles` - List articles with pagination
- `GET /api/articles/[slug]` - Get single article
- `POST /api/articles` - Create new article
- `GET /api/comments` - Get comments for article
- `POST /api/comments` - Post new comment
- `GET /api/trending` - Get trending topics
- `POST /api/trending/generate` - Generate articles from trends

## 🔒 Security Features

- CSRF protection via NextAuth.js
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure environment variables
- Protected admin routes

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB URI format
   - Ensure MongoDB is running
   - Verify network access for Atlas

2. **Google OAuth Error**
   - Check redirect URIs in Google Console
   - Verify client ID and secret
   - Ensure domain is authorized

3. **OpenAI API Error**
   - Check API key validity
   - Verify usage limits
   - Handle rate limiting

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact via Internshala message

---

Built with ❤️ using Next.js, OpenAI, and modern web technologies.
