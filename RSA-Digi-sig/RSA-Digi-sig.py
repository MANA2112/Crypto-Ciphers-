from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256

# Generate and save RSA key pair
key = RSA.generate(2048)

# Save private key
with open("private.key", "wb") as file_out:
  file_out.write(key.export_key())

# Save public key
with open("public.key", "wb") as file_out:
  file_out.write(key.publickey().export_key())

# Signing the message
message = b'This message is from me'

with open('private.key', 'rb') as file_in:
  key = RSA.import_key(file_in.read())
  hash = SHA256.new(message)
  signer = pkcs1_15.new(key)
  signature = signer.sign(hash)

with open("signature.pem", "wb") as file_out:
  file_out.write(signature)

with open("message.txt", "wb") as file_out:
  file_out.write(message)

# Verifying the signature
with open('public.key', 'rb') as file_in:
  key = RSA.import_key(file_in.read())

with open("message.txt", "rb") as file_in:
  message = file_in.read()

with open("signature.pem", "rb") as file_in:
  signature = file_in.read()

h = SHA256.new(message)

try:
  pkcs1_15.new(key).verify(h, signature)
  print("The signature is valid.")
except (ValueError, TypeError):
  print("The signature is not valid.")
