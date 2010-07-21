require 'rubygems'
require 'sinatra'
require 'broadway'
require 'haml'

SITE = Broadway.build(:source => "posts", :settings => "_config.yml")

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
  haml :index, :locals => {:cache_root => CACHE_ROOT}
end

get "/tips" do
  haml :tips, :locals => {:cache_root => CACHE_ROOT}
end

get "/resources" do
  haml :resources, :locals => {:cache_root => CACHE_ROOT}
end

get "/download" do
  haml :index, :locals => {:cache_root => CACHE_ROOT}
end

get "/*" do
  ""
end
