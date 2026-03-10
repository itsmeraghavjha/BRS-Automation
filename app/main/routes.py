# app/main/routes.py
from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user
from app.services import parsing_service, mapping_service
import traceback
import pandas as pd 
import re
from app.models import Mapping
import os

# Create a Blueprint instance named 'main'
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Renders the main homepage."""
    return render_template('index.html', title='Home', current_user=current_user)

# @main_bp.route('/process', methods=['POST'])
# def process_statement_file():
#     print("--- SERVER: process_statement_file function has been entered ---")
#     """Handles the bank statement file upload and processing."""
#     if 'statement' not in request.files:
#         return jsonify({'error': 'No file provided'}), 400

#     file = request.files['statement']
#     bank_name = request.form.get('bank', '').strip()
#     account_type = request.form.get('account_type', 'retail').strip()
    
#     if not bank_name:
#         return jsonify({'error': 'Bank name is required.'}), 400

#     try:
#         # 1. Call the Parsing Service to get raw data from the uploaded file
#         account_no, transactions_df = parsing_service.parse_file(bank_name, account_type, file)
        
#         # --- THIS IS THE DEBUGGING CODE ---
#         print("\n--- DEBUG: Parsed DataFrame from bank_parsers ---")
#         print(transactions_df.to_string())
#         print("------------------------------------------------\n")
#         # ------------------------------------

#         if not account_no:
#              return jsonify({'error': 'Could not find account number in statement.'}), 400
        
#         # 2. Call the Mapping Service to get mapping info from the database
#         mapping_info = mapping_service.find_mapping_for_account(account_no)

#         # 3. Call the Parsing Service again to apply business rules and finalize the data
#         # This returns a list of dictionaries
#         processed_data_list = parsing_service.apply_business_rules(transactions_df, mapping_info)

#         # 4. Convert list of dicts to the rows/headers structure expected by the frontend
#         if not processed_data_list:
#              # MODIFIED: Send headers: [] back to prevent JS error
#              return jsonify({'rows': [], 'headers': []})

#         # MODIFIED: Set headers to an empty list
#         headers = []
        
#         # Convert list of dicts to list of lists
#         rows = []
#         for d in processed_data_list:
#             row = [
#                 d.get('postingRule', ''),
#                 d.get('date', ''),
#                 d.get('amount', ''),
#                 d.get('text', ''),
#                 d.get('referenceId', ''),
#                 d.get('profitCenter', ''),
#                 d.get('costCenter', '')
#             ]
#             rows.append(row)

#         # MODIFIED: Return JSON with 'rows' and 'headers' (as empty list)
#         processed_json = {
#             'rows': rows,
#             'headers': headers
#         }

#         return jsonify(processed_json) # Return the correctly structured data

#     except Exception as e:
#         # If any error occurs during parsing or processing, print it to the terminal
#         # and send a JSON error message back to the frontend.
#         traceback.print_exc()
#         return jsonify({'error': f'An error occurred: {str(e)}'}), 500



# app/main/routes.py

# ... (imports remain same) ...

@main_bp.route('/process', methods=['POST'])
def process_statement_file():
    if 'statement' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['statement']
    bank_name = request.form.get('bank', '').strip()
    account_type = request.form.get('account_type', 'retail').strip()
    
    # NEW: Catch the selected account if the user has resolved a conflict from the UI popup
    selected_account = request.form.get('selected_account', '').strip()
    
    if not bank_name:
        return jsonify({'error': 'Bank name is required.'}), 400

    try:
        from app.services import parsing_service, mapping_service
        account_no, transactions_df = parsing_service.parse_file(bank_name, account_type, file)
        processed_data_list = []

        if account_no == 'MULTI':
            if 'accountNo' not in transactions_df.columns:
                 return jsonify({'error': 'Multi-account parsing failed.'}), 400
            grouped = transactions_df.groupby('accountNo')
            for acct, group_df in grouped:
                mapping_info = mapping_service.find_mapping_for_account(acct)
                subset_processed = parsing_service.apply_business_rules(group_df, mapping_info)
                for item in subset_processed:
                    item['accountNo'] = acct
                    processed_data_list.extend([item])
                    
        else:
            # --- SMART MATCHING LOGIC FOR MASKED ACCOUNTS ---
            if selected_account:
                # The user already chose an account from the frontend popup
                mapping_info = mapping_service.find_mapping_for_account(selected_account)
            else:
                account_no_str = str(account_no).strip().upper()
                
                # Check if it's a masked account containing X or *
                if 'X' in account_no_str or '*' in account_no_str:
                    # Convert "252XXXXXXXX032" to "252%032"
                    search_pattern = re.sub(r'[X*]+', '%', account_no_str)
                    possible_mappings = Mapping.query.filter(Mapping.accountNo.like(search_pattern)).all()
                else:
                    mapping = Mapping.query.filter_by(accountNo=account_no_str).first()
                    possible_mappings = [mapping] if mapping else []

                # Handle the matches
                if len(possible_mappings) > 1:
                    # TRIGGER UI POPUP: Send list of accounts to frontend and stop processing
                    accounts_list = [m.accountNo for m in possible_mappings]
                    return jsonify({
                        'status': 'multiple_accounts', 
                        'accounts': accounts_list,
                        'message': 'Multiple mapping options found for masked account.'
                    }), 200
                elif len(possible_mappings) == 1:
                    mapping_info = possible_mappings[0].to_dict()
                else:
                    mapping_info = None

            # Apply your new 10-column layout rules
            processed_data_list = parsing_service.apply_business_rules(transactions_df, mapping_info)
            for item in processed_data_list:
                item['accountNo'] = account_no

        if not processed_data_list:
             return jsonify({'rows': [], 'headers': []})

        # Set up the 10 headers
        headers = [
            "Company Code", "House Bank", "Statement Date", "Closing Bal", 
            "Posting Rule", "Posting Date", "Amount", "Bank ref No", 
            "Profit Center", "Cost Center"
        ]
        
        rows = []
        for d in processed_data_list:
            row = [
                d.get('Company Code', ''), d.get('House Bank', ''), d.get('Statement Date', ''),
                d.get('Closing Bal', ''), d.get('Posting Rule', ''), d.get('Posting Date', ''),
                d.get('Amount', ''), d.get('Bank ref No', ''), d.get('Profit Center', ''), d.get('Cost Center', ''),
                d.get('accountNo', 'Report') # Hidden 11th column for file splitting
            ]
            rows.append(row)

        return jsonify({'status': 'success', 'rows': rows, 'headers': headers})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
    




@main_bp.route('/push-to-sap', methods=['POST'])
def push_to_sap():
    data = request.json
    if not data or 'files' not in data:
        return jsonify({'success': False, 'error': 'No files provided'}), 400

    # --- SET YOUR SAP FOLDER ADDRESS HERE ---
    # Example: SAP_FOLDER_PATH = r"\\server\share\sap_input_folder" or "C:\\SAP_Uploads"
    SAP_FOLDER_PATH = r"C:/Users/raghavkumar.j/Desktop/demo" # Change this later to your actual path

    # Create directory if it doesn't exist just to prevent crashes
    if not os.path.exists(SAP_FOLDER_PATH):
        try:
            os.makedirs(SAP_FOLDER_PATH)
        except Exception as e:
            return jsonify({'success': False, 'error': f'Could not access or create folder: {str(e)}'}), 500

    try:
        saved_files = []
        for file_info in data['files']:
            filename = file_info.get('fileName')
            content = file_info.get('fileContent')
            
            if not filename or not content:
                continue

            file_path = os.path.join(SAP_FOLDER_PATH, filename)
            
            # Write the text content directly to the target folder
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            saved_files.append(filename)

        return jsonify({
            'success': True, 
            'message': f'Successfully pushed {len(saved_files)} file(s) to {SAP_FOLDER_PATH}'
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Error saving files: {str(e)}'}), 500