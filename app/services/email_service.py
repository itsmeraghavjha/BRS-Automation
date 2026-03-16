import imaplib
import email
import os
import io
import zipfile
import datetime
import re
from email.header import decode_header
from app.services import parsing_service, mapping_service
from app.models import Mapping 
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


# --- EMAIL CONFIGURATION ---
EMAIL_ACCOUNT = "rpa@heritagefoods.in"  
EMAIL_PASSWORD = "glzd hhex fwdg bzbv"           
IMAP_SERVER = "imap.gmail.com"                 # Change this to your provider's IMAP server
SAP_FOLDER_PATH = r"C:/Users/raghavkumar.j/Desktop/demo"            

def clean_whitespace(text):
    """Collapses newlines, tabs, and multiple spaces into a single space for reliable matching."""
    if not text: return ""
    return " ".join(text.split()).lower()

def decode_mime_words(s):
    """Decodes email headers and strips out Google/Security warning tags."""
    if not s: return ""
    try:
        parts = decode_header(s)
        decoded_string = ""
        for word, encoding in parts:
            if isinstance(word, bytes):
                decoded_string += word.decode(encoding or 'utf-8', errors='ignore')
            else:
                decoded_string += str(word)
        # Remove [WARNING: ...] tags that break substring matching
        clean_s = re.sub(r'\[WARNING:.*?\]', '', decoded_string, flags=re.IGNORECASE).strip()
        return clean_s
    except Exception:
        return str(s)

