require 'rubygems'
require 'sinatra'
require 'broadway'
require 'haml'

SITE = Broadway.build(:source => "posts", :settings => "_config.yml")

set :public, "public"
set :views, "views"

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
    :content => IO.read("../README.markdown")}
end

get "/*" do
  if File.extname(params["splat"].join("/")).to_s.downcase =~ /\.js/
    file = "../#{params["splat"].join("/")}".squeeze("/")
    if File.exists?(file)
      content_type "text/javascript"
      result = IO.read(file)
    end
  end
  result ||= ""
  result
end
