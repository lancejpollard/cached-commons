require 'rubygems'
require 'rake'
require 'app'

# rake db:create_migration NAME=create_models

desc "One time task to setup on Heroku"
task :create do
  sh "heroku create"
  sh "git push heroku master"
  sh "heroku rake db:migrate"
  sh "heroku open"
end

namespace :db do
  task :migrate do
    ActiveRecord::Migrator.migrate(
      'db/migrate', 
      ENV["VERSION"] ? ENV["VERSION"].to_i : nil
    )
  end
end


require 'rubygems'
require 'fileutils'
require 'nokogiri'
require 'yaml'
require 'active_support'
require 'maruku'

directories = []
Dir.glob("libraries/**/*").each do |file|
  html = Nokogiri::HTML(Maruku.new(IO.read(file)).to_html)
  html = Nokogiri::HTML(html.to_html)
  files = []
#  puts html.to_html
#  puts "DONE"
  html.xpath("/html/body/ul/li").each do |list|
    title = list.xpath("p/a").text.gsub("min", "")
    links = []
    list.xpath("ul/li/a").each do |link|
      #puts "LINK: #{link['href']}"
      links << {:title => link.text, :href => link["href"]}
    end
    files << {:title => title, :links => links}
  end
  directories << {:path => File.basename(file).split(".").first, :files => files}
end

def to_broadway(files)
  
end

def to_markdown(directories)
  directories.each do |directory|
    files = directory[:files]
    next if files.blank?
    files.each do |file|
      result = "---\n"
      result << to_metadata(file)
      result << "---\n"
      FileUtils.mkdir_p("result/#{directory[:path]}") unless File.exists?("result/#{directory[:path]}")
      path = "result/#{directory[:path]}/#{file[:title].downcase.gsub(/\s+/, "-")}.markdown"
      File.open(path, "w+") do |place|
        place.puts result
      end
    end
  end
end

def to_yaml(directories)
  result = ""
  directories.each do |directory|
    files = directory[:files]
    next if files.blank?
    result << "#{directory[:path]}:\n"
    files.each do |file|
      result << "\t-\n"
      result << to_metadata(file)
      File.open("result/cached-commons.yml", "w+") do |place|
        place.puts result
      end
    end
  end
end

def to_metadata(file)
  result = ""
  result << "\t\ttitle: #{file[:title]}\n"
  result << "\t\tsummary: \"\"\n"
  result << "\t\tlinks:\n"
  file[:links].each do |link|
    result << "\t\t\t-\n"
    result << "\t\t\t\ttitle: #{link[:title]}\n"
    result << "\t\t\t\turl: \"#{link[:href]}\"\n"
  end
  result
end
