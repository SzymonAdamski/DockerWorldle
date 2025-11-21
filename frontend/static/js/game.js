handleKeyPress(key) {
    if (this.gameOver) return;
    
    if (key === 'enter') {
        this.submitGuess();
    } else if (key === 'backspace') {
        this.deleteLetter();
    } else if (this.currentGuess.length < this.wordLength) {
        // 🔥 RĘCZNE MAPOWANIE POLSKICH ZNAKÓW
        const polishMap = {
            'AltGr+a': 'ą',
            'AltGr+c': 'ć', 
            'AltGr+e': 'ę',
            'AltGr+l': 'ł',
            'AltGr+n': 'ń',
            'AltGr+o': 'ó',
            'AltGr+s': 'ś',
            'AltGr+x': 'ź',
            'AltGr+z': 'ż',
            'AltGr+;' : 'ę'
        };
        
        let char = key;
        if (polishMap[key]) {
            char = polishMap[key];
        }
        
        if (/^[a-ząćęłńóśźż]$/.test(char)) {
            this.addLetter(char);
        }
    }
}
