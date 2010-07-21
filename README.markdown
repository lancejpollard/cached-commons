# Cached Commons

## Common Code Cached using Github's Servers as a Content Delivery Network

Builds an interface on top of "this interface to the YUI Compressor":http://refresh-sf.com/yui/
Optimizes using "Google Closure":http://code.google.com/closure/compiler/docs/api-ref.html

Github uses Nginx v0.7.61 and gzips their content automatically.  All content that hasn't been changed between commits returns a "304 Not Modified" response!

This is what the headers look like when retrieving a file called "/README.textile" from Github (using Google Chrome's "Inspect Element" functionality):

First hit, after I just made changes to it and uploaded it (no "304 Not Modified")

## Tests

There is a [tests page](http://cachedcommons.org/tests) which tests each javascript library, using all of it's functionality to make sure no errors are thrown on any browsers.

## Interesting projects

- http://github.com/newbamboo/panda_player
- http://github.com/mrdoob/three.js
- http://wiki.github.com/tobeytailor/gordon/

## Other Places

- http://plugins.jquery.com/most_popular

## Todo

- http://jscode.org/timefield/
- http://plugins.jquery.com/project/escape