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
    @src ||= (data["src"] || "#{script_dir}/#{slug.value}.js").gsub(/:version/, version.to_s)
    @src
  end
  
  def src_min
    unless @src_min
      if data["src"]
        @src_min = data["src"].gsub(/\.js$/, "-min.js").gsub(/:version/, version.to_s)
      else
        @src_min = "#{script_dir}/#{slug.value}-min.js".gsub(/:version/, version.to_s)
      end
    end
    
    @src_min
  end
  
  def script_dir
    "#{lib_dir}/javascripts"
  end
  
  def lib_dir
    "/cache/#{slug.value}/:version".gsub(/:version/, version.to_s)
  end
  
  def version
    versions.first
  end
  
  def versions
    Dir.entries("cache/#{slug.value}").to_a.delete_if do |element|
      element !~ /\d/
    end.reverse
  end
  
  def lib
    Dir[".#{lib_dir}/**/*"]
  end
  
  def lib_paths
    lib.delete_if do |path|
      File.directory?(path)
    end.map do |path|
      # \/#{slug.value}\/#{version.to_s}\/
      path.gsub(/^\./, "")
    end
  end
  
  def main_tag
    if javascript?
      "<script src='#{src}' type='text/javascript'></script>"
    else
      "<link href='#{src}' rel='stylesheet' type='text/css'/>"
    end
  end
  
  def links
    if @links.blank?
      @links ||= []
      @links << Broadway::Link.new(site, :href => data["home"], :title => "Home") unless data["home"].blank?
      @links << Broadway::Link.new(site, :href => data["demo"], :title => "Demo") unless data["demo"].blank?
      @links << Broadway::Link.new(site, :href => data["docs"], :title => "Docs") unless data["docs"].blank?
      @links << Broadway::Link.new(site, :href => data["repo"], :title => "Repo") unless data["repo"].blank?
    end
    
    @links
  end
  
  def related_assets
    if @related_assets.blank?
      @related_assets ||= []
      lib_paths.each do |path|
        relative_path = path.gsub(/\/cache\/#{slug.value}\/#{version.to_s}\//, "")
        @related_assets << Broadway::Link.new(site, :href => path, :title => relative_path)
      end
    end
    
    @related_assets
  end
  
  def javascript?
    File.extname(src) == ".js"
  end
  
  def stylesheet?
    File.extname(src) == ".css"
  end
end

Broadway.generator do
  path "/"
  path "/readme"
  path "/tips"
  path "/license"
end
