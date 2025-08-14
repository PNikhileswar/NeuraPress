# Project Folder Structure

## 📁 Updated TrendWise Project Structure

```
TrendWise/
├── 📁 app/                              # Next.js App Router
│   ├── 📁 admin/                        # Admin routes
│   ├── 📁 api/                          # API endpoints
│   ├── 📁 article/[slug]/              # Dynamic article pages
│   ├── 📁 auth/                         # Authentication pages
│   ├── 📄 globals.css                   # Global styles
│   ├── 📄 layout.tsx                    # Root layout
│   └── 📄 page.tsx                      # Home page
│
├── 📁 src/                              # Source code (new organized structure)
│   ├── 📁 components/                   # React components
│   │   ├── 📁 admin/                    # Admin-specific components
│   │   │   ├── 📄 AdminDashboard.tsx    
│   │   │   ├── 📄 AdminGuard.tsx        
│   │   │   ├── 📄 UnifiedArticleGenerator.tsx
│   │   │   ├── 📄 StatsDashboard.tsx    
│   │   │   ├── 📄 StatsWidget.tsx       
│   │   │   ├── 📄 UserManagement.tsx    
│   │   │   ├── 📄 DirectNewsGeneration.tsx
│   │   │   └── 📄 ManualTopicSubmission.tsx
│   │   │
│   │   ├── 📁 features/                 # Feature-specific components
│   │   │   ├── 📄 ArticleGrid.tsx       # Article listing
│   │   │   ├── 📄 RelatedArticles.tsx   # Related content
│   │   │   ├── 📄 CommentSection.tsx    # Comments system
│   │   │   ├── 📄 Hero.tsx              # Homepage hero
│   │   │   ├── 📄 MediaSection.tsx      # Media display
│   │   │   ├── 📄 Tweet.tsx             # Tweet embed
│   │   │   ├── 📄 DynamicCategoriesGrid.tsx
│   │   │   └── 📄 UnsplashDemo.tsx      
│   │   │
│   │   ├── 📁 layout/                   # Layout components
│   │   │   ├── 📄 Header.tsx            # Site header
│   │   │   ├── 📄 Footer.tsx            # Site footer
│   │   │   ├── 📄 SearchBar.tsx         # Search functionality
│   │   │   ├── 📄 SessionProvider.tsx   # Auth provider
│   │   │   └── 📄 SessionSynchronizer.tsx # Session sync
│   │   │
│   │   ├── 📁 ui/                       # Reusable UI components
│   │   │   ├── 📄 OptimizedImage.tsx    # Image optimization
│   │   │   ├── 📄 ShareButtons.tsx      # Social sharing
│   │   │   ├── 📄 BookmarkButton.tsx    # Bookmark functionality
│   │   │   ├── 📄 StructuredData.tsx    # SEO structured data
│   │   │   ├── 📄 UnsplashAttribution.tsx
│   │   │   └── 📄 UnsplashImage.tsx     
│   │   │
│   │   └── 📄 index.ts                  # Component exports
│   │
│   ├── 📁 hooks/                        # Custom React hooks
│   │   ├── 📄 useAdminStatusChecker.ts  # Admin status management
│   │   ├── 📄 useAdminStatusMonitor.ts  # Admin monitoring
│   │   ├── 📄 useSessionMonitor.ts      # Session tracking
│   │   ├── 📄 useSessionRefresh.ts      # Session refresh
│   │   ├── 📄 useStats.ts               # Statistics hooks
│   │   └── 📄 index.ts                  # Hook exports
│   │
│   ├── 📁 lib/                          # Core libraries and utilities
│   │   ├── 📁 config/                   # Configuration files
│   │   │   └── 📄 auth.ts               # Authentication config
│   │   │
│   │   ├── 📁 database/                 # Database related
│   │   │   ├── 📁 models/               # MongoDB models
│   │   │   │   ├── 📄 Article.ts        
│   │   │   │   ├── 📄 User.ts           
│   │   │   │   ├── 📄 Comment.ts        
│   │   │   │   └── 📄 Bookmark.ts       
│   │   │   ├── 📄 mongodb.ts            # MongoDB connection
│   │   │   └── 📄 mongodb-client.ts     # MongoDB client
│   │   │
│   │   ├── 📁 services/                 # External services
│   │   │   ├── 📄 openai.ts             # OpenAI integration
│   │   │   ├── 📄 media-manager.ts      # Media handling
│   │   │   ├── 📄 current-news-generation.ts
│   │   │   ├── 📄 direct-news-generation.ts
│   │   │   └── 📄 realtime-news-generation.ts
│   │   │
│   │   ├── 📁 utils/                    # Utility functions
│   │   │   ├── 📄 utils.ts              # General utilities
│   │   │   ├── 📄 stats-cache.ts        # Statistics caching
│   │   │   └── 📄 trending.ts           # Trending logic
│   │   │
│   │   └── 📄 index.ts                  # Main lib exports
│   │
│   └── 📁 types/                        # TypeScript type definitions
│       └── 📄 index.ts                  # Type exports
│
├── 📁 public/                           # Static assets
│   ├── 📁 images/                       # Image assets
│   │   ├── 📁 fallback/                 # Fallback images
│   │   └── 📁 logos/                    # Logo assets
│   └── 📄 favicon.ico                   
│
├── 📁 scripts/                          # Utility scripts
│   ├── 📄 make-admin.js                 # Admin creation
│   ├── 📄 seed.js                       # Database seeding
│   └── 📄 setup-newsdata.js            # News API setup
│
├── 📄 package.json                      # Dependencies
├── 📄 tsconfig.json                     # TypeScript config (updated paths)
├── 📄 tailwind.config.js               # Tailwind CSS config
├── 📄 next.config.js                   # Next.js config
├── 📄 .gitignore                       # Git ignore (updated)
└── 📄 README.md                        # Documentation
```

## 🎯 Benefits of New Structure

### 1. **Component Organization**
- **Layout**: Header, Footer, Navigation components
- **UI**: Reusable atomic components (buttons, images, etc.)
- **Features**: Business logic components (articles, comments, etc.)
- **Admin**: Administrative interface components

### 2. **Library Organization**
- **Config**: Configuration files (auth, environment)
- **Database**: Models and connection logic
- **Services**: External API integrations
- **Utils**: Helper functions and utilities

### 3. **Better Imports**
```typescript
// Before
import Header from '../../../components/Header'
import { authOptions } from '../../../lib/auth'

// After  
import { Header } from '@/components'
import { authOptions } from '@/lib/config/auth'
```

### 4. **TypeScript Path Mapping**
Updated `tsconfig.json` with proper path aliases:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/types/*": ["./src/types/*"],
    "@/utils/*": ["./src/lib/utils/*"]
  }
}
```

### 5. **Index Files for Clean Exports**
- `src/components/index.ts` - All component exports
- `src/hooks/index.ts` - All hook exports  
- `src/lib/index.ts` - Main library exports

## 🚀 Next Steps

1. **Update Import Statements**: Update all import paths in existing files
2. **Test Build**: Ensure the application builds correctly
3. **Update Documentation**: Keep this structure documented
4. **Linting Rules**: Consider adding import/order ESLint rules

## 📝 Development Guidelines

- **Components**: One component per file, use PascalCase
- **Hooks**: Start with 'use', use camelCase
- **Utils**: Use camelCase for functions
- **Types**: Use PascalCase for interfaces/types
- **Files**: Use kebab-case for non-component files

This structure follows modern React/Next.js best practices and makes the codebase more maintainable and scalable.
