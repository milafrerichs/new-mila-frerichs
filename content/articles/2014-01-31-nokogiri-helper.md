---
title: Nokogiri Search Helper
layout: blog-single
---
I recently used [Scraperwiki](www.scraperwiki.com) to scrape some data off a couple of sites.  
During the development process (which I will describe in a coming post) I encountered some repetitive code/task. I then refactored the code and wrote a small class which I then would use for every site.  


Most often you want the first text of the matching selector and the attr of the first element matching.

You can find the class here: 
{% gist 8491837%}
