from app import db
# from app.models import Mapping # <-- REMOVED

def get_all_mappings():
    """Returns a list of all mappings as dictionaries."""
    from app.models import Mapping # <-- NEW: Import inside function
    mappings = Mapping.query.order_by(Mapping.accountNo).all()
    return [m.to_dict() for m in mappings]

def find_mapping_for_account(account_no):
    """Finds a single mapping by account number."""
    from app.models import Mapping # <-- NEW: Import inside function
    if not account_no:
        return None
    
    # Normalize the account number - convert to string and strip whitespace
    account_no_str = str(account_no).strip()
    
    # Try exact match first
    mapping = Mapping.query.filter_by(accountNo=account_no_str).first()
    
    # If no exact match, try without leading zeros
    if not mapping:
        account_no_stripped = account_no_str.lstrip('0')
        if account_no_stripped:
            # Search for any account that matches when leading zeros are removed
            all_mappings = Mapping.query.all()
            for m in all_mappings:
                if str(m.accountNo).lstrip('0') == account_no_stripped:
                    mapping = m
                    break
    
    return mapping.to_dict() if mapping else None

def add_mapping(data):
    """Adds a new mapping to the database."""
    from app.models import Mapping # <-- NEW: Import inside function
    account_no = data.get('accountNo')
    if not account_no:
        raise ValueError("Account number is required.")

    # Normalize account number
    account_no = str(account_no).strip()

    if Mapping.query.filter_by(accountNo=account_no).first():
        raise ValueError("This account number already exists.")

    new_mapping = Mapping(
        accountNo=account_no,
        profitCenter=data.get('profitCenter', ''),
        branchName=data.get('branchName', ''),
        owner=data.get('owner', ''),
        # Hidden fields are passed as empty strings if not present in payload:
        costCenter=data.get('costCenter', ''), 
        email=data.get('email', ''), 
        # Required fields:
        houseBank=data.get('houseBank', ''),
        bankGL=data.get('bankGL', ''),
        bankName=data.get('bankName', '')
    )
    db.session.add(new_mapping)
    db.session.commit()

def update_mapping(mapping_id, data):
    """Updates an existing mapping identified by its ID."""
    from app.models import Mapping # <-- NEW: Import inside function
    mapping_to_update = Mapping.query.get(mapping_id)
    if not mapping_to_update:
        raise ValueError("Mapping not found.")

    new_account_no = data.get('accountNo')
    if new_account_no and new_account_no != mapping_to_update.accountNo:
        new_account_no = str(new_account_no).strip()
        if Mapping.query.filter_by(accountNo=new_account_no).filter(Mapping.id != mapping_id).first():
            raise ValueError(f"Account number '{new_account_no}' already exists.")
        mapping_to_update.accountNo = new_account_no

    # Update all fields based on keys available in data
    mapping_to_update.profitCenter = data.get('profitCenter', mapping_to_update.profitCenter)
    mapping_to_update.branchName = data.get('branchName', mapping_to_update.branchName)
    mapping_to_update.owner = data.get('owner', mapping_to_update.owner)
    
    # Required new fields
    mapping_to_update.houseBank = data.get('houseBank', mapping_to_update.houseBank)
    mapping_to_update.bankGL = data.get('bankGL', mapping_to_update.bankGL)
    mapping_to_update.bankName = data.get('bankName', mapping_to_update.bankName)
    
    # Hidden fields must also be updated if they exist in the incoming data (which they will as hidden fields in the form)
    mapping_to_update.costCenter = data.get('costCenter', mapping_to_update.costCenter)
    mapping_to_update.email = data.get('email', mapping_to_update.email)
    
    db.session.commit()

def delete_mapping(mapping_id):
    """Deletes a mapping by its ID."""
    from app.models import Mapping # <-- NEW: Import inside function
    mapping_to_delete = Mapping.query.get(mapping_id)
    if not mapping_to_delete:
        raise ValueError("Mapping not found.")
    
    db.session.delete(mapping_to_delete)
    db.session.commit()