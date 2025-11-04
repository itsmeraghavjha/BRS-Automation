# run.py
from app import create_app

# Call the factory function to create our app instance
app = create_app()

# This block runs only when you execute "python run.py" directly
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8086, debug=True)