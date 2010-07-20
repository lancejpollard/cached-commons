require 'rubygems'
require 'haml'
require 'sinatra'
require 'broadway'
require 'rest_client'

set :public, "public"
set :views, "views"

CACHE_ROOT = "http://cachedcommons.org"

=begin
before do
  if request.env['HTTP_HOST'] != CACHE_ROOT
    redirect_to CACHE_ROOT
  end
end
=end

get "/" do
  locals = default_locals(:page => site.pages.first, :cache_root => CACHE_ROOT)
  options = {}
  haml :index, options, locals
end
