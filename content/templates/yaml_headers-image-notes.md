---
title: "{{FULLNAME}}"
description: a post about tests
extract: 
created: <% tp.file.creation_date() %>
updated: <% tp.file.last_modified_date() %>
author: tb
images: 
tags: 
draft: false
order: 
aliases: 
publish: 
disabled rules: [yaml-title]
---

<%* tp.file.cursor() %>

<!-- Images for this post live in content/posts/img/{{FULLNAME}}/ — see
     content/templates/image-conventions.md for the YYMMDD-name[-fpo].ext
     naming pattern. Embed one with, e.g.:
     ![[posts/img/{{FULLNAME}}/261002-descriptive-name.jpg]] -->
