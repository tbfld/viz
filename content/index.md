---
title: changelog
description:
created:
updated::
author:
images:
order:
aliases:
draft: false
publish: true
tags:
---

<script>
  async function loadChangelog() {
    try {
      const response = await fetch('/changelog.json');
      const entries = await response.json();
      
      const container = document.getElementById('changelog-entries');
      
      entries.forEach(entry => {
        const date = new Date(entry.updated);
        const dateStr = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        const type = entry.isNew ? '🆕 New' : '✏️ Edit';
        
        const html = `
          <div class="changelog-entry">
            <div class="changelog-header">
              <a href="/${entry.slug}" class="changelog-title">${entry.title}</a>
              <span class="changelog-type">${type}</span>
            </div>
            <div class="changelog-meta">
              <span>Created: ${entry.created ? new Date(entry.created).toLocaleDateString() : 'N/A'}</span>
              <span>Updated: ${dateStr}</span>
              <span>${entry.wordCount} words</span>
            </div>
            ${entry.firstParagraph ? `<p class="changelog-preview">${entry.firstParagraph}</p>` : ''}
          </div>
        `;
        
        container.innerHTML += html;
      });
    } catch (error) {
      console.error('Failed to load changelog:', error);
      let errorMsg = 'Failed to load changelog.';
      
      // Try to get more details
      try {
        const testResponse = await fetch('/changelog.json', { method: 'HEAD' });
        errorMsg += '<br>Status: ' + testResponse.status + ' ' + testResponse.statusText;
      } catch (e) {
        errorMsg += '<br>Could not reach changelog.json';
      }
      
      document.getElementById('changelog-entries').innerHTML = '<p>' + errorMsg + '</p>';
    }
  }
  
  loadChangelog();
</script>

<style>
  .changelog-entry {
    padding: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--lightgray);
  }
  
  .changelog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .changelog-title {
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .changelog-type {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: var(--highlight);
  }
  
  .changelog-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--gray);
    margin-bottom: 0.5rem;
  }
  
  .changelog-preview {
    font-size: 0.9rem;
    color: var(--darkgray);
  }
</style>

## Recent Changes

<div id="changelog-entries">
  <p>Loading...</p>
</div>
