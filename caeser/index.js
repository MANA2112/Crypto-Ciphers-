
function encryptCaesar(message, shift) {
  let encryptedMessage = "";
  for (let i = 0; i < message.length; i++) {
    let char = message[i];
    if (char.match(/[a-zA-Z]/)) {
      let code = message.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }
    encryptedMessage += char;
  }
  return encryptedMessage;
}

function decryptCaesar(message, shift) {
  return encryptCaesar(message, (26 - shift) % 26);
}

const originalMessage =
  "Mama, just killed a man Put a gun against his head, pulled my trigger, now he's dead Mama, life had just begun But now I've gone and thrown it all away Mama, ooh, didn't mean to make you cry If I'm not back again this time tomorrow Carry on, carry on as if nothing really matters";
const shiftAmount = 5;

const encrypted = encryptCaesar(originalMessage, shiftAmount);
console.log("Encrypted Text:", encrypted);

const decrypted = decryptCaesar(encrypted, shiftAmount);
console.log("Decrypted Text:", decrypted);
