# app/parsers/bank_parsers.py

import re
import pandas as pd
from abc import ABC, abstractmethod

# --- Helper function for post-header processing (used by standard parsers) ---
def process_data_frame(df, header_row_index, index_to_std_name):
    """
    Standardizes column names using the index map (index_to_std_name).
    This logic handles duplicate column names (like 'Dr / Cr') by performing 
    a positional rename, guaranteeing that the FIRST matched column is renamed 
    to the standard name (e.g., 'type').
    """
    
    # 1. Set the header row as the new column labels for the entire DataFrame
    df.columns = df.iloc[header_row_index]
    # 2. Keep only the data rows below the header
    data_df = df.iloc[header_row_index + 1:].copy()
    
    # 3. Get the current column labels after setting the header row
    current_column_labels = data_df.columns.tolist() 
    
    # 4. Apply standard names only to the specific column index found
    new_columns = current_column_labels[:]
    for col_idx, std_name in index_to_std_name.items():
        if col_idx < len(new_columns):
             # Directly assign the standard name to the column label list at the target index
            new_columns[col_idx] = std_name

    data_df.columns = new_columns
    data_df.reset_index(drop=True, inplace=True)
    return data_df


# --- Base Parser Class ---
class StatementParser(ABC):
    """Abstract base class for all bank statement parsers."""
    def __init__(self, file):
        self.file = file
        filename = getattr(file, 'filename', '') or ''
        filename = filename.lower()
        file.seek(0)
        try:
            if filename.endswith(('.xlsx', '.xls')):
                engine = 'openpyxl' if filename.endswith('.xlsx') else 'xlrd'
                self.df = pd.read_excel(file, header=None, engine=engine)
            elif filename.endswith('.csv'):
                self.df = pd.read_csv(file, header=None, on_bad_lines='skip', encoding='latin1')
            else: # Fallback for unknown extensions
                try:
                    self.df = pd.read_excel(file, header=None, engine='openpyxl')
                except Exception:
                    file.seek(0)
                    self.df = pd.read_csv(file, header=None, on_bad_lines='skip', encoding='latin1')
        except Exception as e:
            raise ValueError(f"Failed to read file. It might be corrupted or in an unsupported format. Error: {e}")

        if not isinstance(self.df, pd.DataFrame):
            raise ValueError("Uploaded file could not be parsed into a DataFrame.")

    @abstractmethod
    def parse(self):
        """Main parsing method to be implemented by each bank."""
        pass

    # MODIFIED: Returns a map of {column_index: 'standard_name'} and enforces first match
    def find_header_row(self, keywords, min_matches=3, search_rows=25):
        """Finds the row number of the header and returns a map from column index to standardized name."""
        norm_keywords = {k: [p.lower() for p in v] for k, v in keywords.items()}
        max_row = min(len(self.df), search_rows)
        for i in range(max_row):
            row = self.df.iloc[i]
            found_std_names = set()
            index_to_std_name = {}
            
            # Iterate through cells using column index (col_idx)
            for col_idx, cell in enumerate(row):
                cell_str = str(cell).strip()
                cell_str_lower = cell_str.lower()
                if not cell_str_lower:
                    continue
                for std_name, potentials in norm_keywords.items():
                    # If we've already found a column for this standardized name, skip (FIRST MATCH WINS)
                    if std_name in found_std_names: continue 
                    
                    for pot in potentials:
                        if pot in cell_str_lower:
                            found_std_names.add(std_name)
                            # Store the column index (col_idx) mapped to the standard name
                            index_to_std_name[col_idx] = std_name
                            break # Move to next std_name if found
            
            if len(found_std_names) >= min_matches:
                # Returns the row index and the map of {index: standard_name}
                return i, index_to_std_name
        return -1, {}


    def clean_amount(self, value):
        if value is None: return 0.0
        s_value = str(value).strip()
        if not s_value: return 0.0
        s_value = s_value.replace(',', '').replace('₹', '').replace('rs.', '').replace('Rs.', '')
        s_value = s_value.replace('(', '-').replace(')', '')
        try:
            num = pd.to_numeric(s_value, errors='coerce')
            return 0.0 if pd.isna(num) else float(num)
        except Exception:
            return 0.0


