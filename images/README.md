# Images Directory Structure

This directory contains all images used in the blog, organized for optimal performance and organization.

## Directory Structure

```
images/
├── posts/          # Images used within blog post content
├── thumbnails/     # Smaller versions for post previews/cards
├── icons/          # UI icons and small graphics
└── README.md       # This documentation file
```

## Usage Guidelines

### Post Images (`images/posts/`)
- Store all images referenced in blog post content
- Use descriptive filenames: `understanding-gpt-architecture-diagram.png`
- Recommended formats: `.jpg` for photos, `.png` for diagrams/screenshots
- Keep file sizes reasonable (< 1MB for web performance)

### Thumbnails (`images/thumbnails/`)
- Optional: Create smaller versions of post images for previews
- Recommended size: 400x200px or similar aspect ratio
- Use for featured images in post cards

### Icons (`images/icons/`)
- Small graphics, logos, and UI elements
- SVG format preferred for scalability
- PNG for complex icons

## Image Optimization Tips

1. **Compression**: Use tools like TinyPNG or ImageOptim
2. **Sizing**: Resize images to actual display dimensions
3. **Format**: 
   - JPEG for photographs
   - PNG for screenshots/diagrams with transparency
   - SVG for simple graphics and icons
4. **Alt Text**: Always include descriptive alt text in markdown

## Usage in Markdown

```markdown
![Alt text description](images/posts/my-image.jpg "Optional title")
![Diagram](images/posts/architecture-diagram.png)
![Icon](images/icons/check-mark.svg)
```

## Best Practices

- Use consistent naming conventions
- Include post name/topic in filename
- Keep images relevant and high quality
- Consider mobile users (avoid huge images)
- Test images load correctly on both local and deployed versions