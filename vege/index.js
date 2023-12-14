const app = new (function () {
  function crypt(input, key, isDecrypt) {
    let output = "";
    let j = 0;
    for (const ch of input) {
      const cc = ch.codePointAt(0);
      if (isLetter(cc)) {
        const ACode = isUppercase(cc) ? 65 : 97;
        const keyIndex = j % key.length;
        const keyChar = key.charAt(keyIndex);
        const keyOffset = keyChar.toUpperCase().charCodeAt(0) - 65;
        const charCode = ch.toUpperCase().charCodeAt(0);
        let shiftedCharCode;
        if (isDecrypt) {
          shiftedCharCode = ((charCode - ACode - keyOffset + 26) % 26) + ACode;
        } else {
          shiftedCharCode = ((charCode - ACode + keyOffset) % 26) + ACode;
        }
        output += String.fromCharCode(
          isUppercase(cc) ? shiftedCharCode : shiftedCharCode + 32,
        );
        j++;
      } else {
        output += ch;
      }
    }
    return output;
  }

  function isLetter(c) {
    return isUppercase(c) || isLowercase(c);
  }

  function isUppercase(c) {
    return 65 <= c && c <= 90;
  }

  function isLowercase(c) {
    return 97 <= c && c <= 122;
  }

  this.encrypt = function () {
    const key = "mama";
    const text = "JUST KILLED A MAN";
    const encryptedText = crypt(text, key, false);
    console.log("Encrypted text:", encryptedText);
  };

  this.decrypt = function () {
    const key = "mama";
    const encryptedText = "VUET WIXLQD M MMN";
    const decryptedText = crypt(encryptedText, key, true);
    console.log("Decrypted text:", decryptedText);
  };
})();

app.encrypt();
app.decrypt();
