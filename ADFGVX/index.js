function getADFGVXPair(char, mat, cols) {
  var i = mat.indexOf(char);
  var row = i / 6;
  var col = i % 6;
  return cols.charAt(row) + cols.charAt(col);
}

function getReverseADFGVXChar(mat, cols, rowL, colL) {
  row = cols.indexOf(rowL);
  col = cols.indexOf(colL);
  var i = 6 * row + col;
  return mat.charAt(i);
}

function decryptADFGVX(cipher, mat, cols, key) {
  cipher = cipher.toUpperCase();
  cols = cols.toUpperCase();
  var newCipher = invertColumnarTransposition(cipher, key);
  var newMat = simpleString2DArray(mat);
  var l = newCipher.length,
    i,
    text = "";
  for (i = 0; i < l; i += 2) {
    text += getReverseADFGVXChar(
      newMat,
      cols,
      newCipher.charAt(i),
      newCipher.charAt(i + 1),
    );
  }
  return text;
}

function encryptADFGVX(plain, mat, cols, key) {
  plain = plain.toLowerCase();
  var newMat = simpleString2DArray(mat);
  var l = plain.length,
    i,
    text = "";
  for (i = 0; i < l; i++) {
    text += getADFGVXPair(plain.charAt(i), newMat, cols);
  }
  return columnarTransposition(text, key);
}

function modGreater(value, lowerBound, mod) {
  var v = (value - lowerBound) % mod;
  while (v < 0) {
    v += mod;
  }
  while (v >= mod) {
    v -= mod;
  }
  return v;
}

function myGCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (Math.min(a, b) == 0) {
    return Math.max(a, b);
  }
  if (a > b) {
    return myGCD(b, a % b);
  }
  return myGCD(a, b % a);
}

function modPower(base, expo, mod) {
  var e = 1;
  var p = base;
  var powers = [];
  while (e <= expo) {
    p %= mod;
    powers.push(p);
    e *= 2;
    p *= p;
  }
  var bin = expo.toString(2);
  var t = 1;
  for (i = 0; i < bin.length; i++) {
    if (bin[bin.length - i - 1] == "1") {
      t *= powers[i];
      t %= mod;
    }
  }
  return t;
}

function factorize(n) {
  var i = 2;
  primes = [];
  expos = [];
  var e;
  while (i <= Math.sqrt(n)) {
    if (n % i == 0) {
      primes.push(i);
      e = 0;
      while (n % i == 0) {
        n /= i;
        e += 1;
      }
      expos.push(e);
    }
    i += 1;
  }
  if (n > 1) {
    primes.push(n);
    expos.push(1);
  }
  return [primes, expos];
}

function totient(n) {
  p = factorize(n)[0];
  p.forEach((x) => {
    n *= x - 1;
    n /= x;
  });
  return n;
}

function modInv(a, mod) {
  a = modGreater(a, 0, mod);
  if (myGCD(a, mod) != 1) {
    return -1;
  }
  t = totient(mod);
  return modPower(a, t - 1, mod);
}

function invertString(myString) {
  var text = "";
  for (var i = 0; i < myString.length; i++) {
    character = myString.charCodeAt(i);
    if (65 <= character && character <= 90) {
      if (character != 65) {
        text += String.fromCharCode(156 - character);
      } else {
        text += String.fromCharCode(65);
      }
    } else if (97 <= character && character <= 122) {
      if (character != 97) {
        text += String.fromCharCode(220 - character);
      } else {
        text += String.fromCharCode(97);
      }
    } else {
      return -1;
    }
  }
  return text;
}

function stringInsert(myString, i, v) {
  return myString.substring(0, i) + v + myString.substring(i);
}

function inRange(value, low, high) {
  return !(value < low || value > high);
}

function inRangeList(list, low, high) {
  for (var i = 0; i < list.length; i++) {
    if (list[i] < low || list[i] > high) {
      return false;
    }
  }
  return true;
}

function valLetters(lString) {
  var nString = lString.toLowerCase();
  var lValues = [],
    char;
  for (var i = 0; i < nString.length; i++) {
    char = nString.charAt(i);
    lValues.push(char.charCodeAt() - 97);
  }
  return lValues;
}

function valLetter(lString, i) {
  var char = lString.charAt(i);
  char = char.toLowerCase();
  return char.charCodeAt() - 97;
}

function rankLetters(nString) {
  var l = nString.length;
  var indices = [];
  var i;
  for (i = 0; i < l; i++) {
    indices.push(i);
  }
  indices.sort(
    (j, k) => 100 * (valLetter(nString, j) - valLetter(nString, k)) + (j - k),
  );
  return indices;
}

function listNIntegers(n) {
  var indices = [];
  for (i = 0; i < n; i++) {
    indices.push(i);
  }
  return indices;
}

