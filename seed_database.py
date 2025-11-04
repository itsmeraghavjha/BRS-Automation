# seed_database.py
import pandas as pd
import os
import re
from app import create_app, db
from app.models import Mapping

# --- Configuration ---
# IMPORTANT: Updated to reference the new Excel file path based on your conversation.
# If your file is named differently, please change this variable.
EXCEL_FILE_PATH = 'new mapping.xlsx'
# ---------------------

def normalize_header(header):
    """Cleans up header strings by removing newlines, extra spaces, and stripping whitespace."""
    if not isinstance(header, str):
        return ''
    # FIX: Use regex to remove all non-alphanumeric characters and spaces aggressively for robust matching
    # This converts "SAP P C & G L" -> "sappcgl" and "H B ID" -> "hbid", etc., forcing a match.
    return re.sub(r'[\s\W_]+', '', header.strip().lower())

def find_header_row(df):
    """
    Finds the row number of the header in the Excel file by checking for key column names.
    """
    # Normalized search keywords (spaces and symbols removed)
    header_keywords_raw = [
        'accountno', 'bankaccountno', 'location', 'bankbranchname', 
        'emailid', 'owner', 'bankaccountno', 
        'hbid', 'sap pc & gl', 'locationname&bank'
    ]
    # Normalizing the search targets using the same aggressive normalization
    header_keywords = [normalize_header(k) for k in header_keywords_raw]
    
    for i, row in df.head(15).iterrows(): # Search up to 15 rows deep
        found_matches = set()
        for cell in row.dropna():
            # Normalize cell content and search for keyword matches
            normalized_cell = normalize_header(str(cell))
            for keyword in header_keywords:
                if keyword in normalized_cell:
                    found_matches.add(keyword)
        
        # Check if the row contains enough unique relevant keywords
        if len(found_matches) >= 3:
            return i
            
    return -1 # Return -1 if no header is found

def seed_data():
    """
    Reads data from an Excel file and populates the Mapping table in the database.
    """
    app = create_app()
    with app.app_context():
        if not os.path.exists(EXCEL_FILE_PATH):
            print(f"Error: The file '{EXCEL_FILE_PATH}' was not found.")
            print("Please make sure the Excel file is in the same directory as this script.")
            return

        print(f"Reading data from '{EXCEL_FILE_PATH}'...")
        try:
            # First, read the file without a header to find where the real header is
            temp_df = pd.read_excel(EXCEL_FILE_PATH, header=None, engine='openpyxl')
            header_row = find_header_row(temp_df)

            if header_row == -1:
                print("Error: Could not find a valid header row in the Excel file.")
                print("Please ensure the header contains expected keywords like 'Bank Account No.'.")
                return

            # Now, read the Excel file properly, using the correct header row
            df = pd.read_excel(EXCEL_FILE_PATH, header=header_row, engine='openpyxl')
            df.fillna('', inplace=True)
            print(f"Found {len(df)} rows to import.")

        except Exception as e:
            print(f"Error reading or processing the Excel file: {e}")
            return
            
        # --- Database Seeding ---
        imported_count = 0
        skipped_count = 0
        
        # --- UPDATED COLUMN MAPPING FOR NEW EXCEL FORMAT ---
        # Map normalized Excel header strings (keys) to DB attributes (values)
        expected_mappings = {
            # Normalized Excel Name -> DB Field
            'bankaccountno': 'accountNo',  
            'location': 'profitCenter',     
            'bankbranchname': 'branchName', 
            'owner': 'owner',
            'hbid': 'houseBank',          
            'sappcgl': 'bankGL',            # Aggressively normalized 'SAP P C & G L'
            'locationnamebank': 'bankName', # Aggressively normalized 'LOCATION NAME & BANK'
            'name': 'costCenter',           
            'emailid': 'email',
        }
        
        column_map = {}
        for col in df.columns:
            # Normalize every column header found in the DataFrame
            normalized_col = normalize_header(str(col))
            
            # Find a match in the expected mappings
            for expected_excel_norm, db_field in expected_mappings.items():
                if normalized_col == expected_excel_norm:
                    # Map the actual column string (the key) to the target DB field (the value)
                    column_map[col] = db_field
                    break
        
        # Rename the columns in the DataFrame using the reliable mapping
        df.rename(columns=column_map, inplace=True)

        for index, row in df.iterrows():
            # Accessing data using the guaranteed DB field name ('accountNo', 'houseBank', etc.)
            account_no = str(row.get('accountNo', '')).strip()

            if not account_no:
                skipped_count += 1
                continue

            existing_mapping = Mapping.query.filter_by(accountNo=account_no).first()

            if existing_mapping:
                # print(f"Skipping existing account number: {account_no}")
                skipped_count += 1
                continue

            new_mapping = Mapping(
                accountNo=account_no,
                profitCenter=str(row.get('profitCenter', '')).strip(),
                branchName=str(row.get('branchName', '')).strip(),
                owner=str(row.get('owner', '')).strip(),
                
                # Fields that might be empty if the header wasn't matched perfectly, 
                # but now use the standardized names:
                costCenter=str(row.get('costCenter', '')).strip(), 
                email=str(row.get('email', '')).strip(),
                
                houseBank=str(row.get('houseBank', '')).strip(),
                bankGL=str(row.get('bankGL', '')).strip(),
                bankName=str(row.get('bankName', '')).strip()
            )
            
            db.session.add(new_mapping)
            imported_count += 1

        if imported_count > 0:
            print(f"Committing {imported_count} new records to the database...")
            db.session.commit()
            print("Successfully committed changes.")
        else:
            print("No new records to import.")

        print("\n--- Seeding Complete ---")
        print(f"Successfully imported: {imported_count} records")
        print(f"Skipped (already exist or invalid): {skipped_count} records")


if __name__ == '__main__':
    seed_data()
