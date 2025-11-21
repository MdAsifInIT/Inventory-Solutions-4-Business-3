#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # Check if it's a file request (has extension)
        if '.' in parsed_path.path.split('/')[-1]:
            # It's a file request, serve normally
            return super().do_GET()
        else:
            # It's a route request, serve index.html
            self.path = '/index.html'
            return super().do_GET()

if __name__ == "__main__":
    PORT = 3000
    os.chdir('/app/client/dist')
    
    with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
        print(f"Serving SPA at http://0.0.0.0:{PORT}")
        httpd.serve_forever()