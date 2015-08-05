import urllib2
import base64


app_id = "b323c695"
app_key = "3957c31444fdddad48fc3d73c08b2eeca9dfc81ca62c241a"
headers = 'User-Agent:Mozilla/5.0'
url = "http://apps.ionic.io/api/v1/app/b323c695/users/info"
req = urllib2.Request(url)
b64 = base64.encodestring('%s:%s' % (app_key, '')).replace('\n', '')
req.add_header("Authorization", "Basic %s" % b64)
resp = urllib2.urlopen(req,headers)
