+++
date = 2020-01-09T08:00:00Z
title = "Working with forestry and hugo"
[card]
description = ""
[image]
alt = ""
url = ""

+++
When I decided to start a new blog I thought about which platform I want to use.

Here is what I wanted from the potential platform

* Static site generator
* Gh Pages
* Ability to have an easy way to create posts
* Have a Frontend for just the posts
* Ability to write in markdown
* Not using html directly but use something smaller/smarter (the main reason I used middleman) like HAML
* Ability to use data files
* Clean default themes

Both Jekyll and Hugo offered most of the important things.

But I decided to go with Hugo. Why? For one because it is built with go and amazingly fast and I wanted an excuse to dive into go a little bit.

The second more important reason was it offered a different way of templating. Using Ace which is inspired by slim and is very close to haml what I’ve been using.

It took some time to set up, but now that it works it’s pretty great. I don’t want to miss it :)

For the frontend, i decided to go with forestry. And they don’t disappoint. There is an easy way for me to create posts, I can write in markdown via their editor and I can even add data files and more via their interface.

They built the Hugo site every time I commit to the master branch on github and deploy it to gh-pages. Although not anymore (I switched to netlify, which is another blog post on its own).

I switched all my sites to now use Hugo and when I create a new site I use Hugo by default.
The only bummer is that they will discontinue the support for Ace (Slim like templates). And I now need to figure out how I want to approach this.