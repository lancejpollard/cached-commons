require 'rubygems'
require 'sinatra'
require 'broadway'
require 'haml'

SITE = Broadway.build(:source => "_source/posts", :settings => "_source/_config.yml")

set :public, "_source/public"
set :views, "_source/views"

CACHE_ROOT = "http://cachedcommons.org"

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

get "/readme" do
  haml :readme, :locals => {:cache_root => CACHE_ROOT,
    :content => IO.read("README.markdown")}
end

get "/load-me" do
  "alert('javascript loaded')"
end

get "/*" do
  if File.extname(params["splat"].join("/")).to_s.downcase =~ /\.js/
    file = "#{params["splat"].join("/")}".squeeze("/")
    if File.exists?(file)
      content_type "text/javascript"
      result = IO.read(file)
    end
  end
  result ||= ""
  result
end
