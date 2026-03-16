# app/main/routes.py
from flask import Blueprint, render_template, request, jsonify, session
from flask_login import current_user
from app.services import parsing_service, mapping_service
import traceback
import pandas as pd 
import re
from app.models import Mapping
import os
from app.services.email_service import send_notification_email

# Create a Blueprint instance named 'main'
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Renders the main homepage."""
    return render_template('index.html', title='Home', current_user=current_user)

@main_bp.route('/process', methods=['POST'])
def process_statement_file():
    if 'statement' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['statement']
    bank_name = request.form.get('bank', '').strip()
    account_type = request.form.get('account_type', 'retail').strip()
    selected_account = request.form.get('selected_account', '').strip()
    
    if not bank_name:
        return jsonify({'error': 'Bank name is required.'}), 400

    # --- NEW: CACHE ORIGINAL FILE FOR EMAIL ---
    # We save the raw uploaded file temporarily so /push-to-sap can grab it later
    try:
        temp_dir = r"C:/Users/raghavkumar.j/Desktop/demo"
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        
        temp_path = os.path.join(temp_dir, "temp_original_upload.tmp")
        original_bytes = file.read()
        
        with open(temp_path, 'wb') as f:
            f.write(original_bytes)
            
        session['orig_filename'] = file.filename
        file.seek(0) # Reset file pointer so the parser can still read it!
    except Exception as e:
        print(f"Warning: Could not cache original file: {e}")
    # ------------------------------------------

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
                mapping_info = mapping_service.find_mapping_for_account(selected_account)
            else:
                account_no_str = str(account_no).strip().upper()
                
                if 'X' in account_no_str or '*' in account_no_str:
                    search_pattern = re.sub(r'[X*]+', '%', account_no_str)
                    possible_mappings = Mapping.query.filter(Mapping.accountNo.like(search_pattern)).all()
                else:
                    mapping = Mapping.query.filter_by(accountNo=account_no_str).first()
                    possible_mappings = [mapping] if mapping else []

                if len(possible_mappings) > 1:
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

            processed_data_list = parsing_service.apply_business_rules(transactions_df, mapping_info)
            for item in processed_data_list:
                item['accountNo'] = account_no

        if not processed_data_list:
             return jsonify({'rows': [], 'headers': []})

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
                d.get('accountNo', 'Report') 
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

    SAP_FOLDER_PATH = r"C:/Users/raghavkumar.j/Desktop/demo"

    if not os.path.exists(SAP_FOLDER_PATH):
        try:
            os.makedirs(SAP_FOLDER_PATH)
        except Exception as e:
            return jsonify({'success': False, 'error': f'Could not access or create folder: {str(e)}'}), 500

    # --- NEW: LOAD THE CACHED ORIGINAL FILE ---
    original_bytes = None
    orig_filename = session.get('orig_filename', 'Original_Statement.csv')
    temp_path = os.path.join(SAP_FOLDER_PATH, "temp_original_upload.tmp")
    
    if os.path.exists(temp_path):
        try:
            with open(temp_path, 'rb') as f:
                original_bytes = f.read()
        except Exception as e:
            print(f"Warning: Could not load cached file: {e}")
    # ------------------------------------------

    try:
        saved_files = []
        for file_info in data['files']:
            filename = file_info.get('fileName')
            content = file_info.get('fileContent')
            
            if not filename or not content:
                continue

            file_path = os.path.join(SAP_FOLDER_PATH, filename)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            saved_files.append(filename)

            # --- ROBUST EMAIL NOTIFICATION ---
            # --- ROBUST EMAIL NOTIFICATION ---
            # --- ROBUST EMAIL NOTIFICATION ---
            try:
                clean_name = filename.replace('.txt', '').replace('.csv', '')
                parts = clean_name.split('_')
                
                if len(parts) >= 3:
                    # Look BACKWARDS: -1 is the Date, -2 is the Account Number
                    acc_no = parts[-2] 
                    
                    mapping = Mapping.query.filter_by(accountNo=acc_no).first()
                    
                    if mapping and mapping.email:
                        print(f"DEBUG: Found email {mapping.email} for account {acc_no}. Sending...")
                        
                        # --- FIX: PULL REAL BANK NAME FROM DATABASE ---
                        # Instead of guessing from the filename, we grab the exact name you typed in the UI
                        bank_display = mapping.bankName if mapping.bankName else "Bank"
                        
                        attachments = [(filename, content.encode('utf-8'))]
                        if original_bytes:
                            attachments.append((orig_filename, original_bytes))
                            
                        send_notification_email(
                            mapping.email,
                            mapping.accountNo,
                            bank_display.upper(), # .upper() makes it look nice like "HDFC" or "ICICI"
                            attachments
                        )
                    else:
                        print(f"DEBUG: No email mapping found for extracted account: {acc_no}")
                else:
                    print(f"DEBUG: Filename too short to extract account: {filename}")
            except Exception as mail_err:
                print(f"EMAIL ERROR: {str(mail_err)}")
            # ----------------------------------


        return jsonify({
            'success': True, 
            'message': f'Successfully pushed {len(saved_files)} file(s)'
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Error saving files: {str(e)}'}), 500