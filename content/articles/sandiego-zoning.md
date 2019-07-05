+++
description = ""
title = "San Diego Zoning"
date = 2019-07-05
+++

## Single family homes in San Diego

Inspired by [this article](https://www.nytimes.com/interactive/2019/06/18/upshot/cities-across-america-question-single-family-zoning.html) from the New York Times I wanted to create the same map for San Diego. Since the article did not include San Diego I thought I can do it. 

Residential land zone for <svg width="25" height="20"><rect y="2" width="18" height="18" fill="#EA60B9" /></svg>detached single-family &nbsp; <svg width="25" height="20"><rect y="2" width="18" height="18" fill="#4CAFC5" /></svg>other housing

[![Zoning San Diego](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/articles/building-zoning-san-diego-high-res.png)](https://res.cloudinary.com/civicvision/image/upload/v1562310637/milafrerichs.com/articles/building-zoning-san-diego-high-res.jpg)

As you can see, there are more single-family zones than other residential areas. I expected that but there is a lot of space that is not just residential zone. It's mostly either Agriculture-Residential (AR) or Industrial--Light (IL).

Let's take a look at a few other residential zones.  

## Downtown & North Park

[![Zoning San Diego - Downtown and North Park](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/articles/downtown_sd.png)](https://res.cloudinary.com/civicvision/image/upload/v1562313554/milafrerichs.com/articles/downtown_sd.png)

## Ocean Beach

[![Zoning San Diego - Ocean Beach](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/articles/ocena_beach.png)](https://res.cloudinary.com/civicvision/image/upload/v1562313554/milafrerichs.com/articles/ocena_beach.png)

## Pacific Beach

[![Zoning San Diego - Pacific Beach](https://res.cloudinary.com/civicvision/image/upload/f_auto,q_auto,w_auto,dpr_auto,c_limit/milafrerichs.com/articles/pacific_beach.png)](https://res.cloudinary.com/civicvision/image/upload/v1562313554/milafrerichs.com/articles/pacific_beach.png)


# Methodology
I used [open zoning data](https://data.sandiego.gov/datasets/zoning/) from the City of San Diego, used the zoning information from the [Municipal Code](https://www.sandiego.gov/city-clerk/officialdocs/municipal-code/chapter-13) and building data from [Microsoft](https://github.com/Microsoft/USBuildingFootprints/).  
I matched those buildings up with the zone they’re in and colored according to the code. 
Everything that starts with RS is <svg width="15" height="15"><rect width="15" height="15" fill="#EA60B9"></svg> and is labeled in the municipal code as __Residential--Single Unit__.  
And every other Rx is <svg width="15" height="15"><rect width="15" height="15" fill="#4CAFC5"></svg> for all other residential zones. 

You can read more about the technical implementation here. 
