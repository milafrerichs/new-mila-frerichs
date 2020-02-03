+++
date = 2020-02-03T08:00:00Z
draft = true
title = "CSS Trick: Show a fallback"
[card]
description = ""
[image]
alt = ""
url = ""

+++
I was working on the [Mapping with d3](https://mappingwithd3.com) site when I thought about an opt-in field with [RightMessage](https://rightmessage.com?fp_ref=mil80) (RM).   
When I have an offer for a visitor RM will show something, but when I don't have anything I want to show a fallback that I don't want to create with RM. 

So I thought I can just leave it inside the box that RM would fill with content. But even if they don't have an offer they will overwrite the box.

I could have solved that problem with javascript pretty easily but I want to reduce the amount of javascript I use on my site so I researched if it would be possible with CSS as well.

## CSS Trick: Show a fallback

After some research, I found a combination of the sibling selector and the `:empty` pseudo-selector.

This is what I came up with:

    .if-this-is-empty:empty ~ .show-fallback {
      display: block;
    }

If my first element is empty (RM did not add anything) show the fallback which is a sibling of that `.if-this-is-empty` element.

Got the code inspiration from here:

[Solved with CSS! Logical Styling Based on the Number of Given Elements](https://css-tricks.com/solved-with-css-logical-styling-based-on-the-number-of-given-elements/ "Solved with CSS! Logical Styling Based on the Number of Given Elements")

And check out [RightMessage](https://rightmessage.com?fp_ref=mil80) it's pretty great!