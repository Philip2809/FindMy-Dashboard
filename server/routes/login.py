from flask import Blueprint, request, jsonify
import utils
import utils.login

login_blueprint = Blueprint('login', __name__)

# at any point in time, if any request failes due to auth the frontend will be sent a status that auth has failed
# if the creds are correct the status will include the different options for 2FA, the user can respond with the method they want to use
# the response to that will be to ask for the code, which the user will input
# the code will then be submitted to finish the login process, if all correct the user will be logged in

# register a new account
@login_blueprint.route('/', methods=['POST'])
def register_account():
    res = utils.login.start_new_login()

    return res.to_json()

# List 2FA methods
@login_blueprint.route('/2fa-method/<int:method_index>', methods=['POST'])
def create_tag(method_index: int):
    res = utils.login.get_2fa_code(method_index)
    
    return res.to_json()

# Submit 2FA code
@login_blueprint.route('/2fa-code/<string:code>', methods=['POST'])
def submit_2fa_code(code):
    res = utils.login.submit_2fa_code(code)
    
    return res.to_json()