# Optimized Bookmark System

## Quick Start

Replace individual bookmark buttons with the optimized system:

```typescript
// Before: Each article makes individual API calls
<BookmarkButton articleId={article._id} />

// After: Single API call for all articles
<BookmarkProvider articleIds={articleIds}>
  <ContextBookmarkButton articleId={article._id} />
</BookmarkProvider>
```

## Implementation

### 1. Wrap your article grid
```typescript
import { BookmarkProvider, ContextBookmarkButton } from '@/components/ui/BookmarkProvider';

function ArticleGrid({ articles }) {
  const articleIds = articles.map(article => article._id);
  
  return (
    <BookmarkProvider articleIds={articleIds}>
      {articles.map(article => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </BookmarkProvider>
  );
}
```

### 2. Use the optimized button
```typescript
function ArticleCard({ article }) {
  return (
    <div>
      <h2>{article.title}</h2>
      <ContextBookmarkButton articleId={article._id} />
    </div>
  );
}
```

## Benefits

- **Performance**: 1 API call instead of N calls
- **Simple**: Uses simple star emojis (★☆) for clear visualization
- **Efficient**: Batch database queries with MongoDB `$in` operator
- **Scalable**: Works with any number of articles

## How It Works

1. `BookmarkProvider` collects all article IDs
2. Makes single API call to `/api/bookmarks/batch-check`
3. Returns bookmark status for all articles at once
4. Each `ContextBookmarkButton` reads from shared state
5. Toggle operations update both local state and database

## API Endpoint

```
POST /api/bookmarks/batch-check
Body: { articleIds: ["id1", "id2", "id3"] }
Response: { bookmarks: { "id1": true, "id2": false, "id3": true } }
```