# --- HDFC Parsers ---
class HDFCRetailParser(StatementParser):
    def parse(self):
        account_no = None
        for _, row in self.df.head(30).iterrows():
            row_str = ' '.join(str(cell).strip() for cell in row.dropna())
            match = re.search(r'Account No\s*:\s*(\d+)', row_str, re.IGNORECASE)
            if match:
                account_no = match.group(1)
                break

        header_keywords = {
            'date': ['date'], 'narration': ['narration', 'description'],
            'referenceId': ['chq', 'ref no'], 'withdrawal': ['withdrawal amt', 'debit'], 'deposit': ['deposit amt', 'credit']
        }
        header_row_index, index_to_std_name = self.find_header_row(header_keywords, min_matches=4, search_rows=30)
        if header_row_index == -1:
            raise ValueError("HDFC Retail header not found.")

        # UPDATED: Use helper function
        data_df = process_data_frame(self.df, header_row_index, index_to_std_name)
        
        transactions_list = []
        for _, row in data_df.iterrows():
            if 'statement summary' in ' '.join(str(cell).strip().lower() for cell in row.dropna()):
                break
            if pd.isna(row.get('date')) and pd.notna(row.get('narration')):
                if transactions_list:
                    transactions_list[-1]['narration'] += ' ' + str(row['narration']).strip()
                continue
            withdrawal = self.clean_amount(row.get('withdrawal'))
            deposit = self.clean_amount(row.get('deposit'))
            if pd.notna(row.get('date')) and (withdrawal > 0 or deposit > 0):
                transactions_list.append({
                    'date': row.get('date'),
                    'narration': str(row.get('narration', '')).strip(),
                    'withdrawal': withdrawal,
                    'deposit': deposit,
                    'referenceId': row.get('referenceId', '')
                })
        return account_no, pd.DataFrame(transactions_list)

class HDFCCorporateParser(StatementParser):
    # RESTORED CUSTOM __init__ to handle poorly formatted CSV/TXT files
    def __init__(self, file):
        # Read file content as text
        self.file = file
        self.file.seek(0)
        try:
            content = self.file.read().decode('utf-8', errors='ignore')
        except AttributeError:
             self.file.seek(0)
             content = self.file.read().decode('utf-8', errors='ignore')

        self.lines = [line.strip() for line in content.splitlines()]
        self.file.seek(0)

        # Build DataFrame from lines
        data_rows = []
        for line in self.lines:
            if not line:
                continue
            fields = [f.strip() for f in line.split(',')]
            data_rows.append(fields)
        
        # Pad rows to consistent length
        max_cols = 7
        padded_rows = []
        for row in data_rows:
            padded = row + [pd.NA] * (max_cols - len(row))
            padded_rows.append(padded[:max_cols])
        
        self.df = pd.DataFrame(padded_rows)
        if not isinstance(self.df, pd.DataFrame):
            raise ValueError("Uploaded file could not be parsed into a DataFrame.")


    def parse(self):
        # Extract account number from text lines
        account_no = None
        for i, line in enumerate(self.lines[:50]):
            match = re.search(r'Account No\s*[:\s]*(\d+)', line, re.IGNORECASE)
            if match:
                account_no = match.group(1)
                break
        
        if not account_no:
            # Fallback to filename
            filename = getattr(self.file, 'filename', '') or ''
            match = re.search(r'(\d{6,})', filename)
            account_no = match.group(1) if match else None

        # Find header row
        header_keywords_list = ['Transaction Date', 'Description', 'Amount', 'C.D.Falg', 'Reference No']
        header_row_index = -1
        
        for i in range(min(50, len(self.df))):
            row = self.df.iloc[i]
            row_strs = [str(cell).strip().lower() for cell in row if pd.notna(cell) and str(cell).strip()]
            
            if not row_strs:
                continue
            
            matches = [kw.lower() for kw in header_keywords_list if any(kw.lower() in val for val in row_strs)]

            if len(matches) >= 4:
                header_row_index = i
                break

        if header_row_index == -1:
            raise ValueError("Could not find header row in HDFC Corporate statement")
        
        # Set columns and extract data
        self.df.columns = self.df.iloc[header_row_index].astype(str)
        data_df = self.df.iloc[header_row_index + 1:].copy().reset_index(drop=True)
        
        # Filter out invalid rows (keep original logic)
        data_df = data_df[data_df.apply(lambda row: row.astype(str).str.strip().ne('nan').sum() >= 4, axis=1)]
        
        # Rename columns (keep original hardcoded rename logic as it's specific to HDFC Corporate)
        data_df.columns = [str(col).strip() for col in data_df.columns]
        data_df.rename(columns={
            'Transaction Date': 'date',
            'Description': 'narration',
            'Amount': 'amount',
            'C.D.Falg': 'type',
            'Reference No': 'referenceId'
        }, inplace=True)
        
        transactions_list = []
        for _, row in data_df.iterrows():
            date_str = str(row.get('date', '')).strip()
            narration = str(row.get('narration', '')).strip()
            amount_str = str(row.get('amount', '')).strip()
            tx_type = str(row.get('type', '')).strip().upper()
            ref_id = str(row.get('referenceId', '')).strip()
            
            amount = self.clean_amount(amount_str)
            if amount == 0:
                continue
            
            # Parse date (handle time suffix)
            try:
                if ' ' in date_str:
                    date_str = date_str.split(' ')[0]
                # Assuming format is %d/%m/%Y based on common corporate format
                date_obj = pd.to_datetime(date_str, format='%d/%m/%Y', errors='coerce')
                date = date_obj if not pd.isna(date_obj) else ''
            except Exception:
                date = ''
            
            if not date:
                continue
            
            # Convert C/D to withdrawal/deposit
            withdrawal = amount if tx_type == 'D' else 0.0
            deposit = amount if tx_type == 'C' else 0.0
            
            # Skip summary rows
            if any(word in narration.lower() for word in ['total', 'balance', 'grand', 'closing']):
                break
            
            transactions_list.append({
                'date': date,
                'narration': narration,
                'withdrawal': withdrawal,
                'deposit': deposit,
                'referenceId': ref_id
            })
        
        transactions_df = pd.DataFrame(transactions_list)
        return account_no, transactions_df

    # Overridden clean_amount for corporate parser to avoid re-implementing it in base class
    def clean_amount(self, value):
        if value is None: return 0.0
        s_value = str(value).strip()
        if not s_value: return 0.0
        s_value = s_value.replace(',', '').replace('₹', '').replace('rs.', '').replace('Rs.', '')
        s_value = s_value.replace('(', '-').replace(')', '')
        try:
            num = pd.to_numeric(s_value, errors='coerce')
            return 0.0 if pd.isna(num) else float(num)
        except Exception:
            return 0.0


