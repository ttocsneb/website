---
title: Making a static compiler
rss_desc: I've converted from hand writing the html to using a static compiler.
date: Wed, 13 Oct 2021 23:25:48 -0600
uuid: 3020d671-2caf-11ec-a532-c51ba53d9342
---

With this update, I have finished an early test of my static compiler. I am 
taking markdown files for all the pages in my sites, and using [nunjucks] (A javascript version of jinja2) to generate my html.

I am very happy with my loading of all the files. There still is a lot of work
to do for the rendering side of the code--it is very spaghetti like right now.
The renderer works for the moment, and that is what I want. I can work on 
cleaning the code up at a later date.

The way the renderer works now is as follows.

- I have a folder for each project
- In each folder are two files
  1. *project.md* contains the main project page and any configuration for the project
  2. *summary.md* contains the summary for the front page
- There can optionally be a folder called *updates* which contains all of the updates for the project

So far, I think this file structure works, but is a bit annoying to get right 
since all configurations are stored in the markdown files and each setting 
needs to be spelled correctly. This shouldn't be too much of an issue however,
since most configuration files require specific keys.

The biggest issue will definitely be expanding towards the future. I don't 
know if the current system of compilation will scale when my site becomes 
bigger. Will it become difficult to add new features? Or will adding new 
features add confusion to my future self? Only time can really tell, but I 
have a feeling that I will need to put more time and effort into this to make
it great.
