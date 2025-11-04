# app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

# Create instances of our "tools" but don't connect them to an app yet.
# Think of these as our database translator, our user login helper, etc.
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app():
    """This is the App Factory function."""

    # 1. Create the core Flask application instance
    app = Flask(__name__, instance_relative_config=True)

    # 2. Load configuration from a separate file (we'll create this next)
    # This tells the app to look for a config.py file for its settings.
    app.config.from_object('config.Config')

    # 3. Ensure the 'instance' folder exists (for our SQLite database)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # 4. Connect our tools (extensions) to the app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # This import is placed here to avoid circular import errors.
    from . import models

    # Register Blueprints
    from .main.routes import main_bp
    app.register_blueprint(main_bp)

    from .auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from .mappings.routes import mappings_bp
    app.register_blueprint(mappings_bp, url_prefix='/mappings')

    # 5. We will register our "Blueprints" (the app's sections) here later...

    print("Flask App created successfully!")
    return app