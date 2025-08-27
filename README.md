# Personal Blog with Markdown Support

A modern, responsive personal blog that supports Markdown posts for easy content creation and editing.

## Features

- 📝 **Markdown Support**: Write posts in Markdown format
- 📱 **Responsive Design**: Looks great on all devices
- 🎨 **Modern UI**: Clean, professional design
- 🚀 **GitHub Pages Ready**: Easy deployment
- 📖 **Dynamic Post Loading**: Automatically loads posts from markdown files
- 🔍 **SEO Friendly**: Proper meta tags and semantic HTML

## File Structure

```
personal-blog/
├── index.html              # Main homepage
├── post.html               # Template for individual posts
├── styles.css              # All CSS styles
├── script.js               # Interactive features
├── markdown-parser.js      # Markdown to HTML converter
├── posts-list.json         # Configuration file listing all posts
├── posts/                  # Directory containing all blog posts
│   ├── web-development-guide.md
│   ├── art-of-learning.md
│   └── responsive-design.md
└── README.md               # This file
```

## How to Create a New Blog Post

### Step 1: Create a Markdown File

1. Create a new `.md` file in the `posts/` directory
2. Use a descriptive filename (e.g., `my-awesome-post.md`)

### Step 2: Add Front Matter

Every post must start with YAML front matter containing metadata:

```markdown
---
title: Your Post Title
date: 2025-08-27
category: Technology
excerpt: A brief description of your post that will appear on the homepage.
---

# Your Post Title

Your post content goes here...
```

**Required Front Matter Fields:**
- `title`: The title of your post
- `date`: Publication date (YYYY-MM-DD format)
- `category`: Post category (e.g., Technology, Life, Tutorial)
- `excerpt`: Short description for the homepage

### Step 3: Write Your Content

Use standard Markdown syntax for formatting:

```markdown
## Headings

Use `#` for headings. The title in front matter becomes the main heading.

## Lists

* Bullet point 1
* Bullet point 2
* Bullet point 3

1. Numbered list item
2. Another numbered item

## Text Formatting

**Bold text** and *italic text*

## Code

Inline `code` and code blocks:

```javascript
function hello() {
    console.log("Hello, World!");
}
```

## Links and Images

[Link text](https://example.com)
![Alt text](path/to/image.jpg)

## Quotes

> This is a blockquote
> It can span multiple lines
```

### Step 4: Update Posts List

Add your new post to `posts-list.json`:

```json
[
  {
    "filename": "your-new-post.md",
    "title": "Your Post Title",
    "date": "2025-08-27",
    "category": "Technology",
    "excerpt": "Brief description of your post."
  }
]
```

**Important**: Posts are displayed in the order they appear in this file.

### Step 5: Test Locally

Open `index.html` in your browser to see your new post appear on the homepage.

## Markdown Syntax Reference

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Emphasis
```markdown
*italic*
**bold**
***bold italic***
```

### Lists
```markdown
* Unordered list
* Another item

1. Ordered list
2. Another item
```

### Links
```markdown
[Link text](URL)
[Link with title](URL "Title")
```

### Images
```markdown
![Alt text](image-url)
```

### Code
```markdown
Inline `code`

```
Code block
```
```

### Blockquotes
```markdown
> This is a quote
> Multiple lines
```

### Horizontal Rules
```markdown
---
```

## Deployment to GitHub Pages

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/personal-blog.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to Pages section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save

3. **Access Your Blog**:
   Your blog will be available at: `https://USERNAME.github.io/personal-blog/`

## Customization

### Styling
Edit `styles.css` to customize colors, fonts, and layout.

### Content
- Update the hero section in `index.html`
- Modify the About section
- Update contact links with your information

### Categories
Create new categories by simply using them in your post front matter. The system automatically handles new categories.

## Best Practices

1. **Consistent Naming**: Use descriptive, URL-friendly filenames
2. **Post Order**: Organize posts chronologically in `posts-list.json`
3. **Images**: Store images in an `images/` folder and reference them relatively
4. **SEO**: Write descriptive titles and excerpts
5. **Readability**: Break up long posts with headers and lists

## Troubleshooting

### Posts Not Showing
- Check that the post is listed in `posts-list.json`
- Verify the markdown file exists in the `posts/` directory
- Ensure front matter is properly formatted

### Formatting Issues
- Validate your Markdown syntax
- Check for proper spacing around headers and lists
- Ensure code blocks use triple backticks

### Local Development
Since this uses JavaScript fetch requests, you may need to serve the files through a local server for testing:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then visit `http://localhost:8000`

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).