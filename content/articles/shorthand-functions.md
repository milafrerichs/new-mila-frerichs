+++
canonical = "https://mappingwithd3.com/tips/shorthand_functions/"
date = ""
description = ""
draft = true
images = []
keywords = []
title = "shorthand functions"
tweet = ""

+++
Shorthand functions

Did you know that you can use a shorthand version for your d3 functions? When the function you are using expects the same input parameters you can just use the function name instead of creating your own unnamed function.

{{< highlight js >}}
//instead of
.attr('d', function(d) { return geoGenerator(d); })

//use
.attr('d', geoGenerator)
{{</ highlight >}}

<br/>
<div class="rm-area-end-of-content"></div>