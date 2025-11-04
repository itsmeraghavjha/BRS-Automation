# app/models.py
from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

# This function is a helper required by Flask-Login. It tells it how to
# find a specific user by their ID, which is stored in the session cookie.
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# This is the blueprint for our 'user' table.
# UserMixin adds helpful, pre-built functions for Flask-Login.
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) # A unique ID for each user.
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(256)) # We store a hashed password, never the real one.
    role = db.Column(db.String(10), index=True, default='user') # e.g., 'admin' or 'user'

    def set_password(self, password):
        """Creates a secure hash of the password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if a provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

# This is the blueprint for our 'mapping' table.
class Mapping(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    accountNo = db.Column(db.String(120), index=True, unique=True, nullable=False)
    profitCenter = db.Column(db.String(120))
    costCenter = db.Column(db.String(120)) # Retained for DB integrity
    branchName = db.Column(db.String(120))
    owner = db.Column(db.String(120))
    email = db.Column(db.String(120)) # Retained for DB integrity
    
    # --- NEW FIELDS ---
    houseBank = db.Column(db.String(120))
    bankGL = db.Column(db.String(120))
    bankName = db.Column(db.String(120))
    # ------------------

    def to_dict(self):
        """A helper function to easily convert a mapping object to a dictionary, returning all fields."""
        # Returns ALL fields for use by the service layer and form population logic.
        return {
            'id': self.id,
            'accountNo': self.accountNo,
            'profitCenter': self.profitCenter,
            'branchName': self.branchName,
            'owner': self.owner,
            'houseBank': self.houseBank,
            'bankGL': self.bankGL,
            'bankName': self.bankName,
            'costCenter': self.costCenter, # Hidden field for data persistence
            'email': self.email,           # Hidden field for data persistence
        }