---
title: 标签页
date: 2023-08-24
type: "tags" # 设置页面类型
comments: false
permalink: /tags
---

# 标签列表

{% for tag in site.tags %}
    {% assign count = tag | last | size %}
    {% assign fontsize = count | times: 4 %}
    {% if count  > 2 %}
    <a class="post-tags-item" href="{{ page.url }}?keyword={{ tag | first }}" title="{{ tag | first }}" data-count="{{ count }}" style="font-size: {% if fontsize > 24 %}24{% else %}{{ fontsize }}{% endif %}px">{{ tag | first }}</a>
    {% endif %}
{% endfor %}