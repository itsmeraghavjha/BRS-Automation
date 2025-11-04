# app/mappings/routes.py
from flask import Blueprint, jsonify, request
from app.models import Mapping
from app.services import mapping_service
from flask_login import login_required, current_user

mappings_bp = Blueprint('mappings', __name__)

@mappings_bp.route('/', methods=['GET'])
def get_mappings():
    """Public route to get all mappings."""
    try:
        mappings = mapping_service.get_all_mappings()
        return jsonify(mappings)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mappings_bp.route('/<int:mapping_id>', methods=['GET'])
@login_required
def get_mapping(mapping_id):
    """Admin-only route to get a single mapping by its ID."""
    if current_user.role != 'admin':
        return jsonify({'success': False, 'error': 'Admin access required.'}), 403
    
    mapping = Mapping.query.get_or_404(mapping_id)
    return jsonify(mapping.to_dict())

@mappings_bp.route('/add', methods=['POST'])
@login_required
def add_mapping():
    """Admin-only route to add a new mapping."""
    if current_user.role != 'admin':
        return jsonify({'success': False, 'error': 'Admin access required.'}), 403

    try:
        data = request.json
        mapping_service.add_mapping(data)
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': f'An internal error occurred: {e}'}), 500

@mappings_bp.route('/update/<int:mapping_id>', methods=['POST'])
@login_required
def update_mapping(mapping_id):
    """Admin-only route to update a mapping."""
    if current_user.role != 'admin':
        return jsonify({'success': False, 'error': 'Admin access required.'}), 403

    try:
        data = request.json
        mapping_service.update_mapping(mapping_id, data)
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': f'An internal error occurred: {e}'}), 500

@mappings_bp.route('/delete/<int:mapping_id>', methods=['POST'])
@login_required
def delete_mapping(mapping_id):
    """Admin-only route to delete a mapping."""
    if current_user.role != 'admin':
        return jsonify({'success': False, 'error': 'Admin access required.'}), 403

    try:
        mapping_service.delete_mapping(mapping_id)
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': f'An internal error occurred: {e}'}), 500