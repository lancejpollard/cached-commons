require 'rubygems'
require '_app/config'

def reset_me
  Dir["_app/content/cache/**/*"].each do |file|
    new_file = file.gsub(/\/cache/, "/new_cache")
    new_dir = File.dirname(new_file)
    FileUtils.mkdir_p(new_dir) unless File.exists?(new_dir)
    FileUtils.cp(file, new_file) unless File.directory?(file)
  end
end

Dir["_app/content/cache/**/*"].each do |file|
  next if File.directory?(file)
  begin
    puts file
    content = IO.read(file)
    content.gsub!(/^src.+\n/, "")
    content.gsub!(/^version.+\n/, "")
    content.gsub!(/^dependencies.+\n/, "")
    a = content.match(/^(home.+\n)/)[1]
    b = content.match(/^(demo.+\n)/)[1]
    c = content.match(/^(docs.+\n)/)[1]
    d = content.match(/^(repo.+\n)/)[1]
    content.gsub!(/(docs.+\n)(repo.+\n)(demo.+\n)(home.+\n)/, "#{a}#{b}#{c}#{d}")
    File.open(file, "w+") do |new_file|
      new_file.puts content
    end
  rescue Exception => e
    puts e.inspect
  end
end
