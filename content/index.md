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
    // Dynamically determine base path
    const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
    const changelogPath = basePath + '/changelog.json';
    
    try {
      const response = await fetch(changelogPath);
      const entries = await response.json();
      
      const container = document.getElementById('changelog-entries');
      
      entries.forEach(entry => {
        const date = new Date(entry.updated);
        const dateStr = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        const type = entry.isNew ? '[new]' : '[edit]';
        
        const div = document.createElement('div');
        div.className = 'changelog-entry';
        
        const link = document.createElement('a');
        link.href = basePath + '/' + entry.slug;
        link.className = 'changelog-title';
        link.textContent = entry.title;
        div.appendChild(link);
        
        const meta = document.createElement('div');
        meta.className = 'changelog-meta';
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'changelog-type';
        typeSpan.textContent = type;
        
        const createdSpan = document.createElement('span');
        createdSpan.textContent = `Created: ${entry.created ? new Date(entry.created).toLocaleDateString() : 'N/A'}`;
        const updatedSpan = document.createElement('span');
        updatedSpan.textContent = `Updated: ${dateStr}`;
        const wordsSpan = document.createElement('span');
        wordsSpan.textContent = `${entry.wordCount} words`;
        
        meta.appendChild(typeSpan);
        meta.appendChild(createdSpan);
        meta.appendChild(updatedSpan);
        meta.appendChild(wordsSpan);
        div.appendChild(meta);
        
        if (entry.firstParagraph) {
          const preview = document.createElement('p');
          preview.className = 'changelog-preview';
          preview.textContent = entry.firstParagraph;
          div.appendChild(preview);
        }
        
        container.appendChild(div);
      });
    } catch (error) {
      console.error('Failed to load changelog:', error);
      document.getElementById('changelog-entries').innerHTML = '<p>Failed to load changelog.</p>';
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
