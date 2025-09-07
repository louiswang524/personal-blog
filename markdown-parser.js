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
        this.allPosts = [];
        this.filteredPosts = [];
        this.selectedTags = new Set();
        this.searchQuery = '';
    }
    
    async loadPost(filename) {
        try {
            console.log('Loading post:', filename);
            
            // Try JSON first (GitHub Pages compatible), then fallback to markdown
            let response, isJSON = false;
            
            if (filename.endsWith('.md')) {
                // Try JSON version first
                const jsonFilename = filename.replace('.md', '.json');
                response = await fetch(`posts-json/${jsonFilename}`);
                if (response.ok) {
                    isJSON = true;
                } else {
                    // Fallback to markdown file
                    response = await fetch(`posts/${filename}`);
                }
            } else if (filename.endsWith('.json')) {
                response = await fetch(`posts-json/${filename}`);
                isJSON = true;
            }
            
            if (!response.ok) {
                console.error(`Failed to load post: ${response.status} ${response.statusText}`);
                throw new Error(`Post not found: ${filename} (${response.status})`);
            }
            
            if (isJSON) {
                // Load from JSON
                const postData = await response.json();
                console.log('Post loaded from JSON successfully');
                
                const htmlContent = this.parser.parse(postData.content);
                
                return {
                    title: postData.title,
                    date: postData.date,
                    category: postData.category,
                    excerpt: postData.excerpt,
                    tags: postData.tags || [],
                    content: htmlContent,
                    filename: postData.filename
                };
            } else {
                // Load from markdown
                const content = await response.text();
                console.log('Post loaded from markdown successfully');
                
                const { frontMatter, content: markdownContent } = this.parser.extractFrontMatter(content);
                const htmlContent = this.parser.parse(markdownContent);
                
                return {
                    ...frontMatter,
                    content: htmlContent,
                    filename
                };
            }
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
                        <li>The post file doesn't exist</li>
                        <li>There's a network connectivity issue</li>
                    </ul>
                    <p><strong>For Local Testing:</strong> Run <code>python serve.py</code> and visit <code>http://localhost:8000</code></p>
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
            const posts = await response.json();
            this.allPosts = posts;
            this.filteredPosts = posts;
            return posts;
        } catch (error) {
            console.error('Error loading posts list:', error);
            return [];
        }
    }
    
    getAllTags() {
        const tagCounts = {};
        this.allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        return tagCounts;
    }
    
    filterPosts() {
        this.filteredPosts = this.allPosts.filter(post => {
            // Filter by selected tags
            if (this.selectedTags.size > 0) {
                const postTags = post.tags || [];
                const hasSelectedTag = Array.from(this.selectedTags).some(selectedTag => 
                    postTags.includes(selectedTag)
                );
                if (!hasSelectedTag) return false;
            }
            
            // Filter by search query
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase();
                const matchesTitle = post.title.toLowerCase().includes(query);
                const matchesExcerpt = (post.excerpt || '').toLowerCase().includes(query);
                const matchesTags = (post.tags || []).some(tag => 
                    tag.toLowerCase().includes(query)
                );
                const matchesCategory = (post.category || '').toLowerCase().includes(query);
                
                if (!matchesTitle && !matchesExcerpt && !matchesTags && !matchesCategory) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderFilteredPosts();
    }
    
    renderFilteredPosts() {
        const postsGrid = document.querySelector('.posts-grid');
        if (postsGrid) {
            if (this.filteredPosts.length > 0) {
                postsGrid.innerHTML = this.filteredPosts.map(post => this.generatePostCard(post)).join('');
            } else {
                postsGrid.innerHTML = `
                    <div class="no-results" style="text-align: center; padding: 2rem; color: #6b7280;">
                        <h3>No posts found</h3>
                        <p>Try adjusting your search criteria or clearing filters.</p>
                    </div>
                `;
            }
        }
    }
    
    generateTagElement(tag, count) {
        const isSelected = this.selectedTags.has(tag);
        return `
            <button class="tag-filter ${isSelected ? 'active' : ''}" data-tag="${tag}">
                ${tag} <span class="tag-count">(${count})</span>
            </button>
        `;
    }
    
    renderTags() {
        const tagCounts = this.getAllTags();
        const tagsContainer = document.getElementById('tags-container');
        
        if (tagsContainer && Object.keys(tagCounts).length > 0) {
            // Sort tags by count (descending) then alphabetically
            const sortedTags = Object.entries(tagCounts).sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count
                return a[0].localeCompare(b[0]); // Then alphabetically
            });
            
            tagsContainer.innerHTML = sortedTags
                .map(([tag, count]) => this.generateTagElement(tag, count))
                .join('');
            
            // Add event listeners to tag buttons
            tagsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-filter')) {
                    const tag = e.target.dataset.tag;
                    this.toggleTag(tag);
                }
            });
        }
    }
    
    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }
        
        // Update tag button appearance
        const tagButtons = document.querySelectorAll('.tag-filter');
        tagButtons.forEach(button => {
            if (button.dataset.tag === tag) {
                button.classList.toggle('active');
            }
        });
        
        this.filterPosts();
    }
    
    clearFilters() {
        this.selectedTags.clear();
        this.searchQuery = '';
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        // Refresh tags display
        this.renderTags();
        
        // Reset to show all posts
        this.filteredPosts = this.allPosts;
        this.renderFilteredPosts();
    }
    
    setupSearchAndFilters() {
        // Setup search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterPosts();
            });
        }
        
        // Setup clear filters button
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }
    
    generatePostCard(post) {
        const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const tagsHtml = (post.tags && post.tags.length > 0) 
            ? `<div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
               </div>`
            : '';
        
        return `
            <article class="post-card">
                <div class="post-meta">
                    <span class="post-date">${date}</span>
                    <span class="post-category">${post.category || 'General'}</span>
                </div>
                <h4 class="post-title">${post.title}</h4>
                <p class="post-excerpt">${post.excerpt || ''}</p>
                ${tagsHtml}
                <a href="post.html?file=${post.filename}" class="read-more">Read More</a>
            </article>
        `;
    }
    
    async renderPosts() {
        const posts = await this.loadPostsList();
        const postsGrid = document.querySelector('.posts-grid');
        
        if (postsGrid && posts.length > 0) {
            postsGrid.innerHTML = posts.map(post => this.generatePostCard(post)).join('');
            
            // Initialize tags and search functionality
            this.renderTags();
            this.setupSearchAndFilters();
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