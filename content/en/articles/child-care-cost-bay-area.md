+++
categories = []
date = "2019-04-05T18:12:47+02:00"
has_visualization = false
hero = ""
tags = []
title = "Child Care Cost: Bay Area"
featured = ["dataviz"]
image = "milafrerichs.com/articles/child-care-bay-area.png"
[[notebook]]
link = "@milafrerichs/child-care-cost-bay-area"
namespace = 'ccc'
[[notebook.elements]]
id = "child-care-chart"
name = "chart"

+++
I stumbled across this exciting dataset about Childcare cost in the bay area.

Here is the graphic that I looked at:

![](https://res.cloudinary.com/civicvision/image/upload/v1549897780/Volume%204/child-care-bay-area.jpg)

I thought this visualization could be improved to bring the point across more clearly.

A slope chart would be a great option.

> A slope graph can be used to show a ‘before and after’ story of different values, based on comparing their values at different points in time. The related values are connected by slopes.
>
> [_http://seeingdata.org/taketime/inside-the-chart-slope-graph/_](http://seeingdata.org/taketime/inside-the-chart-slope-graph/ "http://seeingdata.org/taketime/inside-the-chart-slope-graph/")

**I do not do this to offend anybody, just as an exercise for myself.**  
Here is the resulting chart:

{{< div "child-care-chart" >}}

I think it communicates more directly which Counties were hit the hardest with increase child care cost and makes it easier to read and understand without reading the numbers.

The original article with the visualization can be found [here](https://www.mercurynews.com/2019/02/03/you-think-bay-area-housing-is-expensive-childcare-costs-are-rising-too/)
The original source is the [Insight Center for Community Economic Development](https://insightcced.org).
I published the data on [data.world](https://data.world/milafrerichs/child-care-cost-bay-area/workspace/file?filename=child_care_bay_area_tidy.csv)
