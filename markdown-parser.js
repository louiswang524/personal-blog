// Enhanced Markdown to HTML converter
class MarkdownParser {
    constructor() {
        // More comprehensive parsing with better order and handling
        this.rules = [];
    }
    
    parse(markdown) {
        let html = markdown;
        
        // Process in specific order for better results
        html = this.processCodeBlocks(html);
        html = this.processHeaders(html);
        html = this.processHorizontalRules(html);
        html = this.processBlockquotes(html);
        html = this.processLists(html);
        html = this.processImages(html);
        html = this.processLinks(html);
        html = this.processTables(html);
        html = this.processTextFormatting(html);
        html = this.processInlineCode(html);
        html = this.processLineBreaks(html);
        html = this.processParagraphs(html);
        
        return html;
    }
    
    processCodeBlocks(html) {
        // Handle fenced code blocks with language specification
        html = html.replace(/```(\w+)?\n?([\s\S]*?)```/gim, (match, language, code) => {
            const lang = language ? ` class="language-${language}"` : '';
            const trimmedCode = code.trim();
            return `<pre><code${lang}>${this.escapeHtml(trimmedCode)}</code></pre>`;
        });
        
        return html;
    }
    
    processHeaders(html) {
        // Handle headers H1-H6
        html = html.replace(/^#{6}\s+(.*)$/gim, '<h6>$1</h6>');
        html = html.replace(/^#{5}\s+(.*)$/gim, '<h5>$1</h5>');
        html = html.replace(/^#{4}\s+(.*)$/gim, '<h4>$1</h4>');
        html = html.replace(/^#{3}\s+(.*)$/gim, '<h3>$1</h3>');
        html = html.replace(/^#{2}\s+(.*)$/gim, '<h2>$1</h2>');
        html = html.replace(/^#{1}\s+(.*)$/gim, '<h1>$1</h1>');
        
        return html;
    }
    
    processHorizontalRules(html) {
        // Handle horizontal rules
        html = html.replace(/^[-*_]{3,}$/gim, '<hr>');
        return html;
    }
    
    processBlockquotes(html) {
        // Handle blockquotes - improved to handle multiple lines
        const lines = html.split('\n');
        let inBlockquote = false;
        let blockquoteContent = '';
        let result = [];
        
        for (let line of lines) {
            if (line.startsWith('> ')) {
                if (!inBlockquote) {
                    inBlockquote = true;
                    blockquoteContent = '';
                }
                blockquoteContent += line.substring(2) + '\n';
            } else {
                if (inBlockquote) {
                    result.push(`<blockquote>${blockquoteContent.trim()}</blockquote>`);
                    inBlockquote = false;
                }
                result.push(line);
            }
        }
        
        if (inBlockquote) {
            result.push(`<blockquote>${blockquoteContent.trim()}</blockquote>`);
        }
        
        return result.join('\n');
    }
    
    processLists(html) {
        const lines = html.split('\n');
        let result = [];
        let inOrderedList = false;
        let inUnorderedList = false;
        let listItems = [];
        let currentIndentLevel = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Check for unordered list items
            const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
            // Check for ordered list items
            const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
            
            if (unorderedMatch) {
                const [, indent, content] = unorderedMatch;
                const indentLevel = indent.length;
                
                if (inOrderedList) {
                    result.push('<ol>');
                    result.push(...listItems);
                    result.push('</ol>');
                    listItems = [];
                    inOrderedList = false;
                }
                
                if (!inUnorderedList) {
                    inUnorderedList = true;
                    currentIndentLevel = indentLevel;
                }
                
                listItems.push(`<li>${content}</li>`);
            } else if (orderedMatch) {
                const [, indent, content] = orderedMatch;
                const indentLevel = indent.length;
                
                if (inUnorderedList) {
                    result.push('<ul>');
                    result.push(...listItems);
                    result.push('</ul>');
                    listItems = [];
                    inUnorderedList = false;
                }
                
                if (!inOrderedList) {
                    inOrderedList = true;
                    currentIndentLevel = indentLevel;
                }
                
                listItems.push(`<li>${content}</li>`);
            } else {
                // End current list if we're in one
                if (inUnorderedList) {
                    result.push('<ul>');
                    result.push(...listItems);
                    result.push('</ul>');
                    listItems = [];
                    inUnorderedList = false;
                } else if (inOrderedList) {
                    result.push('<ol>');
                    result.push(...listItems);
                    result.push('</ol>');
                    listItems = [];
                    inOrderedList = false;
                }
                
                result.push(line);
            }
        }
        
        // Handle remaining list items
        if (inUnorderedList) {
            result.push('<ul>');
            result.push(...listItems);
            result.push('</ul>');
        } else if (inOrderedList) {
            result.push('<ol>');
            result.push(...listItems);
            result.push('</ol>');
        }
        
        return result.join('\n');
    }
    
    processImages(html) {
        // Handle images with alt text and optional titles
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/gim, (match, alt, src, title) => {
            const titleAttr = title ? ` title="${title}"` : '';
            
            // Add responsive image wrapper and enhanced attributes
            return `<figure class="image-figure">
                <img src="${src}" alt="${alt}"${titleAttr} loading="lazy" class="responsive-image" />
                ${title ? `<figcaption class="image-caption">${title}</figcaption>` : ''}
            </figure>`;
        });
        
        return html;
    }
    
    processLinks(html) {
        // Handle links with optional titles
        html = html.replace(/\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/gim, (match, text, href, title) => {
            const titleAttr = title ? ` title="${title}"` : '';
            const target = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
        });
        
        return html;
    }
    
    processTables(html) {
        // Handle tables (basic implementation)
        const lines = html.split('\n');
        let result = [];
        let inTable = false;
        let tableRows = [];
        let isHeaderProcessed = false;
        
        for (let line of lines) {
            if (line.includes('|') && line.trim().length > 0) {
                if (!inTable) {
                    inTable = true;
                    isHeaderProcessed = false;
                }
                
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
                
                // Check if this is a separator line
                if (cells.every(cell => /^[-:]+$/.test(cell))) {
                    continue; // Skip separator line
                }
                
                const tag = !isHeaderProcessed ? 'th' : 'td';
                const row = `<tr>${cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
                tableRows.push(row);
                
                if (!isHeaderProcessed) {
                    isHeaderProcessed = true;
                }
            } else {
                if (inTable) {
                    const tableHtml = isHeaderProcessed 
                        ? `<table><thead>${tableRows[0]}</thead><tbody>${tableRows.slice(1).join('')}</tbody></table>`
                        : `<table><tbody>${tableRows.join('')}</tbody></table>`;
                    result.push(tableHtml);
                    tableRows = [];
                    inTable = false;
                    isHeaderProcessed = false;
                }
                result.push(line);
            }
        }
        
        if (inTable) {
            const tableHtml = isHeaderProcessed 
                ? `<table><thead>${tableRows[0]}</thead><tbody>${tableRows.slice(1).join('')}</tbody></table>`
                : `<table><tbody>${tableRows.join('')}</tbody></table>`;
            result.push(tableHtml);
        }
        
        return result.join('\n');
    }
    
    processTextFormatting(html) {
        // Handle bold, italic, strikethrough in correct order
        html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>'); // Strikethrough
        html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>'); // Bold italic
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>'); // Italic
        html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>'); // Bold (alternative)
        html = html.replace(/_(.*?)_/gim, '<em>$1</em>'); // Italic (alternative)
        
        return html;
    }
    
    processInlineCode(html) {
        // Handle inline code (after other processing to avoid conflicts)
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        return html;
    }
    
    processLineBreaks(html) {
        // Handle line breaks (double space + newline)
        html = html.replace(/  \n/gim, '<br>\n');
        return html;
    }
    
    processParagraphs(html) {
        // Split by double line breaks and wrap in paragraphs
        const blocks = html.split(/\n\s*\n/);
        
        return blocks.map(block => {
            block = block.trim();
            if (block === '') return '';
            
            // Don't wrap if it's already an HTML block element
            if (this.isBlockElement(block)) {
                return block;
            }
            
            return `<p>${block}</p>`;
        }).join('\n\n');
    }
    
    isBlockElement(html) {
        const blockTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'blockquote', 
                          'pre', 'ul', 'ol', 'li', 'hr', 'table', 'thead', 'tbody', 'tr'];
        
        for (let tag of blockTags) {
            if (html.startsWith(`<${tag}`)) {
                return true;
            }
        }
        return false;
    }
    
    escapeHtml(text) {
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        };
        
        return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
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
                <h4 class="post-title"><a href="post.html?file=${post.filename}" class="post-title-link">${post.title}</a></h4>
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