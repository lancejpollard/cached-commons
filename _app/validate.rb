require 'rubygems'
require '_app/config'
require 'open-uri'

@stop = false
@bad_paths = []
@local_only = true

def bad(path, message)
  @bad_paths << path
#  puts "\n====\n#{message}\n====\n\n"
end

def exists?(path)
  if path =~ /^http/
    if !@local_only
      content = open(path).read
      if content.blank?
        bad(path, "Blank response: #{path}")
      end
    end
  else
    path = ".#{path}"
    unless File.exists?(path)
      bad(path, "Blank response: #{path}")
    end
  end
end

def check(path)
#  puts "checking... #{path}"
  trap("SIGINT") { @stop = true }
  begin
    exists?(path)
  rescue Exception => e
    bad(path, e.inspect)
  end
  exit if @stop == true
end

site.find_posts_by_category("cache").each do |post|
  next if post.slug.value == "index"
  exit if @stop == true
  check post.src
  check post.src_min
  check post.data["home"] unless post.data["home"].blank?
  check post.data["demo"] unless post.data["demo"].blank?
  check post.data["docs"] unless post.data["docs"].blank?
  check post.data["repo"] unless post.data["repo"].blank?
end

puts "====\nBad Paths"
puts @bad_paths.uniq.join("\n")
puts "===="