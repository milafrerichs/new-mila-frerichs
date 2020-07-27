+++
canonical = "https://mappingwithd3.com/tips/async_tip/"
date = ""
description = ""
draft = true
images = []
keywords = []
title = "Struggling to use the new Promise way of d3v5?"
tweet = ""

+++
Have you seen this error:
`await is only valid in async function `

That means that you need to wrap your d3 code inside a function:

{{< highlight js >}}
async function map() {
	const data = await d3.json('your.geojson');
}
map();
{{</ highlight >}}

<br/>
<div class="rm-area-end-of-content"></div>