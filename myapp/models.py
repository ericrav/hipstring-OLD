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
    attributes = db.StringListProperty(default=["Melody","Harmony","Rhythm","Tempo","Instrumentation",
        "Tone","Production","Dynamics","Originality","Form"])
    attributesInfo = db.StringListProperty(default=['The main tune or most prominent sounds of the music. The "horizontal" aspect of the music that moves along with time.',
              'The simultaneous sounds that create chords or richer sound. The texture of the music, and how all the sounds interact "vertically."',
              'The pattern or placement of the sounds in time. Also, the beat and pulse of the music.',
              'The speed or pace of the music. It can be consistent or change throughout the music.',
              'The instruments or sounds used in the piece. How do they suit the nature of the instrument and how do the sounds fit in together? Is each part of the music played by the right sound/instrument?',
              'The way the music and each part of it sounds to the ear and how distinguishable each sound is. Also known as timbre or tone color.',
              'The quality of the recording. How the different frequencies and levels of sound interact. (The music may be well written but sound poor in this recording due to the production).',
              'The loudness or softness of the music and how it changes.',
              'How creative the music is overall.',
              'The overall structure of the music. How it is broken into parts, how it moves from part to part, and how all the other elements interact.'])
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
    displayName = db.StringProperty()

class UserLog(db.Model):
    votes = db.ListProperty(int, default=[0,0,0,0,0,0,0,0,0,0])
    user = db.StringProperty(required=True)
    sound = db.ReferenceProperty(Sound, collection_name="user_votes")

class EmailBeta(db.Model):
    email = db.EmailProperty()
    ip = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)
