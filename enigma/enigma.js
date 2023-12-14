
$(function() {
    var isValidInput = function(input) {
        return /^[a-zA-Z]*$/g.test(input);
    };

    var isAlphabeticChar = function(input) {
        return /^[a-zA-Z]$/g.test(input);
    };

    var isDifferentChar = function(input, current) {
        return (input !== current);
    };

    var isValidPlugboardConfig = function(input, current) {
        return (isAlphabeticChar(input)
        && isDifferentChar(input, current));
    };

    var getPlugboardConfig = function() {
        var pairs = $('.plugboard-letter-settings').map(function() {
            thisLetter = $(this).attr('id').slice(-1);
            otherLetter = $(this).val().toUpperCase();

            if (otherLetter)
            return (thisLetter + otherLetter);
        }).get();

        return pairs;
    };

    var getRotorInstance = function(pos) {
        var type = $('#rotor-type-' + pos).val();

        if (type === 'I')
        rotor = new RotorI();
        else if (type === 'II')
            rotor = new RotorII();
        else if (type === 'III')
            rotor = new RotorIII();
        else if (type === 'IV')
            rotor = new RotorIV();
        else if (type === 'V')
            rotor = new RotorV();

        return rotor;
    }

    var getReflectorInstance = function() {
        return new ReflectorB();
    }

    var encode = function(input) {
        getPlugboardConfig();

        var machine = new Machine();

        var plugboard = new Plugboard();
        plugboard.addPlugs.apply(plugboard, getPlugboardConfig());
        machine.setPlugboard(plugboard);

        var rightRotor = getRotorInstance('right');
        rightRotor.setInnerPosition('A');
        rightRotor.setInitialPosition('A');

        var middleRotor = getRotorInstance('middle');
        middleRotor.setInnerPosition('A');
        middleRotor.setInitialPosition('A');

        var leftRotor = getRotorInstance('left');
        leftRotor.setInnerPosition('A');
        leftRotor.setInitialPosition('A');

        machine.setRotors(leftRotor, middleRotor, rightRotor);

        var reflector = getReflectorInstance();
        machine.setReflector(reflector);

        return machine.encodeLetters(input);
    };

    var updateOutput = function() {
        $('#enigma-output').val(encode($('#enigma-input').val()));
    };

    $('#enigma-input').keyup(function(e) {
        input = $(this).val();
        validInput = input.replace(/([^a-zA-Z]+)/gi, '').toUpperCase();
        $(this).val(validInput);
        updateOutput();
    });

    $('.rotor-settings').keydown(function(e) {
        e.preventDefault();

        letter = String.fromCharCode(e.keyCode).toUpperCase();

        if (isAlphabeticChar(letter))
        $(this).val(letter);

        updateOutput();
    });

    $('.plugboard-letter-settings').keydown(function(e) {
        e.preventDefault();

        thisLetter = $(this).attr('id').slice(-1);
        otherLetter = String.fromCharCode(e.keyCode).toUpperCase();
        previousLetter = $(this).attr('previousLetter');

        // Erase any other letter that is currently connected to the
        // letter we want right now
        if (isAlphabeticChar(otherLetter)) {
            currentOtherLetter = $('#plugboard-letter-' + otherLetter).val();
            if (currentOtherLetter)
            $('#plugboard-letter-' + currentOtherLetter).val('');
        }

        // Erasing the letter that we were previously connected to
        if (previousLetter)
        $('#plugboard-letter-' + previousLetter).val('');

        if (isValidPlugboardConfig(otherLetter, thisLetter)) {
            $(this).val(otherLetter);
            $(this).attr('previousLetter', otherLetter);
            $('#plugboard-letter-' + otherLetter).val(thisLetter);
            $('#plugboard-letter-' + otherLetter).attr('previousLetter', thisLetter);
        } 
        else{
                $(this).attr('previousLetter', '');
                $(this).val('');
            }

        updateOutput();
    });

    $('select[id^=rotor-type-]').change(function() {
        // Get a list of the ids that are selected
        var selected = [];
            $('[id^=rotor-type-] option:selected').each(function() {
                selected.push($(this).val());
            });

            // Walk through every select option and enable if not
            // in the list and not already selected
            $('[id^=rotor-type-] option').each(function(){
                if (!$(this).is(':selected')){
                    var shouldDisable = false;
                    for (var i = 0; i < selected.length; i++){
                        if (selected[i] == $(this).val())
                        shouldDisable = true;
                    }

                    $(this).css('text-decoration', '');
                    $(this).removeAttr('disabled', 'disabled');

                    if (shouldDisable) {
                        $(this).css('text-decoration', 'line-through');
                        $(this).attr('disabled', 'disabled');
                    }
                }
            });

        updateOutput();
    });

            
    $('.reflector-settings').change(function() {
        updateOutput();
    });
});


