+++
description = ""
draft = true
title = "Makeover Monday: How Americans Sleep"

+++
Practicing your skills is essential in every aspect of your life, primarily when you work for yourself. When I coach my softball team, I always work on the basics. We hit a lot, and we field a lot. The same is true for my work, and since I have the fortune to work for myself and make my own schedule, I always like to practice my skills.

One goal for me for this year is to share more stuff openly and not just work on my skills in private. That’s why I will participate more in challenges and share my results on my blog and twitter.

I already [posted](/articles/vizrisk-challenge-entry/) about my motivation to participate in the VizRisk Challenge from GFDRR and mapbox. Another skill practicing task that I want to do, if time permits, is to start participating in MakeoverMonday. You can read more about it [here](http://makeovermonday.co.uk/).

This weeks visualization is from the [Bureau of Labor Statistics](https://www.bls.gov/tus/charts/sleep.htm), and the questions ask by MakeoverMonday were:

What works and what doesn't work with this chart? How can you make it better?.

I looked at the chart and the dataset and wanted to make a minimal improvement to the chart. A lot of folks create complete new dashboards and visualizations, but I like small improvements when possible. Improving the chart in small increments shows you that you don’t need a complete redo To confirm that you can enhance a chart with just a few things.

I use Vega as my tool of choice this time, just to practice my Vega skills.

First thing I changed is the title. The description of the chart already had something that could be used as the title. It’s the result of the chart: “Individuals ages 15 to 19 spent more time sleeping than any other age group.”

The next thing was to remove the gradients, flip the chart so that the age ranges are more readable.

Start the baseline at 0. Otherwise, you skew the results. You can read more about it [here](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/).

And the thing that is the most crucial aspect is to highlight the bars that I want people to focus on.

The result is much easier to read and understand and probably more memorable.

![](https://res.cloudinary.com/civicvision/image/upload/v1559901980/milafrerichs.com/articles/sleep-times-america.png)

You can find the code [here](https://observablehq.com/@milafrerichs/makeover-monday)