import requests
import re

base_url = "http://103.247.8.224/api"
res = requests.post(f"{base_url}/auth/login", json={"email": "admin@telkomuniversity.ac.id", "password": "password"})

html = res.text
# Look for <title>Error: ...</title> or the main exception title
match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
if match:
    print("Title:", match.group(1))

# Laravel error page often has the exception class in a header or something
# Let's just print a snippet around "Exception"
idx = html.find('Exception')
if idx != -1:
    print("Snippet:", html[max(0, idx-100):min(len(html), idx+300)])
else:
    print("No exception keyword found.")
