---
title: "Progress Update: Civic Tech Project"
image:
  url: drinking-water.png
  alt: Drinking Water
card:
  description: "My new civic tech project: Drinking Water Quality in San Diego"
---
Last week I decided I should do something with the newly released [Open Data Portal](http://data.sandiego.gov) of the City of [San Diego](http://sandiego.gov).
And I thought about Data Sets where I could reuse/redeploy apps from other cities. There are 44 datasets in the current portal, and I wanted to use something that could be done relatively quickly but still would be an improvement.

## Finding the right dataset
After looking through several datasets and trying to find apps that I could easily reuse and redeploy I found the [„Monitoring of select chemical parameters in drinking water“](http://data.sandiego.gov/dataset/monitoring-select-chemical-parameters-drinking-water/) dataset and I remembered an [app](http://opendatalab.de/projects/trinkwasser/) from [Code for Heilbronn](http://codefor.de/heilbronn/), Germany about drinking water quality.
Several cities in Germany already redeployed the app, so I thought this should be relatively straightforward.

## Transforming the data
After looking at the app and the dataset, I realized that I have first to reorganize the data to be useful for this project. Since I have done this already several times, I went on to create Makefile with whom I could clean and reformat the data.
The app needed JSON data so I used an awesome tool: [jq](https://stedolan.github.io/jq/manual/)
It helps in transforming JSON data and cleaning it while doing it. You can check out the Makefile [here](https://github.com/CivicVision/trinkwasser/tree/master/etl), and I will have another blog post about jq soon.

Once I got the data, I added them to the app and realized that I have to make more changes than I anticipated. 

## Making it easier to redeploy
But I took the chance to revamp the app and make it even easier for others to adopt it for their city. I started with creating a configuration file where you would add the city name, the data URL and the active measure. Add the locations for each water plant and the measures you want to show. 
Then I transformed the app to use the configuration in the build process to generate a static site out of it. There is no need just now to have it done dynamically at runtime. 
It was already using Grunt, so I added the template library Handlebars to pre-generate the template.

This got me somewhere I the app was already quite usable. But there was one big problem.
The site was in German.

## Translating
So I needed to translate it. 
But just translating it would be a waste so I decided to use gettext and po files to generate the translations. And since it is a static site it is again already done in the build process. It took me some time to get it to work, but now the app is almost fully translated and could be used with any language. 

There are still a few things I would like to do with the app, but I’m quite satisfied how far I’ve come in just two days.

If you want to follow the progress keep an eye on my [blog](http://milafrerichs.de/blog) and [GitHub](https://github.com/CivicVision/trinkwasser) :)

And if you want to help bring it to your city or translate it into another language just ping me.

## Things I plan for the app:

- Add tests (there are none right now)
- More documentation (almost none)
- I need to research the country/city limits on the measurements
- Update the data automatically in some way (just showing April measurements right now)

And here is the link to the app: [http://civicvision.de/trinkwasser/](http://civicvision.de/trinkwasser/)
