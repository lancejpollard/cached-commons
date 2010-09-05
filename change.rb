require 'rubygems'
require '_app/config'

site.find_posts_by_category("cache").each do |post|
  puts post.title
end