+++
canonical = "https://mappingwithd3.com/tips/bubblemap_radius/"
date = 2020-02-10T17:00:00Z
description = "If you create bubble maps in d3.js and you use a circle SVG element be sure to use the right scale for your radius."
draft = true
images = ["https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/geospatial-d3/marketing/website/articles/sqrt.png"]
title = "Bubble Map Radius Tip for d3.js"
featured = ["frontpage"]
[card]
description = ""
[image]
alt = ""
url = ""
+++
If you create bubble maps in d3.js and you use a circle SVG element be sure to use the right scale for your radius.

Since we can only change the radius of a circle we need to use the square root scale to scale the area rather than the radius.

{{< highlight js >}}
var sqrtScale = d3.scaleSqrt()

  .domain([0, 100])

  .range([0, 20]);
{{</ highlight >}}

Read more about the specifics on [Robert Kosara’s blog](https://eagereyes.org/blog/2008/linear-vs-quadratic-change)
