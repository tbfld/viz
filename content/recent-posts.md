---
title: recent posts (index)
aliases: 
description: 
extract: 
images: 
created: 2026-10-03-Sat-5:14pm
updated: 2026-10-04-Sun-2:48pm
order: 
author: 
draft: true
publish: false
disabled rules: [yaml-title]
---
```dataview
LIST without ID 
"> [!note]+ " + replace(file.folder, "content/", "") + "/[[ " + file.name + " ]]<br>" + dateformat(file.mtime, "yyyy-MM-dd") + "<br>" + description 
WHERE description != null
```