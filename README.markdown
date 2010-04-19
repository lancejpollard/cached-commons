# Cached Commons

## Common Code Cached using Github's Servers as a Content Delivery Network

Builds an interface on top of "this interface to the YUI Compressor":http://refresh-sf.com/yui/
Optimizes using "Google Closure":http://code.google.com/closure/compiler/docs/api-ref.html

Github uses Nginx v0.7.61 and gzips their content automatically.  All content that hasn't been changed between commits returns a "304 Not Modified" response!

This is what the headers look like when retrieving a file called "/README.textile" from Github (using Google Chrome's "Inspect Element" functionality):

First hit, after I just made changes to it and uploaded it (no "304 Not Modified")

<pre><code>Request URL:http://github.com/viatropos/seesaw/raw/master/README.textile
Request Method:GET
Status Code:200 OK
Request Headers
Accept:application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5
Referer:http://github.com/viatropos/seesaw/blob/master/README.textile
User-Agent:Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US) AppleWebKit/533.2 (KHTML, like Gecko) Chrome/5.0.342.9 Safari/533.2
Response Headers
Cache-Control:private
Connection:keep-alive
Content-Disposition:inline
Content-Encoding:gzip
Content-Transfer-Encoding:binary
Content-Type:text/plain; charset=utf-8
Date:Mon, 19 Apr 2010 03:53:41 GMT
ETag:"2b9337dad5c426f249e1c96ebdbe17cd"
Server:nginx/0.7.61
Status:200 OK
Transfer-Encoding:chunked
X-Content-Type-Options:nosniff
X-Runtime:12ms
</code></pre>

Second hit, no changes made (with "304 Not Modified"):

<pre><code>Request URL:http://github.com/viatropos/seesaw/raw/master/README.textile
Request Method:GET
Status Code:200 OK
Request Headers
Accept:application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5
Cache-Control:max-age=0
Referer:http://github.com/viatropos/seesaw/blob/master/README.textile
User-Agent:Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US) AppleWebKit/533.2 (KHTML, like Gecko) Chrome/5.0.342.9 Safari/533.2
Response Headers
Cache-Control:private
Content-Disposition:inline
Content-Encoding:gzip
Content-Transfer-Encoding:binary
Content-Type:text/plain; charset=utf-8
Date:Mon, 19 Apr 2010 03:54:33 GMT
ETag:"2b9337dad5c426f249e1c96ebdbe17cd"
Server:nginx/0.7.61
Status:304 Not Modified
X-Content-Type-Options:nosniff
X-Runtime:16ms
</code></pre>

h3. Beautify (TODO)

"Javascript Beautifier":http://jsbeautifier.org/