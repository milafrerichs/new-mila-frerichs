---
title: Louisville Bird Data published
date: 2018-11-01 06:08:58 +0000
viz: true
featured: ["dataviz"]
image: "milafrerichs.com/articles/bird-louisville.png"
---
The City of Louisville in Kentucky is the first city to publish Bird Scooter Data as CSV in their [Open Data Portal](https://data.louisvilleky.gov/dataset/bird-scooter). They updated their data three times already, so we should be in for a treat with monthly updates.

We have to thank the City of Louisville and Bird for releasing data so that we can finally study how people use scooters in cities.

This is just a partial analysis since we only have data for one city and only for a limited time frame. I used the first month of the released data because it appears to be very clean. 

First let's look at the time frame the analysis:

{{< viz data="louisville_bird/days" id="days" mode="vega" width="700" >}}

Some results were expected, or at least I expected them. And there are others that were surprising.

### Let’s begin with the surprising: People drive far with their scooters.

{{< viz data="louisville_bird/avg_trip_time" id="trip_time" mode="vega" width="700" >}}

I would not have imagined that people drive a scooter for longer than 3 hours, but they do. I assume that people don't ride for three hours continuously but take breaks now and then and don't lock the scooter. It would be interesting to see if that were all either first rides (which are typically free) or maintenance rides that got falsely flagged as regular rides. But the data does not provide any meaningful insights here.

{{< viz data="louisville_bird/trip_distance" id="distance" mode="vega" width="700" >}}

### Another surprising (maybe not so surprising) thing is most rides begin after lunch-time.

I suspect that people work in downtowns but don’t live there, and most of the scooters get distributed downtown areas. Therefore they use them to drive to lunch and after work to drive home or to the next transit stop. But they cannot drive from home to work. Or at least that seems to be the case.

But again this dataset is very narrow, only three months of data and only one city.

{{< viz data="louisville_bird/hour_of_day" id="time" mode="vega" width="700" >}}

### The not so surprising result is that most rides occur on Saturdays (Weekends).

Again most scooters are probably downtown and get used more often when people are downtown, for example for lunch or on Saturday for shopping or wandering around.

{{< viz data="louisville_bird/weekday_count_weekend" id="weekday" mode="vega" width="700" >}}

This was a first exciting dive into the dataset, and I look forward to the release of more data and maybe even more cities releasing their data. Also interesting would be if Lime and other Scooter providers would release their data.
