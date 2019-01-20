---
layout: page
---

<h3>{{ page.category }}</h3>

{% for tag in site.tags %}
  {% assign current_tag = tag[0] %}
  {% if site.data.tag_map[current_tag] == page.category %}
<h4>{{ current_tag }}</h4>
<ul>
  {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
  {% endif %}
{% endfor %}