def fetch_statements_dynamic(app):
    """Main background task to fetch and route bank statements based on DB rules."""
    print(f"[{datetime.datetime.now()}] Starting dynamic email fetch...")
    
    with app.app_context():
        routing_rules = Mapping.query.filter(Mapping.emailSender != None, Mapping.emailSender != '').all()
        if not routing_rules: 
            return
        
        # Group rules by sender to minimize IMAP overhead
        rules_by_sender = {}
        for rule in routing_rules:
            s = rule.emailSender.strip().lower()
            if s not in rules_by_sender: rules_by_sender[s] = []
            rules_by_sender[s].append(rule)
            
        try:
            mail = imaplib.IMAP4_SSL(IMAP_SERVER)
            mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
            mail.select("inbox")
            
            # Use 2 days lookback as a safety window
            search_date = (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%d-%b-%Y")
            
            for sender, rules in rules_by_sender.items():
                print(f"Scanning Inbox for Sender: {sender}")
                
                # Fetch mail from sender in the date range
                search_query = f'(FROM "{sender}" SINCE "{search_date}")'
                status, messages = mail.search(None, search_query)
                
                if status != "OK" or not messages[0]: continue 
                    
                email_ids = messages[0].split()
                for num in email_ids:
                    # --- ADDED: Skip if the message is already SEEN ---
                    status, resp = mail.fetch(num, "(FLAGS)")
                    if status == "OK" and '\\Seen' in str(resp[0]):
                        continue

                    status, data = mail.fetch(num, "(RFC822)")
                    for response_part in data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            
                            actual_subject = clean_whitespace(decode_mime_words(msg.get("Subject", "")))
                            
                            matching_rules = []
                            for r in rules:
                                rule_sub = clean_whitespace(r.emailSubject)
                                if not rule_sub or rule_sub in actual_subject:
                                    matching_rules.append(r)
                            
                            if not matching_rules:
                                print(f"  SKIPPING: Subject '{actual_subject}' did not match any database rules.")
                                continue 
                                
                            print(f"  MATCH FOUND: Processing '{actual_subject}'")
                            
                            if msg.is_multipart():
                                for part in msg.walk():
                                    if "attachment" in str(part.get("Content-Disposition")).lower():
                                        filename = part.get_filename()
                                        if filename:
                                            filename = decode_mime_words(filename)
                                            file_bytes = part.get_payload(decode=True)
                                            
                                            if filename.endswith('.zip'):
                                                extract_and_process_zip_keyring(app, file_bytes, filename, matching_rules)
                                            elif filename.endswith(('.csv', '.xls', '.xlsx')):
                                                raw_bank = matching_rules[0].bankName.lower() if matching_rules[0].bankName else "icici"
                                                bank_name = "hdfc" if "hdfc" in raw_bank else "icici"
                                                process_and_push_to_sap(file_bytes, filename, matching_rules[0].accountNo, bank_name)
                    
                    # Mark as seen so the next run ignores it
                    mail.store(num, '+FLAGS', '\\Seen')
            mail.logout()
        except Exception as e:
            print(f"Email Fetch Error: {str(e)}")

def extract_and_process_zip_keyring(app, zip_bytes, original_zip_name, rules):
    """Atomic Keyring: Resets everything on every attempt to prevent corruption."""
    try:
        # 1. Try No-Password (ICICI style)
        try:
            with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
                statement_filename = next((n for n in zf.namelist() if n.endswith(('.csv', '.xls', '.xlsx'))), None)
                if statement_filename:
                    extracted_bytes = zf.read(statement_filename)
                    print(f"    Unlocked {original_zip_name} (No password required).")
                    
                    target_rule = rules[0] 
                    for rule in rules:
                        if rule.accountNo in statement_filename or rule.accountNo in original_zip_name:
                            target_rule = rule
                            break
                            
                    raw_bank = target_rule.bankName.lower() if target_rule.bankName else "icici"
                    bank_name = "hdfc" if "hdfc" in raw_bank else "icici"
                    process_and_push_to_sap(extracted_bytes, statement_filename, target_rule.accountNo, bank_name)
                    return
        except (RuntimeError, zipfile.BadZipFile, zipfile.LargeZipFile):
            pass 

        # 2. Keyring Loop (HDFC style)
        # We find the filename in the zip once to avoid re-scanning
        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
            statement_filename = next((n for n in zf.namelist() if n.endswith(('.csv', '.xls', '.xlsx'))), None)
        
        if not statement_filename: return

        for rule in rules:
            raw_pw = str(rule.zipPassword).strip() if rule.zipPassword else ""
            if not raw_pw: continue
            
            # Try the password as provided
            passwords_to_try = [raw_pw]
            
            # If it's a number, try adding a leading zero if it's missing (Enterprise fix)
            if raw_pw.isdigit() and len(raw_pw) < 12:
                passwords_to_try.append(raw_pw.zfill(12)) # Try padding to 12 digits
                passwords_to_try.append("0" + raw_pw)     # Try adding single leading zero

            for pw in set(passwords_to_try):
                try:
                    # ATOMIC ATTEMPT: Fresh buffer and Fresh ZipFile every time
                    with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as fresh_zf:
                        fresh_zf.setpassword(pw.encode())
                        extracted_bytes = fresh_zf.read(statement_filename)
                    
                    print(f"    Unlocked {original_zip_name} using password for Account {rule.accountNo}")
                    
                    raw_bank = rule.bankName.lower() if rule.bankName else "icici"
                    bank_name = "hdfc" if "hdfc" in raw_bank else "icici"
                    process_and_push_to_sap(extracted_bytes, statement_filename, rule.accountNo, bank_name)
                    return 
                except Exception:
                    continue # Try next password variant or next rule
        
        print(f"    Error: Could not unlock {original_zip_name}. Checked {len(rules)} rule passwords.")
    except Exception as e:
        print(f"ZIP Keyring Total Failure for {original_zip_name}: {str(e)}")


def process_and_push_to_sap(file_bytes, filename, forced_account_no, bank_name):
    """Parses bank data and strictly enforces database mapping rules."""
    try:
        file_obj = io.BytesIO(file_bytes)
        file_obj.filename = filename 
        
        account_no, transactions_df = parsing_service.parse_file(bank_name, "mail", file_obj)
        processed_data_list = []
        
        # Determine if we should split a MULTI file or force a single account
        is_multi = (account_no == 'MULTI')
        
        if is_multi:
            if 'accountNo' not in transactions_df.columns:
                # If parser marked MULTI but column is missing, it's a single account in MULTI format
                is_multi = False
                account_no = forced_account_no
            else:
                grouped = transactions_df.groupby('accountNo')
                for acct, group_df in grouped:
                    # Clean the account number from the dataframe (remove 'Ac No: ' prefixes etc)
                    clean_acct = re.sub(r'[^0-9]', '', str(acct))
                    mapping_info = mapping_service.find_mapping_for_account(clean_acct)
                    
                    if not mapping_info: continue
                        
                    subset_processed = parsing_service.apply_business_rules(group_df, mapping_info)
                    for item in subset_processed:
                        item['accountNo'] = clean_acct 
                        processed_data_list.append(item)

        if not is_multi:
            if not account_no or account_no == 'Unknown' or account_no == 'MULTI':
                 account_no = forced_account_no

            # Clean forced_account_no as well
            clean_acct = re.sub(r'[^0-9]', '', str(account_no))
            mapping_info = mapping_service.find_mapping_for_account(clean_acct)
            
            if not mapping_info:
                print(f"      Skipping: No mapping found for Account {clean_acct}.")
                return

            processed_data_list = parsing_service.apply_business_rules(transactions_df, mapping_info)
            for item in processed_data_list:
                item['accountNo'] = clean_acct

        if not processed_data_list: return

        # SAP File Writing Logic
        headers = ["Company Code", "House Bank", "Statement Date", "Closing Bal", "Posting Rule", "Posting Date", "Amount", "Bank ref No", "Profit Center", "Cost Center"]
        groups = {}
        for d in processed_data_list:
            acc = d.get('accountNo', 'Unknown') 
            if acc not in groups: groups[acc] = []
            groups[acc].append([
                d.get('Company Code', ''), d.get('House Bank', ''), d.get('Statement Date', ''),
                d.get('Closing Bal', ''), d.get('Posting Rule', ''), d.get('Posting Date', ''),
                d.get('Amount', ''), d.get('Bank ref No', ''), d.get('Profit Center', ''), d.get('Cost Center', '')
            ])

        if not os.path.exists(SAP_FOLDER_PATH): os.makedirs(SAP_FOLDER_PATH)

        for accNo, rows in groups.items():
            row_strings = ["|".join(str(cell) for cell in row) + "|" for row in rows]
            header_string = "|".join(headers) + "|"
            file_content = header_string + "\n" + "\n".join(row_strings)
            
            date_str = datetime.datetime.now().strftime('%Y-%m-%d')
            sap_filename = f"Statement_{bank_name.upper()}_{accNo}_{date_str}.txt"
            with open(os.path.join(SAP_FOLDER_PATH, sap_filename), 'w', encoding='utf-8') as f:
                f.write(file_content)
            print(f"      SUCCESS: Pushed {sap_filename}")

            # --- NOTIFICATION STEP ---
            # Collect both files to send
            files_to_send = [
                (filename, file_bytes),          # Original file
                (sap_filename, file_content.encode('utf-8')) # SAP formatted file
            ]
            
            # --- Inside process_and_push_to_sap in email_service.py ---
            
            if mapping_info and mapping_info.get('email'):
                # Pass BOTH the original bank file and the new SAP file
                attachments = [
                    (filename, file_bytes), # The original file from the bank's email
                    (sap_filename, file_content.encode('utf-8')) # The newly created text file
                ]
                
                send_notification_email(
                    mapping_info['email'], 
                    accNo, 
                    bank_name, 
                    attachments
                )

    except Exception as e:
        import traceback
        print(f"Parse/Push Error for {filename}: {str(e)}")
        traceback.print_exc()



def send_notification_email(recipient_email, account_no, bank_name, attachments):
    """Sends a notification email with the original and processed files attached."""
    if not recipient_email:
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ACCOUNT
        # msg['To'] = recipient_email
        msg['To'] = 'raghavkumar.j@heritagefoods.in'
        msg['Subject'] = f"Automation Success: {bank_name} Account {account_no}"

        body = f"""
        Hello,
        
        The BRS Automation system has successfully processed a new statement.
        
        Bank: {bank_name.upper()}
        Account: {account_no}
        Timestamp: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        Please find the original statement and the SAP-formatted upload file attached.
        
        Regards,
        BRS Bot
        """
        msg.attach(MIMEText(body, 'plain'))

        # attachments is a list of tuples: (filename, file_bytes)
        for filename, data in attachments:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(data)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={filename}')
            msg.attach(part)

        # Connect and send
        with smtplib.SMTP(IMAP_SERVER.replace('imap', 'smtp'), 587) as server:
            server.starttls()
            server.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
            server.send_message(msg)
            
        print(f"      NOTIFIED: Email sent to {recipient_email}")
    except Exception as e:
        print(f"      Mail Error: Could not notify {recipient_email}. {str(e)}")