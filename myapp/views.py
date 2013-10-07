import datetime
import os
import random
import logging
import webapp2

import soundcloud

from lib.gaesessions import get_current_session

from google.appengine.api import memcache
from google.appengine.ext.webapp import template

from helpers import *
from controllers import *
from models import *
from hsConfig import *

class BaseHandler(webapp2.RequestHandler):
    def getPath(self,file):
        return os.path.join(os.path.dirname(__file__) +
                            "/../templates/",file)
    def getUsername(self):
        session = get_current_session()
        if session.has_key("username"):
            username = session["username"]
        else:
            username = ""
        return username
class BaseUserInteraction(BaseHandler):
    def getUser(self, sound):
        session = get_current_session()
        if session.has_key("uid"):
            uid = str(session["uid"])
        else:
            uid = self.request.remote_addr
        userLog = sound.user_votes.filter("user =", uid).get()
        return (uid, userLog)
    def getIP(self):
        ip = self.request.remote_addr
        return ip
class HomeView(BaseHandler):
    def get(self):
        values = {"username":self.getUsername()}
        path = self.getPath("home.html")
        self.response.out.write(template.render(path, values))

class SongHandler(BaseUserInteraction):
    def find(self, id):
        query = "SELECT * FROM Sound WHERE url = '%s'" %id
        return db.GqlQuery(query).get()
    def get(self, id):
        # Check the id
        id = id.lower()
        sound = self.find(id)
        if not sound:
            self.redirect("/new/%s" %id)
            return
        # Check if sound has artwork
        if not sound.artwork:
            getArtwork(sound, id)
        # Get user data
        ip, userLog = self.getUser(sound)
        # Get user's votes
        if userLog:
            votes = []
            for vote in userLog.votes:
                if vote == 1:
                    votes.append(" positive rated")
                elif vote == -1:
                    votes.append(" negative rated")
                else:
                    votes.append("")
        else:
            sound.uniqueVisits += 1
            sound.put()
            UserLog(user=ip, sound=sound).put()
            votes = ["","","","","","","","","",""]

        # Render the page, if valid track
        artwork = sound.artwork.replace("-large","-t500x500")
        voters = sound.user_votes.filter("votes IN", [1,-1]).count()
        attributesData = zip(range(10),atts,titletexts,votes)
        votingValues = zip(sound.positives,sound.negatives)
        values = {"title":sound.title, "author":sound.author, "artwork":artwork, "voters": voters,
                  "songURL":id, "attributesData":attributesData, "votingValues":votingValues,
                  "username":self.getUsername()}
        path = self.getPath("song.html")
        self.response.out.write(template.render(path, values))
    def post(self, id):
        sound = self.find(id)
        ip, userLog = self.getUser(sound)
        if not ip:
            return
        userVotes = userLog.votes
        changed = False
        att = int(self.request.get("att"))
        vote = self.request.get("vote")
        if vote == "y":
            oldVote = userVotes[att]
            if oldVote == 0:
                sound.positives[att] += 1
            elif oldVote == -1:
                sound.negatives[att] -= 1
                sound.positives[att] += 1
            else:
                return
            userLog.votes[att] = 1
            changed = True
        elif vote == "n":
            oldVote = userVotes[att]
            if oldVote == 0:
                sound.negatives[att] += 1
            elif oldVote == 1:
                sound.positives[att] -= 1
                sound.negatives[att] += 1
            else:
                return
            userLog.votes[att] = -1
            changed = True
        elif vote == "0":
            oldVote = userVotes[att]
            if oldVote == 1:
                sound.positives[att] -= 1
            elif oldVote == -1:
                sound.negatives[att] -= 1
            else:
                return
            userLog.votes[att] = 0
            changed = True
        if changed:
            sound.findSum()
            sound.lastVoted = datetime.datetime.now()
            sound.put()
            userLog.put()

class RandomHandler(webapp2.RequestHandler):
    def get(self):
        num = memcache.get("totalSoundCount")
        songs = Sound.all()
        if not num:
            num = songs.count()
            if not memcache.add("totalSoundCount", num, 1200):
                logging.error('Memcache set failed.')
        id = random.randint(0,num-1)
        song = songs[id]
        urlname = song.url
        self.redirect("/%s" %urlname)

class VisitedHandler(BaseUserInteraction):
    def get(self):
        ip = self.getIP()
        visited = UserLog.all()
        visited.filter("user =", ip)
        num = visited.count()
        id = random.randint(0,num-1)
        page = visited[id]
        urlname = page.sound.url
        self.redirect("/%s" %urlname)
