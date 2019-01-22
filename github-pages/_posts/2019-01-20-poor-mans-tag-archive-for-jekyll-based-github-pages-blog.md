---
layout: tagged-post
date: 2019-01-20
title: "Poor Man's Tag Archive for Jekyll based GitHub Pages Blog"
category: github-pages
tags: jekyll minima blogging
---

I've decided to use GitHub Pages as a platform for my blogs. More specifically, explicitly use the solution behind it---the Jekyll static site generator. There's really only one way to build a blog with these tools out-of-the-box: using the `minima` theme. This comes with a handful of useful features, but also needs some tweaks to make the most of it.

One thing I like about FOSS is the fact that I can look for how things work in the source code. This is especially handy if the documentation is lacking. Jekyll and minima are quite OK in this department, but I resorted to the nitty-gritty internals to understand it better.


## Problem

During setting up the blog and playing around with the base template, I realised that posts can have multiple categories. They all go to the permalink in the default configuration. Before I noticed that, I thought I could abuse this feature to tag my posts. Bear in my mind: I wanted as little trickery as possible and to still achieve the omnipresent functionality.

Then I got to know, that I can actually use real tags, it's just this theme that doesn't show them anywhere. What a bummer! Well, I know it's called _minima_, but heck, I didn't see that coming.

In the process and in the spirit of my hacker's nature, I trimmed the date and title of a post from the URL, leaving only the category name. I hoped for posts listing to pop up, but saw 404 instead. No amount of browsing the docs and source could convince me I can avoid handcrafting it.


## Solution

My way to go about it was to add a couple of templates and a script that would extract and categorize all the tags from posts. You can see the effect on this very blog: in the index page, there's a list of categories. Following each link you'll see the corresponding posts grouped by tags.

How to do it? I will present fragments of code below. To see a living example, check out the [source of this blog](https://github.com/itdoesnotmatter/itdoesnotmatter.github.io) on GitHub.


### Categories & Tags Lists

The category listing is super simple and incorporates a Liquid loop and Jekyll's built-in variable `site.categories`. Here it is in its entirety:

{% highlight html %}
{% raw %}
<h2 class="post-list-heading">Categories</h2>
<ul class="categories">
{% for category in site.categories %}
  <li><a href="{{ category[0] }}/">{{ category[0] }}</a></li>
{% endfor %}
</ul>
{% endraw %}
{% endhighlight %}

Just shove it in your `index.md` and you're done (might be a good idea to create a snippet in `_includes` with this code).

For tags list, I created a new layout with the following content:

{% highlight html %}
{% raw %}
---
layout: page
---

{% for tag in site.tags %}
  {% assign current_tag = tag[0] %}
  {% if site.data.tag_map[current_tag] == page.category %}
<h3>{{ current_tag }}</h3>
<ul>
  {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
  {% endif %}
{% endfor %}
{% endraw %}
{% endhighlight %}

_Sigh, when I see it again, that variable I had to create because Liquid wouldn't accept a subscript inside a subscript..._

The `site.data.tag_map` is a collection I created with a script described in the next section. It is basically a `yaml` file put in the `_data` directory with a simple mapping: `tag-name: category-name`.

This layout is used by all the index pages inside each category directory.


### Tools

It would be a tedious task to manually create the tag map, directories and index pages. I won't be posting the source here, but I wrote some arcane `bash` scripts to automate this job. They're supposed to be used whenever I add a post. Head to [my bin directory](https://github.com/itdoesnotmatter/itdoesnotmatter.github.io/tree/master/bin) if you're curious.


### Caveat

Creating an awkward looking tag map hurts me. The same could be achieved in plain Liquid, but would look so ugly that it would hurt even more. Maybe if the `site.categories` and `site.tags` structures were a little different, and definitely if Liquid supported custom dictionaries variables... But, in the case I had to generate the index pages anyway, one additional script is not such a big deal.


## What's next?

The `post` layout in the `minima` theme still lacks displaying tags (and the category as well, apart from the URL). My next step will definitely be adding this feature.

Even though I tried to be as elegant as possible with the above solution, this code needs some more love. The fact that I'm using it also on my [personal blog](https://is-this-necessary.github.io) inclines me to make it easier to plug in. Maybe I should fork the `minima` theme?

On the other hand, maybe I'm stupid and have some ridiculous requirements for a blogging platform... Anyway, ***it doesn't matter*** :)


*[FOSS]: Free and Open-Source Software
*[404]: Not Found HTTP Error Code
