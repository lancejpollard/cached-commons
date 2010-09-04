require 'rubygems'
require 'sinatra'
require 'broadway'

this = File.dirname(__FILE__)

SITE = Broadway.build(:source => "#{this}/content", :settings => "#{this}/_config.yml")

set :public, "#{this}/.."
set :views, "#{this}/views"

CACHE_ROOT = "http://cachedcommons.org"

Broadway::Post.class_eval do
end