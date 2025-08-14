# PowerShell script to update import paths in TrendWise project

Write-Host "🔄 Updating import paths in TrendWise project..." -ForegroundColor Green

# Define the mappings
$mappings = @{
    # Auth imports
    "from '@/lib/auth'" = "from '@/lib/config/auth'"
    "import { authOptions } from '@/lib/auth'" = "import { authOptions } from '@/lib/config/auth'"
    
    # MongoDB imports
    "from '@/lib/mongodb'" = "from '@/lib/database/mongodb'"
    "import connectDB from '@/lib/mongodb'" = "import connectDB from '@/lib/database/mongodb'"
    
    # Model imports
    "from '@/lib/models/" = "from '@/lib/database/models/"
    "import Article from '@/lib/models/Article'" = "import Article from '@/lib/database/models/Article'"
    "import User from '@/lib/models/User'" = "import User from '@/lib/database/models/User'"
    "import Comment from '@/lib/models/Comment'" = "import Comment from '@/lib/database/models/Comment'"
    "import Bookmark from '@/lib/models/Bookmark'" = "import Bookmark from '@/lib/database/models/Bookmark'"
    
    # OpenAI imports
    "from '@/lib/openai'" = "from '@/lib/services/openai'"
    
    # Utils imports
    "from '@/lib/utils'" = "from '@/lib/utils/utils'"
    "from '@/lib/stats-cache'" = "from '@/lib/utils/stats-cache'"
    "from '@/lib/trending'" = "from '@/lib/utils/trending'"
    
    # Component imports
    "from '@/components/Header'" = "from '@/components/layout/Header'"
    "from '@/components/Footer'" = "from '@/components/layout/Footer'"
    "from '@/components/SearchBar'" = "from '@/components/layout/SearchBar'"
    "from '@/components/SessionProvider'" = "from '@/components/layout/SessionProvider'"
    "from '@/components/SessionSynchronizer'" = "from '@/components/layout/SessionSynchronizer'"
    
    "from '@/components/AdminDashboard'" = "from '@/components/admin/AdminDashboard'"
    "from '@/components/AdminGuard'" = "from '@/components/admin/AdminGuard'"
    "from '@/components/UnifiedArticleGenerator'" = "from '@/components/admin/UnifiedArticleGenerator'"
    "from '@/components/StatsDashboard'" = "from '@/components/admin/StatsDashboard'"
    
    "from '@/components/OptimizedImage'" = "from '@/components/ui/OptimizedImage'"
    "from '@/components/ShareButtons'" = "from '@/components/ui/ShareButtons'"
    "from '@/components/BookmarkButton'" = "from '@/components/ui/BookmarkButton'"
    
    "from '@/components/ArticleGrid'" = "from '@/components/features/ArticleGrid'"
    "from '@/components/FeaturedArticles'" = "from '@/components/features/FeaturedArticles'"
    "from '@/components/Hero'" = "from '@/components/features/Hero'"
    "from '@/components/MediaSection'" = "from '@/components/features/MediaSection'"
    "from '@/components/CommentSection'" = "from '@/components/features/CommentSection'"
    "from '@/components/RelatedArticles'" = "from '@/components/features/RelatedArticles'"
}

# Get all TypeScript files in app directory
$files = Get-ChildItem -Path "app" -Recurse -Include "*.ts", "*.tsx" -File

Write-Host "Found $($files.Count) files to process" -ForegroundColor Yellow

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false
    
    foreach ($old in $mappings.Keys) {
        $new = $mappings[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "🎉 Import path updates completed!" -ForegroundColor Green
