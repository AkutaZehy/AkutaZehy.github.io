---
layout: page
---

{% for post in site.tags[page.tags] %}

- *{{ post.date | date_to_string }}* <a href="{{ post.url | absolute_url }}">{{ post.title }}</a>

{% endfor %}

<br>

{{content}}