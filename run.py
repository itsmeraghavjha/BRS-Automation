import threading
import time
import schedule
from app import create_app

# --- UPDATE: Import the new dynamic fetcher ---
from app.services.email_service import fetch_statements_dynamic

app = create_app()

def run_email_scheduler():
    """Runs the dynamic email checking loop in a separate thread."""
    
    # 1. Force it to run IMMEDIATELY when you start the server
    fetch_statements_dynamic(app)
    
    # 2. Schedule it to run every 1 minute for testing (change to 15 later for production)
    schedule.every(1).minutes.do(fetch_statements_dynamic, app=app)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    # Start the background email thread
    email_thread = threading.Thread(target=run_email_scheduler, daemon=True)
    email_thread.start()
    
    print("--- BRS Automation Server Started ---")
    print("--- Background Dynamic Email Fetcher Active ---")
    
    # Start the web app
    app.run(host='0.0.0.0', port=8086, debug=True, use_reloader=False)