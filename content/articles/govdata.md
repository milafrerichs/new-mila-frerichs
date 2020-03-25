---
title: Licenses and formats on data.gov
date: 2018-10-30 16:08:58 +0000
viz: true
featured: ["frontpage"]
---
While I was developing my government funded prototype „Automated City Open Data Census“ for Germany I was so deep into scrambling with metadata that I decided to take a closer look at the types and formats that get published.

So I used the CKAN API to get basic data from CKAN about licenses used, data formats and categories.

A few not so supering facts are that not fully open licenes still dominate the field and PDF is the most published data format in Germany.

And then I thought I could take a closer look into the US portal run by the federal government (data.gov) which is a CKAN based portal. And they aggregate data from states, counties and cities in the US.

It is fast and updates automatically because it is using the API rather than a static file.

The most used format is a blank format, which means the metadata is not correct. Which is unfortunate. The second most used data format is HTML. Which is weird as well. But I see this often with data portals, they just link to a page and not to a dataset and then CKAN assumes it is just HTML and not the actual data format.

<div id="govdata-formats"></div>

{{% viz data="govdata/formats" id="#govdata-formats" width="700" %}}

Or let's take a look at the licences used by gov.data. The most used license is the us-pd which is the [U.S. Government Works license](https://www.usa.gov/government-works).

> usually prepared by officers or employees of the United States government as part of their official duties

Which is a great sign that most of the licenses in the US is an open license. That is not the case in Germany.

<div id="govdata-licenses"></div>

{{% viz data="govdata/licenses" id="#govdata-licenses" width="700" %}}
