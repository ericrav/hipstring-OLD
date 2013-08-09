import datetime
import os
import random
import logging
import webapp2

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
class BaseUserInteraction(BaseHandler):
    def getUser(self, sound):
        ip = self.request.remote_addr
        userLog = sound.user_votes.filter("user =", ip).get()
        return (ip, userLog)
    def getIP(self):
        ip = self.request.remote_addr
        return ip
class HomeView(BaseHandler):
    def get(self):
        values = {}
        path = self.getPath("home.html")
        self.response.out.write(template.render(path, values))

class SongHandler(BaseUserInteraction):
    def find(self, id):
        query = "SELECT * FROM Sound WHERE url = '%s'" %id
        return db.GqlQuery(query).get()
    def rearrange(self, userLog, table):
        assignedIndices = []
        positives = []
        negatives = []
        votes = userLog.votes
        for i in xrange(len(votes)):
            if votes[i] == 1:
                assignedIndices.append(i)
                positives.append(table[i])
            elif votes[i] == -1:
                assignedIndices.append(i)
                negatives.append(table[i])
        unassignedLeft = [i for j, i in enumerate(table) if j not in assignedIndices]
        return (negatives,unassignedLeft,positives)
    def get(self, id):
        #Check the id
        id = id.lower()
        sound = self.find(id)
        if not sound:
            self.redirect("/new/%s" %id)
            return
        # Check if sound has artwork
        if not sound.artwork:
            getArtwork(sound, id)
        #Render the page, if valid track
        ip, userLog = self.getUser(sound)
        unassigned = zip(atts,titletexts,sound.positives,sound.negatives)
        if userLog:
            negatives,unassigned,positives = self.rearrange(userLog, unassigned)
        else:
            sound.uniqueVisits += 1
            sound.put()
            UserLog(user=ip, sound=sound).put()
            negatives = []
            positives = []

        artwork = sound.artwork
        attributesData = zip(atts,titletexts)
        votingValues = zip(sound.positives,sound.negatives)
        values = {"title":sound.title, "author":sound.author, "artwork":artwork,
                  "songURL":id, "attributesData":attributesData, "votingValues":votingValues}
        path = self.getPath("song.html")
        self.response.out.write(template.render(path, values))
    def post(self, id):
        sound = self.find(id)
        ip, userLog = self.getUser(sound)
        userVotes = userLog.votes
        changed = False
        for i in xrange(len(atts)):
            vote = self.request.get("%s" %atts[i])
            if vote == "y" and userVotes[i] == 0:
                sound.positives[i] += 1
                userLog.votes[i] = 1
                changed = True
            elif vote == "n" and userVotes[i] == 0:
                sound.negatives[i] += 1
                userLog.votes[i] = -1
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
