# # app/services/parsing_service.py
# import re
# import pandas as pd
# from app.parsers.bank_parsers import HDFCRetailParser, HDFCCorporateParser, ICICIRetailParser, ICICICorporateParser, BOBParser, KotakParser, UBIParser

# parsers = {
#     'hdfc': {'retail': HDFCRetailParser, 'corporate': HDFCCorporateParser},
#     'icici': {'retail': ICICIRetailParser, 'corporate': ICICICorporateParser},
#     'bob': BOBParser,
#     'kotak': KotakParser,
#     'ubi': UBIParser
# }

# def get_parser(bank_name, account_type, file):
#     """Selects the correct parser class based on dropdown selections."""
#     bank_entry = parsers.get(bank_name.lower())
#     if not bank_entry:
#         raise ValueError(f"No parser for bank: {bank_name}")

#     parser_class = bank_entry.get(account_type.lower()) if isinstance(bank_entry, dict) else bank_entry
#     if not parser_class:
#         raise ValueError(f"Invalid account type '{account_type}' for bank: {bank_name}")

#     return parser_class(file)

# def parse_file(bank_name, account_type, file):
#     """Main function to parse a file and return structured data."""
#     parser = get_parser(bank_name, account_type, file)
#     account_no, transactions_df = parser.parse()

#     if not account_no:
#         match = re.search(r'(\d{6,})', file.filename or '')
#         if match:
#             account_no = match.group(1)

#     return account_no, transactions_df

# def clean_value(value):
#     """Clean a value to return empty string instead of None, NaN, or other falsy values."""
#     if value is None or (isinstance(value, float) and pd.isna(value)):
#         return ''
#     value_str = str(value).strip()
#     if value_str.lower() in ['nan', 'none', 'nat']:
#         return ''
#     return value_str

# def apply_business_rules(transactions_df, mapping_info):
#     """Applies posting rules and other logic after parsing."""
#     processed = []
#     for _, row in transactions_df.iterrows():
#         withdrawal = float(row.get('withdrawal', 0.0))
#         deposit = float(row.get('deposit', 0.0))
#         if withdrawal == 0 and deposit == 0:
#             continue

#         profit_center = mapping_info.get('profitCenter', '') if mapping_info else ''
#         cost_center = ''

#         if deposit > 0:
#             posting_rule, amount = ('H001', deposit)
#         else:
#             posting_rule, amount = ('H002', -withdrawal)  # ADD NEGATIVE SIGN HERE

#         narration = str(row.get('narration', ''))
#         if 'charges' in narration.lower():
#             posting_rule = 'H005'
#             cost_center = f"{profit_center}comn" if profit_center else 'comn'
#             profit_center = ''
#             amount = -withdrawal  # ALSO NEGATIVE FOR CHARGES

#         date_val = pd.to_datetime(row.get('date'), errors='coerce', dayfirst=True)
#         date_str = '' if pd.isna(date_val) else date_val.strftime('%d.%m.%Y')

#         processed.append({
#             'postingRule': clean_value(posting_rule),
#             'date': clean_value(date_str),
#             'amount': f"{amount:.2f}",
#             'text': clean_value(narration),
#             'referenceId': clean_value(row.get('referenceId', '')),
#             'profitCenter': clean_value(profit_center),
#             'costCenter': clean_value(cost_center)
#         })
#     return processed




# app/services/parsing_service.py
import re
import pandas as pd
from app.parsers.bank_parsers import HDFCRetailParser, HDFCCorporateParser, ICICIRetailParser, ICICICorporateParser, BOBParser, KotakParser, UBIParser

parsers = {
    'hdfc': {'retail': HDFCRetailParser, 'corporate': HDFCCorporateParser},
    'icici': {'retail': ICICIRetailParser, 'corporate': ICICICorporateParser},
    'bob': BOBParser,
    'kotak': KotakParser,
    'ubi': UBIParser
}

def get_parser(bank_name, account_type, file):
    """Selects the correct parser class based on dropdown selections."""
    bank_entry = parsers.get(bank_name.lower())
    if not bank_entry:
        raise ValueError(f"No parser for bank: {bank_name}")

    parser_class = bank_entry.get(account_type.lower()) if isinstance(bank_entry, dict) else bank_entry
    if not parser_class:
        raise ValueError(f"Invalid account type '{account_type}' for bank: {bank_name}")

    return parser_class(file)

def parse_file(bank_name, account_type, file):
    """Main function to parse a file and return structured data."""
    parser = get_parser(bank_name, account_type, file)
    account_no, transactions_df = parser.parse()

    if not account_no:
        match = re.search(r'(\d{6,})', file.filename or '')
        if match:
            account_no = match.group(1)

    return account_no, transactions_df

def clean_value(value):
    """Clean a value to return empty string instead of None, NaN, or other falsy values."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ''
    value_str = str(value).strip()
    if value_str.lower() in ['nan', 'none', 'nat']:
        return ''
    return value_str

def apply_business_rules(transactions_df, mapping_info):
    """Applies posting rules and other logic after parsing."""
    processed = []
    for _, row in transactions_df.iterrows():
        withdrawal = float(row.get('withdrawal', 0.0))
        deposit = float(row.get('deposit', 0.0))
        if withdrawal == 0 and deposit == 0:
            continue

        profit_center = mapping_info.get('profitCenter', '') if mapping_info else ''
        cost_center = ''

        if deposit > 0:
            posting_rule, amount = ('H001', deposit)
        else:
            posting_rule, amount = ('H002', -withdrawal)  # ADD NEGATIVE SIGN HERE

        narration = str(row.get('narration', ''))
        if 'charges' in narration.lower():
            posting_rule = 'H005'
            cost_center = f"{profit_center}comn" if profit_center else 'comn'
            profit_center = ''
            amount = -withdrawal  # ALSO NEGATIVE FOR CHARGES

        date_val = pd.to_datetime(row.get('date'), errors='coerce', dayfirst=True)
        # --- THIS IS THE CHANGE ---
        date_str = '' if pd.isna(date_val) else date_val.strftime('%d.%m.%Y')
        # --------------------------

        processed.append({
            'postingRule': clean_value(posting_rule),
            'date': clean_value(date_str),
            'amount': f"{amount:.2f}",
            'text': clean_value(narration),
            'referenceId': clean_value(row.get('referenceId', '')),
            'profitCenter': clean_value(profit_center),
            'costCenter': clean_value(cost_center)
        })
    return processed