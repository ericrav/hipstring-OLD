import re
from lib import requests

from lib.soundcloud import client
from google.appengine.ext import db

def validateURL(str, search=re.compile(r'(http://|https://)?(www.)?soundcloud.com/([\w-]+)/([\w-]+)/?$',re.I).search):
    """Validates the url for entries."""
    return bool(search(str))

def validateEmail(str, search=re.compile(r'[^@]+@[^@]+\.[^@]+',re.I).search):
    """Validates the url for entries."""
    return bool(search(str))

def exists(entry):
    """Determines if the sound has already been submitted."""
    entry = entry.strip("/")
    query = "SELECT * FROM Sound WHERE url = '%s'" %entry
    songs = db.GqlQuery(query)
    return songs.count()

def scResolve(track_url):
    """Retrieves JSON data for track from SoundCloud."""
    #create client with access token
    aClient = client.Client(client_id='***REMOVED***')
    #resolve track URL into track resource
    track = aClient.get('/resolve', url=track_url)
    info = track.fields()
    return info

def existsInSC(songURL):
    """Checks if the url corresponds to a valid SoundCloud track."""
    try:
        JSON = scResolve(songURL)
    except:
        JSON = {"kind":"error"}
        return False
    if JSON["kind"] == "track":
        return JSON
    else:
        return False
