+++
date = "2019-07-21T09:00:00+02:00"
description = "Weekly Newsletter about Maps, Data Visualization, Open Data & Civic Tech"
images = ["https://res.cloudinary.com/civicvision/image/upload/v1563740205/milafrerichs.com/newsletter/social-media-header/weekly-notes-2019-07-21.png"]
summary = "Green space is good for mental health, mapping 'hot spots' in urban areas, accessibility of lakes in Switzerland and more. "
title = "Weekly Notes"

+++
Welcome to this new edition of "Weekly Notes", a weekly newsletter about Maps, Data Visualization, Civic Tech and Open Data.

You can find [previsous issues here](https://milafrerichs.com/newsletter)

There are a lot of great maps and projects in this newsletter. Enjoy!


# Geospatial Development

## [Green Space is Good for Mental Health](https://earthobservatory.nasa.gov/images/145305/green-space-is-good-for-mental-health)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/green-space-denmark.png)](https://earthobservatory.nasa.gov/images/145305/green-space-is-good-for-mental-health)

Thirty years of [@NASA_Landsat](https://twitter.com/NASA_Landsat) data helped scientists complete the largest epidemiological study of its kind

> _In a sweeping nationwide study, researchers from Denmark’s University of Aarhus found that childhood exposure to green space—parks, forests, rural lands, etc.—reduces the risk for developing an array of psychiatric disorders during adolescence and adulthood._

Great study and a great use of satellite data.

[https://earthobservatory.nasa.gov/images/145305/green-space-is-good-for-mental-health](https://earthobservatory.nasa.gov/images/145305/green-space-is-good-for-mental-health)

## [Galileo went down](https://www.gislounge.com/european-global-position-system-failure-points-to-the-importance-of-location-technology/)

> _What is being called a “major outage” by the European Global Navigation Satellite System (GNSS) Agency, or GSA, highlights the critical importance played by the satellite systems that provide accurate positioning_

[https://www.gislounge.com/european-global-position-system-failure-points-to-the-importance-of-location-technology/](https://www.gislounge.com/european-global-position-system-failure-points-to-the-importance-of-location-technology/)

## [Feature Comparison Mapping Libraries](http://mappingwithd3.com/feature-comparison/?lsc=mf)

I updated my feature comparison of popular mapping libraries post to include more info about the specific features. I looked at 13 features and compared them between 5 libraries that I consider the leading players: mapbox.js, OpenLayers, Leaflet, Google Maps, D3.

[You can check it out here](http://mappingwithd3.com/feature-comparison/?lsc=mf)

## FOSS4G UK 2019 tickets now available

The local **F**ree and **O**pen **S**ource **S**oftware for **G**eospatial Conference in the UK will be held in Edinburgh in September.
I will be there, giving a talk and my workshop [Geospatial Data Visualization with d3](https://mappingwithd3.com?lsc=mf).
Join me and buy your ticket!

[https://uk.osgeo.org/foss4guk2019/tickets.html](https://uk.osgeo.org/foss4guk2019/tickets.html "https://uk.osgeo.org/foss4guk2019/tickets.html")

# Data Visualization

A lot of great content over the last week. I had a hard time to decide what not to include :)

## [To prepare for rising temperatures, scientists map urban ‘hot spots’](https://www.nationalgeographic.com/magazine/2019/08/map-shows-urban-heat-islands-washington-dc/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/heat-island.jpg)](https://www.nationalgeographic.com/magazine/2019/08/map-shows-urban-heat-islands-washington-dc/)

This is a great looking map and very important for future urban developments and thinking about how we can improve the livability of cities.

> _Volunteers drove three one-hour sessions throughout the day, recording air temperature on prescribed routes. Together, they collected over 75,000 temperature measurements from across each city._

I might take a look at Berlin, but instead of using volunteers I take a look at the Sentinel Land Surface Temperature (LST) Data. It is not as detailed as volunteer based data but should be a good estimate.

More explanation on their method here: [https://www.noaa.gov/education/stories/science-and-education-partners-reveal-hottest-places-in-washington-dc-and](https://www.noaa.gov/education/stories/science-and-education-partners-reveal-hottest-places-in-washington-dc-and)

[https://www.nationalgeographic.com/magazine/2019/08/map-shows-urban-heat-islands-washington-dc](https://www.nationalgeographic.com/magazine/2019/08/map-shows-urban-heat-islands-washington-dc/)

## [Which lakes are accessible for the public?](https://www.addendum.org/seezugang/welche-seen-zugaenglich-sind/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/lake-access-swiss.png)](https://www.addendum.org/seezugang/welche-seen-zugaenglich-sind/)

Great use of images, small multiples and encoding the amount of access at the bottom of the images. Overall great project, and they did it all by hand. Worth checking out.

[https://www.addendum.org/seezugang/welche-seen-zugaenglich-sind/](https://www.addendum.org/seezugang/welche-seen-zugaenglich-sind/)

## [Along which public transit light rail line is the rent the highest?](https://interaktiv.tagesanzeiger.ch/2019/miet-map-zuerich/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/rent-prices-switherland-transit.png)](https://interaktiv.tagesanzeiger.ch/2019/miet-map-zuerich/)

Small little project from local newspaper in Switzerland. Looking at rent prices near light rail line.

**Unfortunetely behind a paywall.**

[https://interaktiv.tagesanzeiger.ch/2019/miet-map-zuerich/](https://interaktiv.tagesanzeiger.ch/2019/miet-map-zuerich/)

## [**Seoul, Guangzhou and New York City Top List of Cities With Largest Carbon Footprints. How Does Your City Rank?**](https://thecityfix.com/blog/seoul-guangzhou-new-york-city-top-list-cities-largest-carbon-footprints-city-rank-emily-cassidy-daniel-moran/)

![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/carbon-footprint-world.png)

Interesting dataset and presentation. You see a huge spike in China which should not be a surprise anymore.  
Unfortunately they used the Mercator projection which disturbs the represented area. But still interesting to explore.

> Just 100 cities are responsible for 18% of CO2 emissions.

## [If We All Left to “Go Back Where We Came From”](https://flowingdata.com/2018/05/16/go-back-where-you-came-from/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/leave-us.png)](https://flowingdata.com/2018/05/16/go-back-where-you-came-from/)

The map is a great response to the Trumpian claim that the four congresswomen should "go back where they came from".

> That leaves about 2.1 million Native American or Alaska Natives and 0.5 million Native Hawaiian or Other Pacific Islander. After that, it’s an empty shell of a country.

> A simplified view, but you get the point. Everyone comes from somewhere.

[https://flowingdata.com/2018/05/16/go-back-where-you-came-from/](https://flowingdata.com/2018/05/16/go-back-where-you-came-from/)

## [Abortion access is more difficult for women in poverty](https://www.washingtonpost.com/national/2019/07/10/abortion-access-is-more-difficult-women-poverty/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/abortion-usa.jpg)](https://www.washingtonpost.com/national/2019/07/10/abortion-access-is-more-difficult-women-poverty/)

Disturbing map about abortion access for women in poverty. But an important addition to the national discussion on the topic.

[https://www.washingtonpost.com/national/2019/07/10/abortion-access-is-more-difficult-women-poverty/?utm_term=.9985339a093f](https://www.washingtonpost.com/national/2019/07/10/abortion-access-is-more-difficult-women-poverty/)

## [Britain’s most complex motorway junctions ](https://www.ordnancesurvey.co.uk/blog/2019/07/britains-most-complex-motorway-junctions/)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/highway-junctions-uk.png)](https://www.ordnancesurvey.co.uk/blog/2019/07/britains-most-complex-motorway-junctions/)

Great project by the Ordnance Survey. They looked at the most complex motorway junctions in Britain. They even have a poster version you can print out!

> _Every road in each junction was assigned a different colour. Making more primary roads either red or green, and secondary roads either blue or yellow. Where one road changes over to another road, a gradient from one colour to the next was used to create the final product._

[https://www.ordnancesurvey.co.uk/blog/2019/07/britains-most-complex-motorway-junctions/](https://www.ordnancesurvey.co.uk/blog/2019/07/britains-most-complex-motorway-junctions/)

## [A LIMITED EDITION RUN OF 50 PRINTS TO CELEBRATE THE 50TH ANNIVERSARY OF APOLLO 11.](https://www.madefromdata.com/product/apollo-50?utm_campaign=Spatial%20Awareness&utm_medium=email&utm_source=Revue%20newsletter)

Great looking poster!

# Civic Tech

## [New Jersey Bus Watcher](http://www.njbuswatcher.com)

[![](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/newsletter/data-viz/ny-buswatcher.png)](http://www.njbuswatcher.com)

A great civic tech project looking at bus services in New Jersey. Espacially looking at the quality of the service.

> _When buses are arriving, how frequently they arrive, and whether adequate spacing is being maintained to ensure good service. These can be viewed by the day, week, month, or year._

[http://www.njbuswatcher.com](http://www.njbuswatcher.com)

## [Volunteer Assisted Capital Area Food Bank](https://www.giscorps.org/cafb-245/)

> GISCorps volunteer Sarah Welt (@iMapOpenData)  put her geospatial skills to work updating and enhancing the Hunger Heat Map for Capital Area Food Bank in Washington, DC

[https://www.giscorps.org/cafb-245/](https://www.giscorps.org/cafb-245/)

## [Machine Learning Crime Map from local newspaper](https://www.stuttgarter-zeitung.de/crimemap)

A German local newspaper uses machine learning to classify police reports into 9 categories and visualize them on a map.  
They should explain more of the risks just using police reports, because they can have biasses and it will leak into the machine learning model. But interesting start, I will follow along what they do with it.

[https://www.stuttgarter-zeitung.de/crimemap](https://www.stuttgarter-zeitung.de/crimemap)

## [Protecting New Zealand’s biosecurity via machine learning](https://www.opengovasia.com/protecting-new-zealands-biosecurity-via-machine-learning/)

> _Researchers are working on a program to help everyday Kiwis identify pest species with the use of their smartphone._

[https://www.opengovasia.com/protecting-new-zealands-biosecurity-via-machine-learning/](https://www.opengovasia.com/protecting-new-zealands-biosecurity-via-machine-learning/)

# Business/Consulting

I'm currently part of a group with other consultants and they shared some resources with me. I think you might find some of these interesting. I definitely did :)

[5 Ways To Use Digital Doping To Gain a (Legal) Athletic Edge](http://wlcm.growthtools.net/VOiIwvltXzaxatZ)  
[Free Digital Compliance Kit: Privacy Policy & More For Your Webpages & Email Communications](https://websitelegalpages.lawyer2warrior.com/website-legal-pages-package-optin)  
[5 Essential Skills Every Technologist Must Have](https://elevaros.com/5-essential-skills/)  
[5 Best Meal Prep Essentials for Busy Moms](https://welcomely.growthtools.com/p/mealprepessentials)  
[60-Seconds to Your Revenue Goal calculator](http://wlcm.growthtools.net/ArcODeIKKIbQwer)  
[5 Resources for Starting a Business in the Netherlands](https://welcomely.growthtools.com/p/smesolutions.nl)  
[5 Best Resources to improve your EDI environment](http://wlcm.growthtools.net/yyJjSRYvCrvdlUK)  
[Happy Retirement: A Simple Guide to Your Next Big Adventure](https://www.assetdynamics.com/free-ebook)  
[Work Up to Your First Solo Trip in 5 Steps](https://www.shegoessolotravel.com/work-up-to-your-first-solo-trip)  
[How To Help Your Player Turn Frustration Into Focus](https://welcomely.growthtools.com/p/xwqLVIngDYfwPdb?preview=true)  
[The 5 Best Resources for Finding your Perfect Job!](http://primalcareer.com/5-best-resources-to-find-a-perfect-job/)  
[5 Resources to Develop Your Leadership ](http://wlcm.growthtools.net/QPgaEwsGCjYNNxc)  
[5 Must-Use Productivity Tools to Grow Your Business](https://jeroenroosenboom.com/resources/)  
[5 Best Copywriting Resources for Speakers: Help your written word become as powerful as your spoken word.](https://welcomely.growthtools.com/p/tMFUmKJyiRiQlQK?preview=true)  

If you find this newsletter useful I would love to hear from you.   
A few others have reached out to me, so don't be shy. I read each and every email and respond as soon as possible. 

And feel free to share it with someone who might be interested in this newsletter.  
Send them to the [newsletter overview.](http://milafrerichs.com/newsletter)

<div class="rm-area-end-of-content"></div>