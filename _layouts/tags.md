---
layout: page
---

<ul>
{% for post in site.tags[page.tags] %}

<li>
<i>{{ post.date | date_to_string }}</i> <a href="{{ post.url | absolute_url }}">{{ post.title }}</a>
</li>

{% endfor %}
</ul>

<br />

{{content}}