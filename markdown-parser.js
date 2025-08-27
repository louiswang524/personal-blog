// Simple Markdown to HTML converter
class MarkdownParser {
    constructor() {
        this.rules = [
            // Headers
            { pattern: /^### (.*$)/gim, replacement: '<h3>$1</h3>' },
            { pattern: /^## (.*$)/gim, replacement: '<h2>$1</h2>' },
            { pattern: /^# (.*$)/gim, replacement: '<h1>$1</h1>' },
            
            // Bold and Italic
            { pattern: /\*\*\*(.*)\*\*\*/gim, replacement: '<strong><em>$1</em></strong>' },
            { pattern: /\*\*(.*)\*\*/gim, replacement: '<strong>$1</strong>' },
            { pattern: /\*(.*)\*/gim, replacement: '<em>$1</em>' },
            
            // Code blocks
            { pattern: /```([\s\S]*?)```/gim, replacement: '<pre><code>$1</code></pre>' },
            { pattern: /`(.*?)`/gim, replacement: '<code>$1</code>' },
            
            // Links
            { pattern: /\[([^\]]*)\]\(([^\)]*)\)/gim, replacement: '<a href="$2">$1</a>' },
            
            // Images
            { pattern: /!\[([^\]]*)\]\(([^\)]*)\)/gim, replacement: '<img alt="$1" src="$2" />' },
            
            // Blockquotes
            { pattern: /^\> (.*$)/gim, replacement: '<blockquote>$1</blockquote>' },
            
            // Lists
            { pattern: /^\* (.*$)/gim, replacement: '<li>$1</li>' },
            { pattern: /^\d+\. (.*$)/gim, replacement: '<li>$1</li>' },
            
            // Horizontal rule
            { pattern: /^\-\-\-$/gim, replacement: '<hr>' },
            
            // Line breaks
            { pattern: /\n$/gim, replacement: '<br />' }
        ];
    }
    
    parse(markdown) {
        let html = markdown;
        
        // Process each rule
        for (let rule of this.rules) {
            html = html.replace(rule.pattern, rule.replacement);
        }
        
        // Convert paragraphs
        html = this.convertParagraphs(html);
        
        // Wrap lists
        html = this.wrapLists(html);
        
        return html;
    }
    
    convertParagraphs(html) {
        // Split by double line breaks
        const paragraphs = html.split('\n\n');
        
        return paragraphs.map(p => {
            p = p.trim();
            if (p === '') return '';
            
            // Don't wrap if it's already an HTML element
            if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || 
                p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<li') || 
                p.startsWith('<hr')) {
                return p;
            }
            
            return `<p>${p}</p>`;
        }).join('\n\n');
    }
    
    wrapLists(html) {
        // Wrap consecutive <li> elements in <ul>
        html = html.replace(/(<li>.*<\/li>)(\s*\n\s*<li>.*<\/li>)*/gim, function(match) {
            return '<ul>\n' + match + '\n</ul>';
        });
        
        return html;
    }
    
    extractFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            const frontMatter = {};
            const frontMatterLines = match[1].split('\n');
            
            frontMatterLines.forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    frontMatter[key.trim()] = valueParts.join(':').trim().replace(/['"]/g, '');
                }
            });
            
            return {
                frontMatter,
                content: match[2]
            };
        }
        
        return {
            frontMatter: {},
            content
        };
    }
}

// Blog generator
class BlogGenerator {
    constructor() {
        this.parser = new MarkdownParser();
    }
    
    async loadPost(filename) {
        try {
            console.log('Loading post:', filename);
            const response = await fetch(`posts/${filename}`);
            
            if (!response.ok) {
                console.error(`Failed to load post: ${response.status} ${response.statusText}`);
                throw new Error(`Post not found: ${filename} (${response.status})`);
            }
            
            const content = await response.text();
            console.log('Post content loaded successfully');
            
            const { frontMatter, content: markdownContent } = this.parser.extractFrontMatter(content);
            const htmlContent = this.parser.parse(markdownContent);
            
            return {
                ...frontMatter,
                content: htmlContent,
                filename
            };
        } catch (error) {
            console.error('Error loading post:', error);
            return {
                title: 'Error Loading Post',
                content: `<div class="error">
                    <h2>Failed to Load Post</h2>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>Filename:</strong> ${filename}</p>
                    <p>This might happen if:</p>
                    <ul>
                        <li>You're opening the file directly in browser (use a local server instead)</li>
                        <li>The markdown file doesn't exist</li>
                        <li>There's a network connectivity issue</li>
                    </ul>
                    <p><strong>Solution:</strong> Run <code>python serve.py</code> and visit <code>http://localhost:8000</code></p>
                </div>`,
                date: new Date().toISOString().split('T')[0],
                category: 'Error'
            };
        }
    }
    
    async loadPostsList() {
        try {
            const response = await fetch('posts-list.json');
            if (!response.ok) throw new Error('Posts list not found');
            return await response.json();
        } catch (error) {
            console.error('Error loading posts list:', error);
            return [];
        }
    }
    
    generatePostCard(post) {
        const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <article class="post-card">
                <div class="post-meta">
                    <span class="post-date">${date}</span>
                    <span class="post-category">${post.category || 'General'}</span>
                </div>
                <h4 class="post-title">${post.title}</h4>
                <p class="post-excerpt">${post.excerpt || ''}</p>
                <a href="post.html?file=${post.filename}" class="read-more">Read More</a>
            </article>
        `;
    }
    
    async renderPosts() {
        const posts = await this.loadPostsList();
        const postsGrid = document.querySelector('.posts-grid');
        
        if (postsGrid && posts.length > 0) {
            postsGrid.innerHTML = posts.map(post => this.generatePostCard(post)).join('');
        }
    }
    
    async renderSinglePost(filename) {
        const post = await this.loadPost(filename);
        if (!post) {
            document.body.innerHTML = '<h1>Post not found</h1>';
            return;
        }
        
        const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.title = `${post.title} - My Personal Blog`;
        
        const postContent = document.querySelector('.post-content');
        if (postContent) {
            postContent.innerHTML = `
                <header class="post-header">
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <span>Published on ${date}</span> • <span>${post.category || 'General'}</span>
                    </div>
                </header>
                <div class="post-body">
                    ${post.content}
                </div>
            `;
        }
    }
}

// Initialize blog generator
const blog = new BlogGenerator();