function invertRankLetters(lString) {
  var l = lString.length;
  var indices = listNIntegers(l);
  var rank = rankLetters(lString);
  indices.sort((j, k) => rank.indexOf(j) - rank.indexOf(k));
  var final = [];
  for (i = 0; i < l; i++) {
    final.push(indices.indexOf(i));
  }
  return final;
}

function transpose2DArray(mat) {
  var newMat = [];
  var rows = mat.length;
  var cols = mat[0].length;
  var r, c, newRow;
  for (c = 0; c < cols; c++) {
    newRow = [];
    for (r = 0; r < rows; r++) {
      newRow.push(mat[r][c]);
    }
    newMat.push(newRow);
  }
  return newMat;
}

function multiplyMatrices(a, b) {
  r1 = a.length;
  c1 = a[0].length;
  r2 = b.length;
  c2 = b[0].length;
  if (c1 != r2) {
    return [];
  }
  var i, j, k;
  var endMat = [],
    endRow,
    total;
  for (i = 0; i < r1; i++) {
    endRow = [];
    for (j = 0; j < c2; j++) {
      total = 0;
      for (k = 0; k < c1; k++) {
        total += a[i][k] * b[k][j];
      }
      endRow.push(total);
    }
    endMat.push(endRow);
  }
  return endMat;
}

function mod2DArray(a, mod) {
  var ar = a.length;
  var end = [];
  var i = 0,
    row;
  for (i = 0; i < ar; i++) {
    row = a[i].map((x) => modGreater(x, 0, mod));
    end.push(row);
  }
  return end;
}

function stringify2DArray(a) {
  var text = "[";
  for (var i = 0; i < a.length; i++) {
    text += "[" + a[i].toString() + "]";
    if (i < a.length - 1) {
      text += "<br>";
    }
  }
  text += "]";
  return text;
}

function invertMatrix(a) {
  var r = a.length;
  var c = a[0].length;
  if (r != c) {
    return [];
  }
  var i, j, k;

  var identityR = [],
    idRow;
  var copyA = [],
    copRow;
  for (i = 0; i < r; i++) {
    idRow = [];
    copRow = [];
    for (j = 0; j < c; j++) {
      if (i == j) {
        idRow.push(1);
      } else {
        idRow.push(0);
      }
      copRow.push(a[i][j]);
    }
    identityR.push(idRow);
    copyA.push(copRow);
  }

  var diagElement, temp;
  for (i = 0; i < r; i++) {
    diagElement = copyA[i][i];

    if (diagElement == 0) {
      for (j = i + 1; j < r; j++) {
        if (copyA[j][i] != 0) {
          for (k = 0; k < c; k++) {
            // Swap rows i and j in copyA
            temp = copyA[i][k];
            copyA[i][k] = copyA[j][k];
            copyA[j][k] = temp;
            temp = identityR[i][k];
            identityR[i][k] = identityR[j][k];
            identityR[j][k] = temp;
          }
          break;
        }
      }
      diagElement = copyA[i][i];
      if (diagElement == 0) {
        return [];
      }
    }

    for (j = 0; j < c; j++) {
      copyA[i][j] = copyA[i][j] / parseFloat(diagElement);
      identityR[i][j] = identityR[i][j] / parseFloat(diagElement);
    }

    for (j = 0; j < r; j++) {
      if (j == i) {
        continue;
      }

      temp = copyA[j][i];

      for (k = 0; k < r; k++) {
        copyA[j][k] -= temp * copyA[i][k];
        identityR[j][k] -= temp * identityR[i][k];
      }
    }
  }
  return identityR;
}

function complementSubMatrix(a, i, j) {
  var r = a.length;
  var c = a[0].length;
  var p,
    q,
    newRow,
    newMat = [];
  for (p = 0; p < r; p++) {
    if (p == i) {
      continue;
    }
    newRow = [];
    for (q = 0; q < c; q++) {
      if (q == j) {
        continue;
      }
      newRow.push(a[p][q]);
    }
    newMat.push(newRow);
  }
  return newMat;
}

function determinantMatrix(a) {
  var r = a.length;
  var c = a[0].length;
  if (r != c) {
    return 0;
  }
  if (r == 1) {
    return a[0][0];
  }
  if (r == 2) {
    return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  }
  var total = 0,
    i,
    value;
  for (i = 0; i < c; i++) {
    value = a[0][i] * determinantMatrix(complementSubMatrix(a, 0, i));
    if (i % 2 == 0) {
      total += value;
    } else {
      total -= value;
    }
  }
  return total;
}

function roundMatrix(a) {
  var copyA = [];
  var r = a.length,
    c = a[0].length;
  var i, j, copRow;
  for (i = 0; i < r; i++) {
    copRow = [];
    for (j = 0; j < c; j++) {
      copRow.push(Math.round(a[i][j]));
    }
    copyA.push(copRow);
  }
  return copyA;
}

