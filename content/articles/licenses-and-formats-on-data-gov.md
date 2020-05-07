+++
date = 2018-10-30T16:08:58Z
draft = true
featured = ["frontpage"]
title = "Licenses and formats on data.gov"
viz = true

+++
While I was developing my government funded prototype „Automated City Open Data Census“ for Germany I was so deep into scrambling with metadata that I decided to take a closer look at the types and formats that get published.

So I used the CKAN API to get basic data from CKAN about licenses used, data formats and categories.

A few not so supering facts are that not fully open licenes still dominate the field and PDF is the most published data format in Germany.

{{< viz data="govdata-de/formats" id="govdata-formats" width="700" >}}

{{< viz data="govdata-de/licenses" id="govdata-licenses" width="700" >}}