#!/usr/bin/env python3
"""
Convert markdown posts to JSON format for GitHub Pages compatibility
Usage: python convert-posts.py
"""

import os
import json
import re
from pathlib import Path

class MarkdownToJSON:
    def __init__(self):
        self.posts_dir = Path('./posts')
        self.output_dir = Path('./posts-json')
        self.output_dir.mkdir(exist_ok=True)

    def extract_front_matter(self, content):
        """Extract YAML front matter from markdown content"""
        front_matter_regex = r'^---\n(.*?)\n---\n(.*)'
        match = re.match(front_matter_regex, content, re.DOTALL)
        
        if match:
            front_matter = {}
            front_matter_lines = match.group(1).strip().split('\n')
            
            for line in front_matter_lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"\'')
                    
                    # Handle arrays (tags)
                    if value.startswith('[') and value.endswith(']'):
                        try:
                            value = json.loads(value)
                        except:
                            pass
                    
                    front_matter[key] = value
            
            return front_matter, match.group(2).strip()
        
        return {}, content

    def convert_all(self):
        """Convert all markdown files to JSON"""
        converted_posts = []
        
        # Process all markdown files
        for md_file in self.posts_dir.glob('*.md'):
            print(f"Processing: {md_file.name}")
            
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            front_matter, markdown_content = self.extract_front_matter(content)
            
            post_data = {
                'filename': md_file.name,
                **front_matter,
                'content': markdown_content
            }
            
            # Write individual JSON file
            json_filename = md_file.stem + '.json'
            json_path = self.output_dir / json_filename
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(post_data, f, indent=2, ensure_ascii=False)
            
            converted_posts.append(post_data)
            print(f"✓ Converted: {md_file.name} → {json_filename}")
        
        # Update posts-list.json
        posts_list = []
        for post in converted_posts:
            posts_list.append({
                'filename': post['filename'].replace('.md', '.json'),
                'title': post.get('title', 'Untitled'),
                'date': post.get('date', ''),
                'category': post.get('category', 'General'),
                'excerpt': post.get('excerpt', ''),
                'tags': post.get('tags', [])
            })
        
        # Sort by date (newest first)
        posts_list.sort(key=lambda x: x['date'], reverse=True)
        
        with open('posts-list.json', 'w', encoding='utf-8') as f:
            json.dump(posts_list, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Updated posts-list.json with {len(posts_list)} posts")
        return converted_posts

if __name__ == '__main__':
    converter = MarkdownToJSON()
    try:
        posts = converter.convert_all()
        print(f"🎉 Successfully converted {len(posts)} posts!")
    except Exception as e:
        print(f"❌ Error: {e}")