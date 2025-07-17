#!/usr/bin/env python3
import os
import http.server
import socketserver
import sys

def inject_api_key():
    """Inject the Google API key into the HTML file"""
    api_key = os.getenv('GOOGLE_API_KEY', '')
    
    # Read the HTML file
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the placeholder with the actual API key
    content = content.replace('GOOGLE_API_KEY_PLACEHOLDER', api_key)
    
    # Write back to a temporary file
    with open('index_temp.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Replace the original file
    os.rename('index_temp.html', 'index.html')
    print(f"API key injected successfully")

def start_server(port=5000):
    """Start the HTTP server"""
    handler = http.server.SimpleHTTPRequestHandler
    
    # Try to start the server, retry with different ports if needed
    for attempt_port in range(port, port + 10):
        try:
            with socketserver.TCPServer(("0.0.0.0", attempt_port), handler) as httpd:
                print(f"Server running at http://0.0.0.0:{attempt_port}")
                # Don't serve forever in the try block, do it outside
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno == 98:  # Address already in use
                print(f"Port {attempt_port} is in use, trying {attempt_port + 1}")
                if attempt_port == port + 9:  # Last attempt
                    print("All ports exhausted, using force approach")
                    # Kill any process on port 5000 and use it
                    os.system("pkill -f 'python.*http.server' || true")
                    os.system("sleep 2")  # Give time for cleanup
                    with socketserver.TCPServer(("0.0.0.0", 5000), handler) as httpd:
                        print(f"Server running at http://0.0.0.0:5000")
                        httpd.serve_forever()
                continue
            else:
                raise

if __name__ == "__main__":
    inject_api_key()
    # Kill any existing processes using port 5000
    os.system("pkill -f 'python.*http.server' || true")
    os.system("sleep 2")
    start_server()