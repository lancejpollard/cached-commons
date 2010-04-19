require 'rubygems'
require 'haml'
require 'sinatra'
require 'broadway'
require 'rest_client'

set :public, "public"
set :views, "views"

CACHE_ROOT = "http://viatropos.github.com/cached-commons"

get "/" do
  locals = default_locals(:page => site.pages.first, :cache_root => CACHE_ROOT)
  options = {}
  haml :index, options, locals
end