function scalarMultiplyMatrix(mat, s) {
  var r = mat.length;
  var c = mat[0].length;
  var newMat = [];
  var newRow, i, j;
  for (i = 0; i < r; i++) {
    newRow = [];
    for (j = 0; j < c; j++) {
      newRow.push(mat[i][j] * s);
    }
    newMat.push(newRow);
  }
  return newMat;
}

function contains2DArray(mat, v) {
  var r = mat.length;
  var c = mat[0].length;
  var i, j;
  for (i = 0; i < r; i++) {
    for (j = 0; j < c; j++) {
      if (mat[i][j] == v) {
        return true;
      }
    }
  }
  return false;
}

function shiftString(string, shift) {
  var text = "";
  var character = 0;
  var newAscii = 0;
  var v;
  for (i = 0; i < string.length; i++) {
    character = string.charCodeAt(i);
    if (65 <= character && character <= 90) {
      v = modGreater(character, 65 - shift, 26);
      newAscii = v + 65;
    } else if (97 <= character && character <= 122) {
      v = modGreater(character, 97 - shift, 26);
      newAscii = v + 97;
    } else {
      newAscii = character;
    }
    text += String.fromCharCode(newAscii);
  }
  return text;
}

function multiplyString(string, mult) {
  if (myGCD(mult, 26) != 1) {
    return string;
  }
  mult = modGreater(mult, 0, 26);
  var text = "";
  var character, newAscii, v, i;
  for (i = 0; i < string.length; i++) {
    character = string.charCodeAt(i);
    if (65 <= character && character <= 90) {
      v = modGreater(character, 65, 26);
      newAscii = modGreater(v * mult, 0, 26) + 65;
    } else if (97 <= character && character <= 122) {
      v = modGreater(character, 97, 26);
      newAscii = modGreater(v * mult, 0, 26) + 97;
    } else {
      newAscii = character;
    }
    text += String.fromCharCode(newAscii);
  }
  return text;
}

function simpleString2DArray(mat) {
  var text = "";
  var i, j;
  for (i = 0; i < mat.length; i++) {
    for (j = 0; j < mat[i].length; j++) {
      text += mat[i][j].toString();
    }
  }
  return text;
}

function columnarTransposition(plain, k) {
  var kLength = k.length;
  var pLength = plain.length;
  var columns = [],
    i,
    j = 0;
  for (i = 0; i < kLength; i++) {
    columns.push([]);
  }
  for (i = 0; i < pLength; i++) {
    columns[j].push(plain.charAt(i));
    j += 1;
    j %= kLength;
  }
  var ranking = rankLetters(k);
  var text = "";
  for (i = 0; i < kLength; i++) {
    text += columns[ranking[i]].join("");
  }
  return text;
}

function invertColumnarTransposition(cipher, k) {
  var invRanking = invertRankLetters(k);
  var cLength = cipher.length;
  var kLength = k.length;
  var complete = cLength % kLength;
  var shortLength = ~~(cLength / kLength);
  var newColumns = [];
  var total = 0,
    cur,
    i = 0,
    j,
    curCol;
  while (total < cLength) {
    if (invRanking.indexOf(i) + 1 <= complete) {
      cur = shortLength + 1;
    } else {
      cur = shortLength;
    }
    i += 1;
    curCol = [];
    for (j = 0; j < cur; j++) {
      curCol.push(cipher.charAt(total + j));
    }
    newColumns.push(curCol);
    total += cur;
  }
  var oldColumns = [];
  for (i = 0; i < kLength; i++) {
    oldColumns.push(newColumns[invRanking[i]]);
  }
  var text = "";
  for (i = 0; i < shortLength; i++) {
    for (j = 0; j < kLength; j++) {
      text += oldColumns[j][i];
    }
  }
  for (j = 0; j < kLength; j++) {
    if (oldColumns[j].length > shortLength) {
      text += oldColumns[j][shortLength];
    } else {
      break;
    }
  }
  return text;
}
var plaintext = "MAMAJUSTKILLEDAMAN";
var keyWord = "queen";
var keyColumns = "ADFGVX";
var keyGrid = [
  ["a", "d", "f", "g", "v", "x"],
  ["b", "c", "z", "0", "1", "2"],
  ["3", "4", "5", "6", "7", "8"],
  ["9", "e", "h", "i", "j", "k"],
  ["l", "m", "n", "o", "p", "q"],
  ["r", "s", "t", "u", "w", "y"],
];

var encryptedText = encryptADFGVX(plaintext, keyGrid, keyColumns, keyWord);
var decryptedText = decryptADFGVX(encryptedText, keyGrid, keyColumns, keyWord);

console.log("Plaintext:", plaintext);
console.log("Encrypted:", encryptedText);
console.log("Decrypted:", decryptedText);
