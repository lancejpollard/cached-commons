# Cached Commons <img src="http://cachedcommons.org/images/cached-commons-favicon.png" alt="favicon"/>

This is the Cached Commons Gem.  This is all the code for pushing and pulling from Cached Commons (minus the web interface and app).

## Usage

    spec = CachedCommons::Spec.new do
      title         "My Cached Commons Lib"
      description   "Saves time, money, and everything in between"
      author        "You"
      home          "http://site.com"
      docs          "http://site.com/docs"
      repository    "http://github.com/you/lib"
      demos         "http://demos!.com"
    end

