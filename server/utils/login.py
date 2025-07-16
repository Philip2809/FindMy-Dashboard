from enum import Enum
import json
import os
from pathlib import Path
from flask import jsonify

from findmy.reports import (
    AppleAccount,
    BaseAnisetteProvider,
    LoginState,
    SmsSecondFactorMethod,
    TrustedDeviceSecondFactorMethod,
    RemoteAnisetteProvider
)

from findmy.reports.twofactor import SyncSecondFactorMethod

ANISETTE_URL = os.getenv("ANISETTE_SERVER")
ANISETTE = RemoteAnisetteProvider(ANISETTE_URL)

ACCOUNT_STORE = Path("apple_creds.json")

class TwoFAState(Enum):
    """Represents the state of the account setup process."""
    UNINITIATED = 0
    PICK_METHOD = 1
    SUBMIT_CODE = 2

twofa_state = TwoFAState.UNINITIATED
twofa_methods = None
twofa_method = None


class ClientAction:
    """Exception raised when account-related operations succeed."""
    def __init__(self, action: str, http_code: int = 200, data: dict = None):
        self.action = action
        self.http_code = http_code
        self.data = data if data is not None else {}
    
    def to_json(self):
        """Returns the success message."""
        return jsonify({
            "action": {
                "type": self.action,
                "payload": self.data
            }
        }), self.http_code

class ShowMessage(ClientAction):
    """Represents an error to be shown to the user."""
    def __init__(self, message: str, http_code):
        super().__init__("dialogs.message", http_code)
        self.data = {
            "message": message,
        }

class Pick2FAMethod(ClientAction):
    """Represents the different 2FA methods available to the user."""
    def __init__(self, methods: list[str]):
        super().__init__("dialogs.2fa-methods")
        self.data = {
            "methods": methods,
        }

class Enter2FACode(ClientAction):
    """Represents a request for the user to enter their 2FA code."""
    def __init__(self):
        super().__init__("dialogs.2fa-code")


def get_2fa_methods(methods: list[SyncSecondFactorMethod]):
    """Returns a list of 2FA methods as strings."""
    if not methods:
        return []

    return [
        "Trusted Device" if isinstance(method, TrustedDeviceSecondFactorMethod)
        else f"SMS ({method.phone_number})" if isinstance(method, SmsSecondFactorMethod)
        else f"Unknown"
        for method in methods
    ]


def get_current_2fa_state() -> ClientAction:
    if twofa_state == TwoFAState.UNINITIATED:
        return ShowMessage("No 2FA process initiated", 400)
    elif twofa_state == TwoFAState.PICK_METHOD:
        return Pick2FAMethod(get_2fa_methods(twofa_methods))
    elif twofa_state == TwoFAState.SUBMIT_CODE:
        return Enter2FACode()

def start_new_login() -> ClientAction:
    """Starts a new login process, returns the available 2FA methods if 2FA is required."""
    global twofa_methods, twofa_state

    if twofa_state is not TwoFAState.UNINITIATED:
        return get_current_2fa_state()

    account = AppleAccount(ANISETTE)
    email = os.getenv("APPLE_EMAIL")
    password = os.getenv("APPLE_PASSWORD")

    try:
        account_state = account.login(email, password)
    except:
        return ShowMessage("Login to your apple account has failed. Please check your credentials.", 401)

    if account_state == LoginState.REQUIRE_2FA:
        try:
            twofa_methods = account.get_2fa_methods()
        except:
            return ShowMessage("Failed to retrieve 2FA methods.", 500)

        twofa_state = TwoFAState.PICK_METHOD
        return Pick2FAMethod(get_2fa_methods(twofa_methods))
    
    # No 2FA required, login successful
    twofa_state = TwoFAState.UNINITIATED
    return ShowMessage("Login successful.", 200)


def get_2fa_code(method_index: int):
    """Submits the 2FA code for the selected method."""
    global twofa_methods, twofa_method, twofa_state

    if twofa_state != TwoFAState.PICK_METHOD:
        return ShowMessage("2FA process not initiated or already completed.", 400)

    twofa_method = twofa_methods[method_index]
    if not isinstance(twofa_method, SyncSecondFactorMethod):
        return ShowMessage("Selected method is not a valid 2FA method.", 400)

    try:
        twofa_method.request()
    except:
        return ShowMessage("Failed to request 2FA code.", 500)
    
    twofa_state = TwoFAState.SUBMIT_CODE
    return Enter2FACode()

def submit_2fa_code(code: str):
    """Submits the 2FA code to complete the login process."""
    global twofa_methods, twofa_method, twofa_state

    if twofa_state != TwoFAState.SUBMIT_CODE:
        return ShowMessage("2FA process not initiated or already completed.", 400)

    try:
        twofa_method.submit(code)
    except:
        return ShowMessage("Failed to submit code; most likely the code was typed wrong", 400)

    try:
        # Save the account state after successful login
        with ACCOUNT_STORE.open("w+") as f:
            json.dump(twofa_method.account.export(), f)
    except:
        return ShowMessage("Failed to save account state after successful login.", 500)

    # Reset state after successful login
    twofa_state = TwoFAState.UNINITIATED
    twofa_methods = None
    twofa_method = None

    return ShowMessage("2FA code submitted successfully. Login complete.", 200)

def _login_sync(account: AppleAccount) -> None:
    email = os.getenv("APPLE_EMAIL")
    password = os.getenv("APPLE_PASSWORD")

    state = account.login(email, password)

    if state == LoginState.REQUIRE_2FA:  # Account requires 2FA
        # This only supports SMS methods for now
        methods = account.get_2fa_methods()

        # Print the (masked) phone numbers
        for i, method in enumerate(methods):
            if isinstance(method, TrustedDeviceSecondFactorMethod):
                print(f"{i} - Trusted Device")
            elif isinstance(method, SmsSecondFactorMethod):
                print(f"{i} - SMS ({method.phone_number})")

        ind = int(input("Method? > "))

        method = methods[ind]
        method.request()
        code = input("Code? > ")

        # This automatically finishes the post-2FA login flow
        method.submit(code)

def get_account_sync(anisette: BaseAnisetteProvider) -> AppleAccount:
    """Tries to restore a saved Apple account, or prompts the user for login otherwise. (sync)"""
    acc = AppleAccount(anisette)

    # Save / restore account logic
    try:
        with ACCOUNT_STORE.open() as f:
            acc.restore(json.load(f))
    except FileNotFoundError:
        _login_sync(acc)
        with ACCOUNT_STORE.open("w+") as f:
            json.dump(acc.export(), f)

    return acc
