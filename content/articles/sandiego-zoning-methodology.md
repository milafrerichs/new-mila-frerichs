+++
date = "2019-07-05T00:00:00.000+00:00"
description = ""
draft = true
title = "San Diego Zoning - Methodology"

+++
I always like it when people share not only their data sources but when they share their methodology as well. You can learn from the methodology and spot errors more quickly or understand the „shortcomings“ of an analysis. In this post I want to share how I did an analysis about Zoning in San Diego modeled after The NY Times article. 

## How I redid the single family zoning maps from the NYT.

The New York Times is using Urban Footprint to create those graphics or at least get the data. (Urban Footprint wrote about it in their blog here). Since Urban Footprint is not free to use, but the data is available as Open Data, I challenged myself to recreate it for San Diego. And because the New York Times did not do an analysis for San Diego I thought it might be a good addition.

## First getting the data

That was quite easy using the open data portal fo the city I got the zoning layer. Nice.   
_Next find the zoning codes._   
Good thing I already did a project with zoning in San Diego so I knew were to look. The municipal code is the way to go. You can take a look at my previous projects about general zoning here and my quick Airbnb project here.   
Done. Great.  
Now I know which codes are for single family zoning.

## Quick check, here is the map just using the zones.

But we’re not done yet. The New York Times used buildings to show more precisely the zoning code.
That turned out more challenging than I anticipated. First I looked at openstreetmap sijce I know that have good building data. But turns out they have huge gaps in San Diego.
So I looked what Data urban footprint was using and it turns out Microsoft did a research project and they have building data for California as well. Great.
But.
It’s a huge GeoJSON file. Xgb
That could be a challenge.
So first task: get only San Diego data.
Here is the python script I used to filter out data for the city.
I tried an MVP with just a boundary that I drew and looked at chunks of data to find out if my script works.
Now I can use the exact boundaries of San Diego.

## Next up: finding the right zoning code for the building.

Easy task for a geonerd so go through all the buildings and find out if they’re in a specific zone. If it matches great.
I used a naive approach here and it took my computer almost a day to go through the 500.000 buildings.
If I would do it again I would use Postgres and postgis to match the zones. Much more efficient. And while I was thinking about it ugh about and found an old project of mine that makes it easy to setup your own docker container with postgis and load data into it to perform queries. It’s 4 years old and you can find it here:

Next, transform the now 140mb big geojson into TopoJSON to make it even smaller. Great, now we’re at 112mb, still big but better.

Final thing to do, use my prototype map for just the zones and use it for the buildings. I changed the code to use canvas instead of svg because of the amount of data we’re going to. Display. Your browser would crash if I would have used svg for 500k path elements.