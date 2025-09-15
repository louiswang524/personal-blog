// Node.js script to convert markdown posts to JSON for GitHub Pages
const fs = require('fs');
const path = require('path');

class MarkdownToJSON {
    constructor() {
        this.postsDir = './posts';
        this.outputDir = './posts-json';
    }

    // Extract front matter from markdown
    extractFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            const frontMatter = {};
            const frontMatterLines = match[1].split('\n');
            
            frontMatterLines.forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    let value = valueParts.join(':').trim();

                    // Handle arrays (tags) - keep quotes for JSON parsing
                    if (value.startsWith('[') && value.endsWith(']')) {
                        value = JSON.parse(value);
                    } else {
                        // Remove quotes for regular string values
                        value = value.replace(/['"]/g, '');
                    }

                    frontMatter[key.trim()] = value;
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

    // Convert all markdown files to JSON
    async convertAll() {
        // Create output directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }

        // Read all markdown files
        const files = fs.readdirSync(this.postsDir)
            .filter(file => file.endsWith('.md'));

        const convertedPosts = [];

        for (const file of files) {
            const filePath = path.join(this.postsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            const { frontMatter, content: markdownContent } = this.extractFrontMatter(content);
            
            const postData = {
                filename: file,
                ...frontMatter,
                content: markdownContent
            };

            // Write individual JSON file
            const jsonFile = file.replace('.md', '.json');
            const jsonPath = path.join(this.outputDir, jsonFile);
            fs.writeFileSync(jsonPath, JSON.stringify(postData, null, 2));
            
            convertedPosts.push(postData);
            console.log(`✓ Converted: ${file} → ${jsonFile}`);
        }

        // Update posts-list.json with the new format
        const postsList = convertedPosts.map(post => ({
            filename: post.filename.replace('.md', '.json'),
            title: post.title,
            date: post.date,
            category: post.category,
            excerpt: post.excerpt,
            tags: post.tags || []
        }));

        fs.writeFileSync('./posts-list.json', JSON.stringify(postsList, null, 2));
        console.log(`✓ Updated posts-list.json with ${postsList.length} posts`);

        return convertedPosts;
    }
}

// Run the conversion
const converter = new MarkdownToJSON();
converter.convertAll().then(() => {
    console.log('🎉 All posts converted successfully!');
}).catch(error => {
    console.error('❌ Error converting posts:', error);
});