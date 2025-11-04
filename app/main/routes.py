# app/main/routes.py
from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user
from app.services import parsing_service, mapping_service
import traceback
import pandas as pd 

# Create a Blueprint instance named 'main'
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Renders the main homepage."""
    return render_template('index.html', title='Home', current_user=current_user)

@main_bp.route('/process', methods=['POST'])
def process_statement_file():
    print("--- SERVER: process_statement_file function has been entered ---")
    """Handles the bank statement file upload and processing."""
    if 'statement' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['statement']
    bank_name = request.form.get('bank', '').strip()
    account_type = request.form.get('account_type', 'retail').strip()
    
    if not bank_name:
        return jsonify({'error': 'Bank name is required.'}), 400

    try:
        # 1. Call the Parsing Service to get raw data from the uploaded file
        account_no, transactions_df = parsing_service.parse_file(bank_name, account_type, file)
        
        # --- THIS IS THE DEBUGGING CODE ---
        print("\n--- DEBUG: Parsed DataFrame from bank_parsers ---")
        print(transactions_df.to_string())
        print("------------------------------------------------\n")
        # ------------------------------------

        if not account_no:
             return jsonify({'error': 'Could not find account number in statement.'}), 400
        
        # 2. Call the Mapping Service to get mapping info from the database
        mapping_info = mapping_service.find_mapping_for_account(account_no)

        # 3. Call the Parsing Service again to apply business rules and finalize the data
        # This returns a list of dictionaries
        processed_data_list = parsing_service.apply_business_rules(transactions_df, mapping_info)

        # 4. Convert list of dicts to the rows/headers structure expected by the frontend
        if not processed_data_list:
             # MODIFIED: Send headers: [] back to prevent JS error
             return jsonify({'rows': [], 'headers': []})

        # MODIFIED: Set headers to an empty list
        headers = []
        
        # Convert list of dicts to list of lists
        rows = []
        for d in processed_data_list:
            row = [
                d.get('postingRule', ''),
                d.get('date', ''),
                d.get('amount', ''),
                d.get('text', ''),
                d.get('referenceId', ''),
                d.get('profitCenter', ''),
                d.get('costCenter', '')
            ]
            rows.append(row)

        # MODIFIED: Return JSON with 'rows' and 'headers' (as empty list)
        processed_json = {
            'rows': rows,
            'headers': headers
        }

        return jsonify(processed_json) # Return the correctly structured data

    except Exception as e:
        # If any error occurs during parsing or processing, print it to the terminal
        # and send a JSON error message back to the frontend.
        traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500