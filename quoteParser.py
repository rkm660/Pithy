from bs4 import BeautifulSoup
import urllib2
from firebase import firebase
import json



def connectToAuthors(url="http://www.brainyquote.com/quotes/favorites.html"):
    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"}) 
    con = urllib2.urlopen( req )
    soup = BeautifulSoup(con)
    return soup    

def getAuthors(soup):
    authorLinks = []
    authorNames = []
    authors = soup.find_all("div",attrs={'class':'bq_fl'})
    for author in authors[1:]:
        div = author.find_all("div", attrs={"class":"bqLn"})
        for d in div:
            img = d.find_all("img")
            a = d.find_all("a")
            if (len(img) > 0):
                authorLinks.append(a[0]["href"])
                authorNames.append(a[0].decode_contents(formatter="html"))
    return [authorNames,authorLinks]



def connectToAuthor(url):
    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"}) 
    con = urllib2.urlopen( req )
    soup = BeautifulSoup(con)
    return soup     

def getAuthorQuotes(soup):
    returnQuotes = []
    quotes = soup.find_all("div",attrs={"class":"bq-slide-q-text"})
    for quote in quotes:
        a = quote.find_all("a")
        for link in a:
            returnQuotes.append(link.decode_contents(formatter="html"))
    return returnQuotes

authorInfo = getAuthors(connectToAuthors())
dic = {}
for i,name in enumerate(authorInfo[0]):
    dic[name] = getAuthorQuotes(connectToAuthor("http://www.brainyquote.com" + authorInfo[1][i]))



