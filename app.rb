require 'rubygems'
require 'haml'
require 'sinatra'
require 'broadway'
require 'rest_client'

set :public, "public"
set :views, "views"

CACHED_COMMONS = "http://github.com/viatropos/cached-commons/raw/master/public" unless defined?(CACHED_COMMONS)

get "/" do
  options = {}
  locals = {:cache_root => CACHED_COMMONS}
  haml :index, options, locals
end

post "/minify" do
  options = {
    :compresstext => params["input_text"],
    :type => params["compressor"] == "css" ? "CSS" : "JS"
  }
  response = RestClient.post "http://refresh-sf.com/yui/", options
  html = Nokogiri::HTML(response.to_s)
  minified = html.xpath("//textarea[@class='output']").first.text
  stats = html.xpath("//dl[@class='stats']").first
  stats_hash = {}
  keys = stats.xpath("dt")
  values = stats.xpath("dd")
  keys.each_with_index do |child, index|
    stats_hash[child.text] = values[index].text
  end
  minified
end