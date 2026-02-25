---
title: recent posts (index)
description: index page of recent posts
extract: 
created: 2025-02-01 11:02
updated::
author: 
images: 
order: 
aliases: 
draft: true
publish: false
tags:
  - index
  - recent-posts
---
```dataview
LIST without ID 
"> [!note]+ " + replace(file.folder, "content/", "") + "/[[ " + file.name + " ]]<br>" + dateformat(file.mtime, "yyyy-MM-dd") + "<br>" + description 
WHERE description != null
```