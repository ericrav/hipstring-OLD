import datetime
import os
import random
import logging
import webapp2

from google.appengine.api import memcache
from google.appengine.ext.webapp import template

from helpers import *
from views import *
from models import *
from hsConfig import *

class NewHandler(webapp2.RequestHandler):
    def get(self, id):
        #Check the id
        id = id.lower()
        if exists(id):
            self.redirect("/%s" %id)
            return
        songURL = "http://www.soundcloud.com/" + id
        if not validateURL(songURL):
            self.redirect("/create")
            return
        trackData = existsInSC(songURL)
        if not trackData:
            self.redirect("/create")
            return
        #After id is validated, add it the datastore
        title = trackData["title"]
        author = trackData["user"]["username"]
        scID = trackData["id"]
        sound = Sound(title=title, author=author, url=id, scID=scID)
        sound.put()
        getArtwork(sound, id)
        while not exists(id):
            continue
        self.redirect("/%s" %id)

class CreateHandler(webapp2.RequestHandler):
    def post(self):
        url = self.request.get("entry")
        url = url.lower()
        if validateURL(url):
            i = url.find(".com/")
            self.redirect("/new/" + url[i+5:])
            return
        else:
            self.redirect("/random#invalidentry")