# --- ICICI Parsers ---
class ICICIRetailParser(StatementParser):
    def parse(self):
        account_no = None
        for _, row in self.df.head(20).iterrows():
            row_str = ' '.join(str(cell).strip() for cell in row.dropna())
            match = re.search(r'Transactions List.*?-.*?(\d+)', row_str, re.IGNORECASE)
            if match:
                account_no = match.group(1)
                break

        header_keywords = {
            'date': ['value date'], 'narration': ['description'],
            'referenceId': ['transaction id', 'chequeno.'], 'amount': ['transaction amount'], 'type': ['cr/dr']
        }
        header_row_index, index_to_std_name = self.find_header_row(header_keywords, min_matches=4)
        if header_row_index == -1:
            raise ValueError("ICICI Retail header not found for the new format.")

        # UPDATED: Use helper function
        data_df = process_data_frame(self.df, header_row_index, index_to_std_name)

        transactions_list = []
        for _, row in data_df.iterrows():
            if row.isna().all() or (pd.isna(row.get('date')) and pd.isna(row.get('amount'))):
                continue

            amount = self.clean_amount(row.get('amount'))
            tx_type = str(row.get('type', '')).strip().lower()

            if amount > 0:
                is_debit = 'dr' in tx_type
                is_credit = 'cr' in tx_type
                transactions_list.append({
                    'date': row.get('date'),
                    'narration': str(row.get('narration', '')).strip(),
                    'withdrawal': amount if is_debit else 0.0,
                    'deposit': amount if is_credit else 0.0,
                    'referenceId': str(row.get('referenceId', '')).strip()
                })
        return account_no, pd.DataFrame(transactions_list)

class ICICICorporateParser(ICICIRetailParser): # Corporate is same as Retail for ICICI
    pass

# --- Other Parsers ---
class BOBParser(StatementParser):
    def parse(self):
        account_no = None
        for _, row in self.df.head(30).iterrows():
            row_str = ' '.join(str(cell).strip() for cell in row.dropna())
            match = re.search(r'Account No:.*?\s*(\S+)', row_str, re.IGNORECASE)
            if match:
                account_no = match.group(1)
                break

        header_keywords = {
            'date': ['txn date', 'transaction date', 'date'], 'narration': ['description', 'particulars', 'narration'],
            'referenceId': ['reference', 'ref no', 'ref', 'chq.no.'],
            'withdrawal': ['debit', 'withdrawal'], 'deposit': ['credit', 'deposit']
        }
        header_row_index, index_to_std_name = self.find_header_row(header_keywords, min_matches=3)
        if header_row_index == -1:
            raise ValueError("Bank of Baroda header not found.")

        # UPDATED: Use helper function
        data_df = process_data_frame(self.df, header_row_index, index_to_std_name)

        transactions_list = []
        for _, row in data_df.iterrows():
            if row.isna().all() or pd.isna(row.get('date')):
                continue
            withdrawal = self.clean_amount(row.get('withdrawal'))
            deposit = self.clean_amount(row.get('deposit'))
            if withdrawal > 0 or deposit > 0:
                transactions_list.append({
                    'date': row.get('date'),
                    'narration': str(row.get('narration', '')).strip(),
                    'withdrawal': withdrawal,
                    'deposit': deposit,
                    'referenceId': row.get('referenceId', '')
                })
        return account_no, pd.DataFrame(transactions_list)

