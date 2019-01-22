---
layout: post
---

{{ content }}

<hr />

<small>
<p>
Posted in: <a href="{{ site.baseurl }}/{{ page.category }}">{{ page.category }}</a> <br />
Tags: <br />
<ul>
{% for tag in page.tags %}
  <li><a href="{{ site.baseurl }}/{{ page.category }}#{{ tag }}">{{ tag }}</a></li>
{% endfor %}
</ul>

</p>
</small>
