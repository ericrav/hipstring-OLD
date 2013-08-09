import datetime
import os
import random
import logging
import webapp2

from google.appengine.api import memcache
from google.appengine.ext.webapp import template

from helpers import *
from models import *

atts = ["Melody","Harmony","Rhythm","Tempo","Instrumentation",
        "Tone","Production","Dynamics","Originality","Form"]
titletexts = ['The main tune or most prominent sounds of the music. The "horizontal" aspect of the music that moves along with time.',
              'The simultaneous sounds that create chords or richer sound. The texture of the music, and how all the sounds interact "vertically."',
              'The pattern or placement of the sounds in time. Also, the beat and pulse of the music.',
              'The speed or pace of the music. It can be consistent or change throughout the music.',
              'The instruments or sounds used in the piece. How do they suit the nature of the instrument and how do the sounds fit in together? Is each part of the music played by the right sound/instrument?',
              'The way the music and each part of it sounds to the ear and how distinguishable each sound is. Also known as timbre or tone color.',
              'The quality of the recording. How the different frequencies and levels of sound interact. (The music may be well written but sound poor in this recording due to the production).',
              'The loudness or softness of the music and how it changes.',
              'How creative the music is overall.',
              'The overall structure of the music. How it is broken into parts, how it moves from part to part, and how all the other elements interact.']


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
class MainHandler(BaseHandler):
    def get(self):
        values = {}
        path = self.getPath("home.html")
        self.response.out.write(template.render(path, values))
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
        while not exists(id):
            continue
        self.redirect("/%s" %id)

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

        votingValues = zip(sound.positives,sound.negatives)
        values = {"title":sound.title, "author":sound.author,
                  "songURL":id, "unassigned":unassigned,
                  "negatives":negatives, "positives":positives, "votingValues":votingValues}
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

class LoginHandler(BaseUserInteraction):
    def get(self):
        values = {}
        path = self.getPath("login.html")
        self.response.out.write(template.render(path, values))
    def post(self):
        email = self.request.get("email")
        if validateEmail(email):
            ip = self.getIP()
            EmailBeta(email=db.Email(email),ip=ip).put()
            emailValid = True
            values = {"emailValid":emailValid}
            path = self.getPath("login.html")
            self.response.out.write(template.render(path, values))
        else:
            error = True
            values = {"error":error}
            path = self.getPath("login.html")
            self.response.out.write(template.render(path, values))

class CreateHandler(BaseHandler):
    def get(self):
        values = {}
        path = self.getPath("create.html")
        self.response.out.write(template.render(path, values))
    def post(self):
        url = self.request.get("entry")
        url = url.lower()
        if validateURL(url):
            i = url.find(".com/")
            self.redirect("/new/" + url[i+5:])
            return
        else:
            values = {"error":True}
            path = self.getPath("create.html")
            self.response.out.write(template.render(path, values))

class ExploreHandler(BaseHandler):
    def get(self):
        values = {}
        path = self.getPath("explore.html")
        self.response.out.write(template.render(path, values))
