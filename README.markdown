# Cached Commons

> Caching and Compressing Javascripts and Stylesheets since 2009

Github uses Nginx and gzips their content automatically.  Github Pages can be used as a CDN!

## Usage

1. Go to [cachedcommons.org](http://cachedcommons.org/).
2. Select the Javascript libraries you want and need for your latest project.
3. Copy/paste the script tags into your project.

## Why

When I was first starting out with javascript, finding the good libraries was hard enough.  Add on top of that...

- having to find the download link,
- organize the files in my project,
- minimize them (and maximize them during development so I can see what's going on)

... and you have yourself a bit-sized chunk of work in front of you.  Multiply that times X number of projects, and you have a lot of time spent organizing and optimizing Javascript libraries.

This is an attempt to centralize javascript library access.  You can easily download the libraries to your local project if you'd like, or feel free to directly link to the ones here.  It's using Github as a CDN and they're good at that.

- When you're bored, easily study code on the iPhone!
- If you need to minify or prettify javascript or css, you can do that on [SeeSaw](http://meetseesaw.com).

## Goals

The main goal is to aggregate the best-of javascript and css libraries for rapid prototyping.  It won't have every javascript library because there's 1000's of jQuery Tooltip plugins out there, but only say 3 of them are really good.

## Add More Libraries

    function here(library)
    {
      return $("li #" + library) == null; 
    }
    function tell()
    { 
      window.location.href = "http://github.com/viatropos/cached-commons/issues" 
    }
    if (!here(window.location.search))
    { 
      tell(); 
    }

If you find a library that you think is great, create a [Github Issue](http://github.com/viatropos/cached-commons/issues) for it and give us a link to the library, a good demo, some docs, and the repository (or whatever exists).  You will help other developers save time and money, which will in the long run speed up development and increase the number of services available to make your life better.

The source of the [Cached Commons](http://cachedcommons.org) is [here](http://github.com/viatropos/cached-commons/tree/gh-pages).

## Interesting things

- [Sandpaper](http://www.useragentman.com/blog/2010/03/09/cross-browser-css-transforms-even-in-ie/)
- [Live Text Counter](http://youhack.me/2010/04/22/live-character-count-with-progress-bar-using-jquery/comment-page-1/)
- [Boxy](http://onehackoranother.com/projects/jquery/boxy/)
- [SimpleModal](http://www.ericmmartin.com/projects/simplemodal/)
- http://bradleysepos.com/projects/jquery/clipboard/
- http://yuiblog.com/blog/2007/06/12/module-pattern/
- [Spritely](http://www.spritely.net/)
- [Range Input](http://flowplayer.org/tools/demos/rangeinput/)

## Tests

    gem install rubyzip
    gem install jasmine
    rake jasmine

## Todo

- Add image and description to each one
- http://www.distilled.co.uk/blog/conversion-rate-optimisation/using-jquery-and-google-analytics-events-to-track-form-abandonment/