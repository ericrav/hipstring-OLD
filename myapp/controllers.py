import datetime
import os
import random
import logging
import webapp2
import json
import math

import soundcloud

from lib.gaesessions import get_current_session

from google.appengine.api import memcache
from google.appengine.ext.webapp import template
from google.appengine.ext.db import GqlQuery

from helpers import *
from views import *
from models import *
from hsConfig import *

class BaseHandler(webapp2.RequestHandler):
    def getPath(self,file):
        return os.path.join(os.path.dirname(__file__) +
                            "/../templates/",file)
class BaseUserInteraction(BaseHandler):
    def getUser(self, sound):
        ip = self.request.remote_addr
        userLog = sound.user_votes.filter("user =", ip).get()
        return (ip, userLog)
    def getIP(self):
        ip = self.request.remote_addr
        return ip

class NewHandler(webapp2.RequestHandler):
    def get(self, id):
        #Check the id
        id = id.lower()
        if exists(id):
            self.redirect("/%s" %id)
            return
        songURL = "http://www.soundcloud.com/" + id
        if not validateURL(songURL):
            self.redirect("/")
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

class GetRandom(webapp2.RequestHandler):
    def get(self):
        ip    = self.request.remote_addr
        gql   = "SELECT title, author, artwork, url FROM Sound WHERE artwork != ''"
        songs = GqlQuery(gql)
        num   = memcache.get("totalSoundCountWithArtwork")
        if not num:
            num = songs.count()
            if not memcache.add("totalSoundCountWithArtwork", num, 1200):
                logging.error('Memcache set failed.')
        num -= 20
        if num < 1:
            num = 1
        offset = random.randint(0,num)
        res  = songs.fetch(20, offset=offset)
        data = []
        for sound in res:
            userLog = sound.user_votes.filter("user =", ip).get()
            if not userLog:
                attsVoted = -1
            else:
                attsVoted = 0
                for vote in userLog.votes:
                    attsVoted += math.fabs(vote)
            data.append({"title":sound.title,"author":sound.author,"artwork":sound.artwork,"url":sound.url, "voted":int(attsVoted)})
        random.shuffle(data)
        data = data[:12]
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data))

class GetUserStats(webapp2.RequestHandler):
    def get(self):
        ip    = self.request.remote_addr
        logs  = UserLog.all().filter("user =", ip)
        total = logs.count()
        voted = logs.filter("votes IN", [1,-1]).count()
        data  = {"total": total, "voted": voted}
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data))

class RegisterHandler(BaseUserInteraction):
    def post(self):
        email = self.request.get("email")
        if validateEmail(email):
            ip = self.getIP()
            EmailBeta(email=db.Email(email),ip=ip).put()
            emailValid = True
            data = {"res":"success"}
        else:
            error = True
            data = {"res":"error"}

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data))

class SoundCloudLogin(webapp2.RequestHandler):
    def get(self):
        session = get_current_session()
        if session.is_active():
            session.terminate()

        # create client object with app credentials
        client = soundcloud.Client(client_id='***REMOVED***',
                                   client_secret='***REMOVED***',
                                   redirect_uri='http://localhost:8080/sc_login')

        # exchange authorization code for access token
        code = self.request.get("code")
        access_token = client.exchange_token(code).access_token
        session["sc_access"] = access_token
        # create client object with access token
        client = soundcloud.Client(access_token=access_token)
        current_user = client.get('/me')
        uid = current_user.id
        user = User.get_or_insert(str(uid), soundcloudUID=uid, soundcloudUserName=current_user.username)
        session["username"] = current_user.username
        # if not user.soundcloudUserName:
        #     user.soundcloudUserName = current_user.username
        #     user.put()
