async function loadPosts() {
  const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
  const feedPath = basePath + '/changelog.json';

  try {
    const response = await fetch(feedPath);
    const allEntries = await response.json();
    const entries = allEntries.filter((e) => e.slug && e.slug.startsWith('posts/'));

    const container = document.getElementById('post-entries');
    container.innerHTML = '';

    if (entries.length === 0) {
      container.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    entries.forEach((entry) => {
      const date = entry.updated ? new Date(entry.updated) : null;
      const dateStr = date
        ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

      const div = document.createElement('div');
      div.className = 'post-entry';

      // Thumbnail, when the post has one. `thumbnails` is keyed by pixel
      // size (see util/thumbnails.ts) — the blog index uses the 160px one.
      const thumbUrl = entry.thumbnails && entry.thumbnails['160'];
      if (thumbUrl) {
        const thumb = document.createElement('img');
        thumb.className = 'post-thumb';
        thumb.src = basePath + '/' + thumbUrl;
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
