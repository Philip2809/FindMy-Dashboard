import base64
import hashlib
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend

def sha256(data):
    digest = hashlib.new("sha256")
    digest.update(data)
    return digest.digest()

def keygen(private_key=None):
    if private_key:
        private_key_int = int.from_bytes(base64.b64decode(private_key), 'big')

        # TODO: Ensure the private key is valid for the curve
        private_key_obj = ec.derive_private_key(
            private_key_int,
            ec.SECP224R1(),
            default_backend()
        )
    else:
        private_key_obj = ec.generate_private_key(ec.SECP224R1(), default_backend())
        private_key_int = private_key_obj.private_numbers().private_value

    public_key_int = private_key_obj.public_key().public_numbers().x

    private_key_bytes = private_key_int.to_bytes(28, 'big')
    public_key_bytes = public_key_int.to_bytes(28, 'big')

    private_key = base64.b64encode(private_key_bytes).decode("ascii")
    public_key = base64.b64encode(public_key_bytes).decode("ascii")
    hashed_public_key = base64.b64encode(sha256(public_key_bytes)).decode("ascii")

    return private_key, public_key, hashed_public_key