// All valid letters for this simulator
var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var Plugboard = function() {
    this.plugs = {};
    Plugboard.prototype.addPlugs.apply(this, arguments);
};

Plugboard.prototype.addPlug = function(letter1, letter2) {
    this.plugs[letter1] = letter2;
    this.plugs[letter2] = letter1;
};

Plugboard.prototype.addPlugs = function() {
    for (var i = 0; i < arguments.length; i++) {
        var letters = arguments[i];
        this.addPlug(letters.charAt(0), letters.charAt(1));
    }
};

Plugboard.prototype.encode = function(letter) {
    if (letter in this.plugs)
        return this.plugs[letter];
    return letter;
};

var Rotor = function(wiringTable) {
    this.wires = {};
    this.inverseWires = {};
    this.nextRotor = null;
    this.turnoverCountdown = 26;
    this.innerRingPosition = 0;

    if (wiringTable)
        this.setWiringTable(wiringTable);
};

Rotor.prototype.setInitialPosition = function(initialPosition) {
    var letterCode = initialPosition.charCodeAt(0) - 'A'.charCodeAt(0);
    var nextRotor = this.nextRotor;
    this.nextRotor = null;

    for (var i = 0; i < letterCode; i++)
        this.step();

    this.nextRotor = nextRotor;
};

Rotor.prototype.setInnerPosition = function(innerRingPosition) {
    var numberOfSteps = innerRingPosition.charCodeAt(0) -
        'A'.charCodeAt(0);

    for (var i = 0; i < 26 - numberOfSteps; i++) {
        this.stepWires();
        this.updateInverseWires();
        this.innerRingPosition += 1;
    }
};

Rotor.prototype.setNextRotor = function(rotor) {
    this.nextRotor = rotor;
};

Rotor.prototype.setTurnoverLetter = function(letter) {
    this.turnoverCountdown = letter.charCodeAt(0) - 'A'.charCodeAt(0);

    if (this.turnoverCountdown === 0)
        this.turnoverCountdown = 26;
};

Rotor.prototype.addWire = function(letter1, letter2) {
    this.wires[letter1] = letter2;
};

Rotor.prototype.setWiringTable = function(wiringTable) {
    for (var i = 0; i < LETTERS.length; i++) {
        this.wires[LETTERS[i]] = wiringTable[i];
        this.inverseWires[wiringTable[i]] = LETTERS[i];
    }
};

Rotor.prototype.encode = function(letter, inverse) {
    var letterCode = letter.charCodeAt(0) - 'A'.charCodeAt(0);

    if (inverse) {
        offsetLetterCode = (letterCode + this.innerRingPosition) % LETTERS.length;
        if (offsetLetterCode < 0) offsetLetterCode += 26;

        return this.inverseWires[String.fromCharCode('A'.charCodeAt(0) + offsetLetterCode)];
    } else {
        outputLetterCode = this.wires[letter].charCodeAt(0) - 'A'.charCodeAt(0);

        offsetLetterCode = (outputLetterCode - this.innerRingPosition) % LETTERS.length;
        if (offsetLetterCode < 0) offsetLetterCode += 26;

        return String.fromCharCode('A'.charCodeAt(0) + offsetLetterCode);
    }
};

Rotor.prototype.step = function() {
    this.stepWires();
    this.updateInverseWires();
    this.turnover();
    this.innerRingPosition += 1;
};

Rotor.prototype.stepWires = function() {
    var newWires = {};
    var currentLetter;
    var nextLetter;

    for (var i = 0; i < LETTERS.length; i++) {
        currentLetter = LETTERS[i];
        nextLetter = LETTERS[(i + 1) % LETTERS.length];
        newWires[currentLetter] = this.wires[nextLetter];
    }

    this.wires = newWires;
};

Rotor.prototype.updateInverseWires = function() {
    for (var i = 0; i < LETTERS.length; i++) {
        letter = LETTERS[i];
        encodedLetter = this.wires[letter];
        this.inverseWires[encodedLetter] = letter;
    }
};

Rotor.prototype.turnover = function() {
    this.turnoverCountdown -= 1;

    if (this.turnoverCountdown === 0) {
        if (this.nextRotor)
            this.nextRotor.step();
        this.turnoverCountdown = 26;
    }
};

var RotorI = function() {
    var rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ');
    rotor.setTurnoverLetter('R');
    return rotor;
};

var RotorII = function() {
    var rotor = new Rotor('AJDKSIRUXBLHWTMCQGZNPYFVOE');
    rotor.setTurnoverLetter('F');
    return rotor;
};

