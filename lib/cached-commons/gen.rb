require 'rubygems'
require '_app/config'
require 'nokogiri'
require 'fileutils'
require 'active_support/core_ext'

def write(node)
  name = node[:title].downcase.gsub(/[^a-z0-9]/, '-').squeeze("-")
  result =<<-EOF
---
title:        #{node[:title] || '""'}
src:          #{"/cache/#{name}/1.0/javascripts/#{name}.js" || node[:href] || '""'}
home:         #{node[:home] || '""'}
demo:         #{node[:demo] || '""'}
docs:         #{node[:docs] || '""'}
repo:         #{node[:repo] || '""'}
versions:     #{node[:versions].inspect.gsub('"', "") || '[]'}
tags:         #{node[:tags].inspect.gsub('"', "") || '[]'}
description:  ""
dependencies: ""
---

EOF
  path = "_app/posts/cache/#{node[:category]}"
  FileUtils.mkdir_p(path) unless File.exists?(path)
  path << "/#{name}.markdown"
  File.open(path, "w+") do |file|
    file.puts result
  end
  
  FileUtils.mkdir_p("cache/#{name}/1.0/javascripts")
  FileUtils.cp(".#{node[:href]}", "cache/#{name}/1.0/javascripts/#{name}.js") rescue nil
  FileUtils.cp(".#{node[:href].gsub(/\.js$/, "-min.js")}", "cache/#{name}/1.0/javascripts/#{name}-min.js") rescue nil
  FileUtils.mkdir_p("cache/#{name}/1.0/stylesheets")
end

SITE.find_posts_by_category("libraries").each do |lib|
  html = Nokogiri::HTML(lib.render)
  html.xpath("html/body/ul").each do |ul|
    
    ul.xpath("li").each do |item|
      
      link = item.xpath("a").first
      result = {
        :title => link.text,
        :href => link["href"],
        :tags => (link["title"].split(/,\s+/) rescue []),
        :category => lib.slug.value
      }
      
      item.xpath("ul/li/a").each do |sub_item|
        result[sub_item.text.downcase.singularize.to_sym] = sub_item["href"]
      end
      write(result)
    end
  end
end
