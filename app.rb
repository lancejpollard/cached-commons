# http://neothemes.com/rofolio-demo/?cat=7
# http://blacksteel.x10hosting.com/contact.html
require 'rubygems'
require 'haml'
require 'sinatra'
require 'broadway'

set :public, "public"
set :views, "views"

CACHED_COMMONS = "http://github.com/viatropos/cached-commons/raw/master/public" unless defined?(CACHED_COMMONS)

get "/" do
  options = {}
  locals = {:cache_root => CACHED_COMMONS}
  haml :index, options, locals
end