var RotorIII = function() {
    var rotor = new Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO');
    rotor.setTurnoverLetter('W');
    return rotor;
};

var RotorIV = function() {
    var rotor = new Rotor('ESOVPZJAYQUIRHXLNFTGKDCMWB');
    rotor.setTurnoverLetter('K');
    return rotor;
};

var RotorV = function() {
    var rotor = new Rotor('VZBRGITYUPSDNHLXAWMJQOFECK');
    rotor.setTurnoverLetter('A');
    return rotor;
};

var Reflector = function() {
    this.reflectionTable = {};

    for (var i = 0; i < LETTERS.length; i++)
        this.reflectionTable[LETTERS[i]] = LETTERS[i];
};

Reflector.prototype.setReflectionTable = function(reflectionTable) {
    newReflectionTable = {};

    for (var i = 0; i < LETTERS.length; i++) {
        input = LETTERS[i];
        output = reflectionTable[i];
        newReflectionTable[input] = output;
    }

    this.reflectionTable = newReflectionTable;
};

Reflector.prototype.encode = function(letter) {
    return this.reflectionTable[letter];
};

var ReflectorB = function() {
    var reflector = new Reflector();
    reflector.setReflectionTable('YRUHQSLDPXNGOKMIEBFZCWVJAT');
    return reflector;
};

var ReflectorC = function() {
    var reflector = new Reflector();
    reflector.setReflectionTable('FVPJIAOYEDRZXWGCTKUQSBNMHL');
    return reflector;
};

var Machine = function() {
    this.debug = false;
    this.plugboard = null;
    this.rotors = null;
    this.reflector = null;
};

Machine.prototype.log = function(message) {
    if (this.debug)
        console.log(message);
};

Machine.prototype.setDebug = function(debug) {
    this.debug = debug;
};

Machine.prototype.setPlugboard = function(plugboard) {
    this.plugboard = plugboard;

    this.log('Machine plugboard table');
    this.log(this.plugboard.plugs);
    this.log('');
};

Machine.prototype.setRotors = function(leftRotor, middleRotor, rightRotor) {
    this.rotors = [rightRotor, middleRotor, leftRotor];
    this.rotors[0].setNextRotor(this.rotors[1]);
    this.rotors[1].setNextRotor(this.rotors[2]);

    this.log('Machine rotors table');

    for (var i = 0; i < this.rotors.length; i++) {
        this.log('Rotor ' + i + ' table');
        this.log(this.rotors[i].wires);
        this.log('');
    }
};

Machine.prototype.setReflector = function(reflector) {
    this.reflector = reflector;

    this.log('Machine reflector table');
    this.log(this.reflector.reflectionTable);
    this.log('');
};

Machine.prototype.encode = function(letter) {
    // Double stepping anomaly
    // Rotors turns over the rotor on their right as well. This is not noticed
    // in rotor 0 because it always steps anyway.
    if (this.rotors[1].turnoverCountdown == 1 &&
        this.rotors[2].turnoverCountdown == 1) {
        this.rotors[1].step();
    }

    // Update rotor position after encoding
    this.rotors[0].step();

    this.log('Machine encoding');

    this.log('letter: ' + letter);

    var plugboardDirect = this.plugboard.encode(letter);
    this.log('plugboardDirect: ' + letter + ' -> ' + plugboardDirect);

    var rotorsDirect = this.encodeWithRotors(plugboardDirect);

    var reflectorInverse = this.reflector.encode(rotorsDirect);
    this.log('reflectorInverse: ' + rotorsDirect + ' -> ' + reflectorInverse);

    var rotorsInverse = this.encodeInverseWithRotors(reflectorInverse);

    var plugboardInverse = this.plugboard.encode(rotorsInverse);
    this.log('plugboardInverse: ' + rotorsInverse + ' -> ' + plugboardInverse);

    this.log('');

    return plugboardInverse;
};

Machine.prototype.encodeWithRotors = function(letter) {
    for (var i = 0; i < this.rotors.length; i++) {
        output = this.rotors[i].encode(letter);
        this.log('rotor ' + i + ' direct: ' + letter + ' -> ' + output);

        letter = output;
    }

    return output;
};

Machine.prototype.encodeInverseWithRotors = function(letter) {
    for (var i = this.rotors.length - 1; i >= 0; i--) {
        output = this.rotors[i].encode(letter, true);
        this.log('rotor ' + i + ' inverse: ' + letter + ' -> ' + output);

        letter = output;
    }

    return output;
};

Machine.prototype.encodeLetters = function(letters) {
    var result = '';

    for (var i = 0; i < letters.length; i++)
        result += this.encode(letters[i]);

    return result;
};

