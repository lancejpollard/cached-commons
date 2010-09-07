require 'rubygems'
require 'rake'
require 'nokogiri'
require 'open-uri'
require 'fileutils'
require 'nokogiri'
require 'maruku'
require 'active_support/core_ext'
require './_app/app'
require 'broadway/tasks'

desc "Generate your site"
task :generate do
  SITE.settings[:url] = "http://localhost:4567"
  Rake::Task["broadway:generate"].execute
end

desc "Deploy to Github Pages"
task :deploy => :generate do
  message = ENV["msg"] || "published programmatically on #{Time.now.strftime("%a, %b %d @ %I:%M%p")}"
  manifest = ""
  site.find_posts_by_category("cache").each do |post|
    next if post.slug.value == "index"
    manifest << ".#{post.src}\n" if File.exists?(".#{post.src}")
    manifest << ".#{post.src_min}\n" if File.exists?(".#{post.src_min}")
  end
  File.open("Manifest", "w+") do |file|
    file.puts manifest
  end
  
  system("git add . && git commit -a -m '#{message}'")
  system("git push origin gh-pages")
#  system("git checkout master")
#  system("git merge gh-pages")
#  system("git push origin master")
#  system("git checkout gh-pages")
end

namespace :commons do
  task :minify do
    require 'compressible'
    src = ENV["src"]
    raise "What's the src?" unless src
    if src =~ /\.js$/
      Compressible.js(src, :to => src.gsub(/\.js$/, "-min.js"))
    else
      Compressible.css(src, :to => src.gsub(/\.css$/, "-min.js"))
    end
  end
  
  task :cache do
    name = ENV["name"].downcase.gsub(/[^a-z0-9]/, '-').squeeze("-")
    raise "What's the name?" unless name
    category = ENV["category"].downcase
    raise "Need a valid category" unless category# && category =~ /(html5|jquery|sound|video|)
    version = ENV["version"] || "1.0.0"
    FileUtils.mkdir_p("cache/#{name}/#{version}/javascripts")
    FileUtils.mkdir_p("cache/#{name}/#{version}/stylesheets")
    result =<<-EOF
---
title:        #{name.titleize}
src:          /cache/#{name}/#{version}/javascripts/#{name}.js
home:         ""
demo:         ""
docs:         ""
repo:         ""
tags:         []
description:  ""
dependencies: ""
---

EOF
      path = "_app/content/cache/#{category}"
      FileUtils.mkdir_p(path) unless File.exists?(path)
      path << "/#{name}.markdown"
      File.open(path, "w+") do |file|
        file.puts result
      end
      system("open", path)
  end
end

task :scrape_jquery do
  url = "http://plugins.jquery.com/most_popular/feed"
  feed = Nokogiri::XML(open(url).read)
  downloads = []
  feed.xpath("//item").each do |item|
    title = item.xpath("title").text
    puts "title: #{title.inspect}"
    url = item.xpath("link").text
    begin
      html = Nokogiri::HTML(open(url).read)
      html.xpath("//a[@class='project_release_download']").each do |node|
        downloads << {:title => title, :href => node["href"]}
      end
    rescue Exception => e
      
    end
    
  end
  downloads.each do |download|
    name = File.basename(download[:href])
    puts "writing '#{name}'"
    File.open("scraped/#{name}", "w+") do |file|
      file.puts open(download[:href]).read
    end
  end
end
