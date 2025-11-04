# app/auth/routes.py
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # If the user is already logged in, send them to the homepage
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    # If the form has been submitted
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        # Check if the user exists and the password is correct
        if user is None or not user.check_password(password):
            flash('Invalid username or password') # Show an error message
            return redirect(url_for('auth.login'))

        # If credentials are correct, log the user in
        login_user(user)
        return redirect(url_for('main.index'))

    return render_template('login.html', title='Sign In')

@auth_bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))