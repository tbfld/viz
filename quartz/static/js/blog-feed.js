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

      const link = document.createElement('a');
      link.href = basePath + '/' + entry.slug;
      link.className = 'post-title';
      link.textContent = entry.title;
      div.appendChild(link);

      if (dateStr) {
        const meta = document.createElement('div');
        meta.className = 'post-meta';
        meta.textContent = dateStr;
        div.appendChild(meta);
      }

      if (entry.firstParagraph) {
        const preview = document.createElement('p');
        preview.className = 'post-preview';
        preview.textContent = entry.firstParagraph;
        div.appendChild(preview);
      }

      container.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load posts.', error);
    document.getElementById('post-entries').innerHTML = '<p>Failed to load posts.</p>';
  }
}

loadPosts();
