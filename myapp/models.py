from google.appengine.ext import db

class Sound(db.Model):
    dateAdded = db.DateProperty(auto_now_add=True)
    lastVoted = db.DateTimeProperty()
    title = db.StringProperty(required=True)
    author = db.StringProperty(required=True)
    artwork = db.StringProperty(default="")
    url = db.StringProperty(required=True)
    scID = db.IntegerProperty(required=True)
    uniqueVisits = db.IntegerProperty(default=0)
    positives = db.ListProperty(int, default=[0,0,0,0,0,0,0,0,0,0])
    negatives = db.ListProperty(int, default=[0,0,0,0,0,0,0,0,0,0])
    posTotal = db.IntegerProperty(default=0)
    negTotal = db.IntegerProperty(default=0)
    def findSum(self):
        pos = 0
        neg = 0
        for x in self.positives:
            pos += x
        for x in self.negatives:
            neg += x
        self.posTotal = pos
        self.negTotal = neg

class User(db.Model):
    soundcloudUID = db.IntegerProperty()
    soundcloudUserName = db.StringProperty()

class UserLog(db.Model):
    votes = db.ListProperty(int, default=[0,0,0,0,0,0,0,0,0,0])
    user = db.StringProperty(required=True)
    sound = db.ReferenceProperty(Sound, collection_name="user_votes")

class EmailBeta(db.Model):
    email = db.EmailProperty()
    ip = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)
