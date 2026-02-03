#!/usr/bin/env python3
"""Scrape public Telegram channel posts via og:description meta tags and embed widgets."""

import os
import re
import html as html_module
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CHANNEL = "zapiskidin"
MAX_POST_ID = 555
OUTPUT_DIR = "posts"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def fetch_url(url):
    """Fetch a URL and return the HTML content."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception:
        return None


def fetch_post_data(post_id):
    """Fetch both the main page (for og:description text) and embed page (for views/reactions/date)."""
    # Fetch main page for og:description (full text)
    main_html = fetch_url(f"https://t.me/{CHANNEL}/{post_id}")
    # Fetch embed page for metadata (views, date, reactions)
    embed_html = fetch_url(f"https://t.me/{CHANNEL}/{post_id}?embed=1&mode=tme")
    return post_id, main_html, embed_html


def parse_post(post_id, main_html, embed_html):
    """Parse post data from both HTML pages."""
    if not main_html and not embed_html:
        return None

    # Check if embed is an error (post doesn't exist)
    if embed_html and "err_message" in embed_html:
        return None

    # Extract text from og:description
    text = ""
    if main_html:
        m = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', main_html)
        if m:
            text = html_module.unescape(m.group(1)).strip()

    # Extract date from embed
    date = None
    if embed_html:
        m = re.search(r'datetime="([^"]+)"', embed_html)
        if m:
            date = m.group(1)

    # Extract views from embed
    views = None
    if embed_html:
        m = re.search(r'tgme_widget_message_views[^>]*>([^<]+)<', embed_html)
        if m:
            views = m.group(1).strip()

    # Extract reactions from embed
    reactions = {}
    if embed_html:
        # Pattern: reaction emoji followed by count
        for m in re.finditer(
            r'<span[^>]*class="[^"]*tgme_widget_message_reaction_count[^"]*"[^>]*>([^<]+)</span>',
            embed_html
        ):
            count_str = m.group(1).strip()
            reactions["total"] = reactions.get("total", 0)

        # Better pattern: find reaction buttons with emoji + count
        reaction_blocks = re.findall(
            r'<div[^>]*class="[^"]*tgme_widget_message_reaction[^"]*"[^>]*>(.*?)</div>',
            embed_html, re.DOTALL
        )
        total_reactions = 0
        reaction_list = []
        for block in reaction_blocks:
            # Extract emoji (inside <span> or as text)
            count_match = re.search(r'>(\d[\d.KkMm]*)<', block)
            if count_match:
                count_str = count_match.group(1).strip()
                # Parse count (handle K/M suffixes)
                count = 0
                try:
                    if 'K' in count_str.upper():
                        count = int(float(count_str.upper().replace('K', '')) * 1000)
                    elif 'M' in count_str.upper():
                        count = int(float(count_str.upper().replace('M', '')) * 1000000)
                    else:
                        count = int(count_str)
                except ValueError:
                    count = 0
                total_reactions += count
                reaction_list.append(count_str)
        reactions = {"total": total_reactions, "details": reaction_list}

    # Check if it's media-only
    is_media_only = (
        embed_html and
        "message_media_not_supported" in embed_html and
        not text
    )

    # Check if it's a service message
    is_service = embed_html and "service_message" in embed_html

    # Check for forwarded content
    forwarded_from = None
    if embed_html:
        m = re.search(
            r'tgme_widget_message_forwarded_from_name[^>]*>([^<]+)<',
            embed_html
        )
        if m:
            forwarded_from = m.group(1).strip()

    return {
        "id": post_id,
        "text": text,
        "date": date,
        "views": views,
        "reactions": reactions,
        "is_service": is_service,
        "is_media_only": is_media_only,
        "forwarded_from": forwarded_from,
    }


def save_post(post, output_dir):
    """Save a post as a markdown file."""
    post_id = post["id"]
    date_str = post["date"][:10] if post["date"] else "unknown"
    filename = f"{date_str}_post_{post_id}.md"
    filepath = os.path.join(output_dir, filename)

    lines = []
    lines.append(f"# Post #{post_id}")
    lines.append("")
    if post["date"]:
        lines.append(f"**Date:** {post['date']}")
    if post["views"]:
        lines.append(f"**Views:** {post['views']}")
    if post["reactions"].get("total", 0) > 0:
        lines.append(f"**Reactions:** {post['reactions']['total']}")
    if post["forwarded_from"]:
        lines.append(f"**Forwarded from:** {post['forwarded_from']}")
    lines.append(f"**Link:** https://t.me/{CHANNEL}/{post_id}")
    lines.append("")
    lines.append("---")
    lines.append("")

    if post["is_media_only"]:
        lines.append("*[Media content - open in Telegram to view]*")
    elif post["is_service"]:
        lines.append("*[Service message]*")
    elif post["text"]:
        lines.append(post["text"])
    else:
        lines.append("*[Empty or unsupported content]*")

    lines.append("")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return filepath


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Fetching posts from @{CHANNEL} (IDs 1 to {MAX_POST_ID})...")

    # Fetch all posts concurrently
    results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_post_data, i): i for i in range(1, MAX_POST_ID + 1)}
        done_count = 0
        for future in as_completed(futures):
            post_id, main_html, embed_html = future.result()
            results[post_id] = (main_html, embed_html)
            done_count += 1
            if done_count % 50 == 0:
                print(f"  Fetched {done_count}/{MAX_POST_ID}...")

    print(f"Fetched {len(results)} pages. Parsing...")

    # Parse all posts
    posts = []
    text_posts = []
    media_posts = 0
    service_posts = 0
    error_posts = 0

    for post_id in sorted(results.keys()):
        main_html, embed_html = results[post_id]
        post = parse_post(post_id, main_html, embed_html)
        if post is None:
            error_posts += 1
            continue

        posts.append(post)
        if post["is_media_only"]:
            media_posts += 1
        elif post["is_service"]:
            service_posts += 1
        elif post["text"]:
            text_posts.append(post)

    print(f"Parsed: {len(posts)} valid posts, {len(text_posts)} with text, "
          f"{media_posts} media-only, {service_posts} service, {error_posts} not found")

    # Save all posts
    saved = 0
    for post in posts:
        save_post(post, OUTPUT_DIR)
        saved += 1

    print(f"Saved {saved} posts to {OUTPUT_DIR}/")

    # Save a summary for analysis
    summary_path = os.path.join(OUTPUT_DIR, "_summary.md")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"# Channel @{CHANNEL} Summary\n\n")
        f.write(f"- Total posts found: {len(posts)}\n")
        f.write(f"- Posts with text: {len(text_posts)}\n")
        f.write(f"- Media-only posts: {media_posts}\n")
        f.write(f"- Service messages: {service_posts}\n")
        f.write(f"- Not found/deleted: {error_posts}\n\n")

        # Top posts by reactions
        sorted_by_reactions = sorted(text_posts, key=lambda p: p["reactions"].get("total", 0), reverse=True)
        f.write("## Top posts by reactions\n\n")
        for post in sorted_by_reactions[:20]:
            reactions = post["reactions"].get("total", 0)
            views = post["views"] or "?"
            date = post["date"][:10] if post["date"] else "?"
            preview = post["text"][:100].replace("\n", " ")
            f.write(f"- **#{post['id']}** ({date}) | Views: {views} | Reactions: {reactions}\n")
            f.write(f"  {preview}...\n\n")

        f.write("## All text posts\n\n")
        for post in text_posts:
            f.write(f"### Post #{post['id']} ({post['date'][:10] if post['date'] else '?'})\n")
            f.write(f"Views: {post['views'] or '?'} | Reactions: {post['reactions'].get('total', 0)}\n\n")
            f.write(post["text"])
            f.write("\n\n---\n\n")

    print(f"Summary saved to {summary_path}")


if __name__ == "__main__":
    main()
