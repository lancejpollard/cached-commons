require 'rubygems'
require 'sinatra'
require 'broadway'

this = File.dirname(__FILE__)

SITE = Broadway.build(:source => "#{this}/content", :settings => "#{this}/_config.yml")

set :public, "#{this}/.."
set :views, "#{this}/views"

CACHE_ROOT = "http://cachedcommons.org"

Broadway::Post.class_eval do
  def src
    (data["src"] || "#{script_dir}/#{slug.value}.js").gsub(/:version/, version.to_s)
  end
  
  def src_min
    if data["src"]
      data["src"].gsub(/\.js$/, "-min.js").gsub(/:version/, version.to_s)
    else
      "#{script_dir}/#{slug.value}-min.js".gsub(/:version/, version.to_s)
    end
  end
  
  def script_dir
    "/cache/#{slug.value}/:version/javascripts"
  end
  
  def version
    Dir.entries("cache/#{slug.value}").to_a.last
  end
end

Broadway.generator do
  path "/"
  path "/readme"
  path "/tips"
  path "/license"
end
