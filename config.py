# config.py
import os

# Get the absolute path of the directory the config.py file is in
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # SECRET_KEY is needed by Flask for security, especially for user sessions.
    # It should be a long, random string.
    SECRET_KEY = 'any-secret-key-you-choose'

    # This tells SQLAlchemy where to create and find our database file.
    # We're telling it to create an 'app.db' file inside a special 'instance' folder.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')

    # This is just a setting to disable a feature we don't need, which saves resources.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    