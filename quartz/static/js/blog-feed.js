async function loadPosts() {
  const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
  const feedPath = basePath + '/changelog.json';

  try {
    const response = await fetch(feedPath);
    const allEntries = await response.json();
    // The blog is ordered by when a post was written (created), not when it
    // was last edited, so touching an old post doesn't float it to the top.
    // A post with a `republished` date sorts (and is dated) by that instead.
    const when = (e) => new Date(e.republished || e.created || e.updated || 0).getTime() || 0;
    const entries = allEntries
      // isPost comes from the Changelog emitter (older builds lack it)
      .filter((e) => e.slug && (e.isPost !== undefined ? e.isPost : e.slug.startsWith('posts/')))
      .sort((a, b) => when(b) - when(a));

    const container = document.getElementById('post-entries');
    container.innerHTML = '';

    if (entries.length === 0) {
      container.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    entries.forEach((entry) => {
      const fmt = (iso) =>
        iso
          ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '';
      const shown = entry.republished || entry.created || entry.updated;
      let dateStr = fmt(shown);
      // For a republished post, keep the original date visible too.
      if (entry.republished && entry.created) {
        dateStr += ' (originally ' + fmt(entry.created) + ')';
      }

      const div = document.createElement('div');
      div.className = 'post-entry';

      // Thumbnail, when the post has one. `thumbnails` is keyed by pixel
      // size (see util/thumbnails.ts) — the blog index uses the 160px one.
      const thumbs = entry.thumbnails || {};
      const thumbUrl = thumbs['160'];
      if (thumbUrl) {
        const thumb = document.createElement('img');
        thumb.className = 'post-thumb';
        thumb.src = basePath + '/' + thumbUrl;
        // Let the browser pick a sharp size for the screen: 160px box on
        // wide layouts, full column width on phones (blog-feed.css).
        const srcset = ['160', '300', '640']
          .filter((k) => thumbs[k])
          .map((k) => basePath + '/' + thumbs[k] + ' ' + k + 'w');
        if (srcset.length > 1) {
          thumb.srcset = srcset.join(', ');
          thumb.sizes = '(max-width: 480px) calc(100vw - 2rem), 160px';
        }
        thumb.alt = '';
        thumb.loading = 'lazy';
        thumb.width = 160;
        thumb.height = 160;
        div.appendChild(thumb);
      }

      const body = document.createElement('div');
      body.className = 'post-body';

      const link = document.createElement('a');
      link.href = basePath + '/' + entry.slug;
      link.className = 'post-title';
      link.textContent = entry.title;
      body.appendChild(link);

      if (dateStr) {
        const meta = document.createElement('div');
        meta.className = 'post-meta';
        meta.textContent = dateStr;
        body.appendChild(meta);
      }

      if (entry.firstParagraph) {
        const preview = document.createElement('p');
        preview.className = 'post-preview';
        preview.textContent = entry.firstParagraph;
        body.appendChild(preview);
      }

      div.appendChild(body);
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load posts.', error);
    document.getElementById('post-entries').innerHTML = '<p>Failed to load posts.</p>';
  }
}

loadPosts();