class KotakParser(StatementParser):
    def parse(self):
        account_no = None
        for _, row in self.df.head(20).iterrows():
            row_str = ' '.join(str(cell).strip() for cell in row.dropna())
            match = re.search(r'Account No\.?[\s,]*(\d+)', row_str, re.IGNORECASE)
            if match:
                account_no = match.group(1)
                break

        header_keywords = {
            'date': ['date'], 'narration': ['description'],
            'referenceId': ['chq / ref number', 'ref number'], 'amount': ['amount'], 'type': ['dr / cr']
        }
        # The index-based mapping guarantees the FIRST 'dr / cr' column is chosen
        header_row_index, index_to_std_name = self.find_header_row(header_keywords, min_matches=4)
        if header_row_index == -1:
            raise ValueError("Kotak header not found.")

        # UPDATED: Use helper function to apply index-based renaming
        data_df = process_data_frame(self.df, header_row_index, index_to_std_name)
        
        transactions_list = []
        for _, row in data_df.iterrows():
            if row.isna().all() or (pd.isna(row.get('date')) and pd.isna(row.get('amount'))):
                continue
            amount = self.clean_amount(row.get('amount'))
            # Accesses the column which was mapped to 'type', GUARANTEED to be the FIRST 'Dr / Cr' column.
            tx_type = str(row.get('type', '')).strip().lower() 
            if amount > 0:
                is_debit = 'dr' in tx_type
                is_credit = 'cr' in tx_type
                transactions_list.append({
                    'date': row.get('date'),
                    'narration': str(row.get('narration', '')).strip(),
                    'withdrawal': amount if is_debit else 0.0,
                    'deposit': amount if is_credit else 0.0,
                    'referenceId': str(row.get('referenceId', '')).strip()
                })
        return account_no, pd.DataFrame(transactions_list)

class UBIParser(StatementParser):
    def parse(self):
        account_no = None
        for _, row in self.df.head(20).iterrows():
            row_str = ' '.join(str(cell).strip() for cell in row.dropna())
            match = re.search(r'(?:A/C\s*Number|A/c\s*No|Account\s*Number)[\s:.]*(\d[\d\s-]*\d)', row_str, re.IGNORECASE)
            if match:
                account_no = match.group(1).replace(" ", "").replace("-", "")
                break

        header_keywords = {
            'date': ['tran date', 'date'], 'narration': ['description', 'remarks', 'particulars'],
            'referenceId': ['ref no', 'cheque no', 'tran id', 'reference'],
            'withdrawal': ['withdrawals', 'debit'], 'deposit': ['deposits', 'credit']
        }
        header_row_index, index_to_std_name = self.find_header_row(header_keywords, min_matches=3)
        if header_row_index == -1:
            raise ValueError("UBI header not found.")

        # UPDATED: Use helper function
        data_df = process_data_frame(self.df, header_row_index, index_to_std_name)

        transactions_list = []
        for _, row in data_df.iterrows():
            if row.isna().all() or pd.isna(row.get('date')):
                continue
            withdrawal = self.clean_amount(row.get('withdrawal'))
            deposit = self.clean_amount(row.get('deposit'))
            if withdrawal > 0 or deposit > 0:
                transactions_list.append({
                    'date': row.get('date'),
                    'narration': str(row.get('narration', '')).strip(),
                    'withdrawal': withdrawal,
                    'deposit': deposit,
                    'referenceId': row.get('referenceId', '')
                })
        return account_no, pd.DataFrame(transactions_list)

# --- Placeholder Parsers ---
class SBIParser(StatementParser):
    def parse(self):
        raise NotImplementedError("Parser for SBI is not implemented yet.")

class AxisParser(StatementParser):
    def parse(self):
        raise NotImplementedError("Parser for Axis is not implemented yet.")
