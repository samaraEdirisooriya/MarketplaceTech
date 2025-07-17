#!/usr/bin/env python3
import os
import http.server
import socketserver
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # If requesting the root or index.html, inject the API key
        if parsed_path.path == '/' or parsed_path.path == '/index.html':
            try:
                # Read the original HTML file
                with open('index.html', 'r', encoding='utf-8') as f:
                    html_content = f.read()
                
                # Get the API key from environment
                api_key = os.getenv('GOOGLE_API_KEY', '')
                
                # Inject the API key into the HTML
                api_key_script = f"""
    <script>
        window.GOOGLE_API_KEY = '{api_key}';
    </script>"""
                
                # Insert the script before the closing </head> tag
                html_content = html_content.replace('</head>', api_key_script + '\n</head>')
                
                # Send the response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Content-Length', str(len(html_content.encode('utf-8'))))
                self.end_headers()
                self.wfile.write(html_content.encode('utf-8'))
                return
                
            except Exception as e:
                print(f"Error reading index.html: {e}")
                self.send_error(500, "Internal Server Error")
                return
        
        # For all other requests, use the default handler
        super().do_GET()

def run_server(port=5000):
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("0.0.0.0", port), handler) as httpd:
        print(f"Server running at http://0.0.0.0:{port}")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()