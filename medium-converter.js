// Medium to Markdown converter utility
class MediumConverter {
    constructor() {
        this.blog = new BlogGenerator();
    }
    
    // Convert Medium article HTML to Markdown
    convertToMarkdown(title, content, publishDate, tags = [], subtitle = '') {
        // Clean up Medium-specific HTML
        let markdown = content
            // Remove Medium-specific elements
            .replace(/<div[^>]*class="[^"]*medium-[^"]*"[^>]*>.*?<\/div>/gs, '')
            .replace(/<figure[^>]*>.*?<\/figure>/gs, '') // Remove figures for now, can enhance later
            .replace(/<div[^>]*class="[^"]*graf[^"]*"[^>]*>/g, '')
            .replace(/<\/div>/g, '\n\n')
            
            // Convert headings
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1')
            
            // Convert paragraphs
            .replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n\n')
            
            // Convert emphasis
            .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
            .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
            .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
            
            // Convert links
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
            
            // Convert code
            .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
            .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gs, '```\n$1\n```')
            
            // Convert lists
            .replace(/<ul[^>]*>/g, '')
            .replace(/<\/ul>/g, '\n')
            .replace(/<ol[^>]*>/g, '')
            .replace(/<\/ol>/g, '\n')
            .replace(/<li[^>]*>(.*?)<\/li>/g, '* $1')
            
            // Convert blockquotes
            .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gs, (match, content) => {
                return content.split('\n').map(line => `> ${line.trim()}`).join('\n');
            })
            
            // Clean up extra whitespace
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/^\s+|\s+$/g, '')
            
            // Remove remaining HTML tags
            .replace(/<[^>]*>/g, '')
            
            // Decode HTML entities
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        
        // Create front matter
        const frontMatter = [
            '---',
            `title: ${title}`,
            `date: ${publishDate}`,
            `category: ${this.determineCategory(tags)}`,
            `excerpt: ${subtitle || this.generateExcerpt(markdown)}`,
            `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`,
            `source: medium`,
            '---',
            '',
            `# ${title}`,
            '',
            markdown
        ].join('\n');
        
        return frontMatter;
    }
    
    // Determine category based on tags
    determineCategory(tags) {
        const techTags = ['programming', 'javascript', 'python', 'web development', 'software', 'coding', 'technology', 'ai', 'machine learning'];
        const lifeTags = ['life', 'productivity', 'career', 'personal growth', 'leadership'];
        
        const lowerTags = tags.map(tag => tag.toLowerCase());
        
        if (techTags.some(tag => lowerTags.includes(tag))) {
            return 'Technology';
        } else if (lifeTags.some(tag => lowerTags.includes(tag))) {
            return 'Life';
        }
        
        return 'General';
    }
    
    // Generate excerpt from content
    generateExcerpt(content, maxLength = 150) {
        const plainText = content
            .replace(/#{1,6}\s/g, '') // Remove markdown headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();
        
        if (plainText.length <= maxLength) {
            return plainText;
        }
        
        return plainText.substring(0, maxLength).replace(/\s+\S*$/, '...').trim();
    }
    
    // Create filename from title
    createFilename(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            + '.md';
    }
    
    // Process a Medium article URL
    async processArticle(articleUrl) {
        try {
            console.log(`Processing: ${articleUrl}`);
            
            // This would fetch and parse the Medium article
            // For now, returning a template structure
            return {
                success: true,
                filename: 'example-article.md',
                title: 'Example Article Title',
                content: 'Article content would go here...'
            };
            
        } catch (error) {
            console.error(`Error processing article: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediumConverter;
}