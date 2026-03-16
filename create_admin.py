from app import create_app, db
from app.models import User  # Make sure this matches your user model name
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # --- THIS LINE FIXES THE ERROR ---
    # It forces SQLAlchemy to create the tables in app.db if they don't exist
    db.create_all() 
    
    # Check if admin already exists
    admin = User.query.filter_by(username='admin').first()
    
    if admin:
        print("Admin user already exists!")
    else:
        # Create new admin user
        new_admin = User(
            username='admin', 
            password_hash=generate_password_hash('hfl@it01')
        )
        db.session.add(new_admin)
        db.session.commit()
        print("SUCCESS: Admin user created!")
        print("Username: admin")
        print("Password: hfl@it01")