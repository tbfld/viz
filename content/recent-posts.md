---
title: 
description: 
extract: 
created: 2025-01-20:13-21
updated: 2025-01-27T10:30
author: 
images: 
tags: 
order: 
aliases: 
draft: false
publish: 
---
```dataview
LIST without ID 
"> [!note]+ " + replace(file.folder, "content/", "") + "/[[ " + file.name + " ]]<br>" + dateformat(file.mtime, "yyyy-MM-dd") + "<br>" + description 
WHERE description != null
```