const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Baza 365 słów - polskie słowa 5-literowe
const WORD_LIST = [
    "amber", "basen", "biały", "ciało", "czarny",
    "demon", "deszcz", "droga", "dzban", "fajny",
    "forma", "głowa", "gniew", "góral", "grupa",
    "hałas", "humor", "iskra", "jajko", "jasny",
    "karma", "klasa", "komin", "konik", "kości",
    "krawat", "lalka", "laska", "laser", "lekcja",
    "lista", "liście", "lomot", "ludzie", "ławka",
    "łaska", "łatwy", "magia", "magia", "malarz",
    "mango", "masło", "maska", "matka", "medal",
    "metal", "ميكس", "młody", "model", "morze",
    "motor", "mózg", "muzyk", "napis", "nerwy",
    "niedźwiedź", "nisko", "numer", "obiad", "ocean",
    "ogień", "okład", "opera", "ostra", "owady",
    "palec", "papier", "pasek", "pasta", "perła",
    "pięść", "piłka", "pisak", "pizza", "plaża",
    "poeta", "pokój", "pomoc", "pałac", "prawo",
    "praca", "próba", "punkt", "pytanie", "ranek",
    "rower", "rozmowa", "ręka", "rzeka", "saldo",
    "serce", "seria", "siara", "sieci", "silny",
    "skała", "sklep", "słoma", "słowo", "smród",
    "sonda", "sport", "spory", "stały", "statek",
    "stopa", "stres", "sukno", "super", "szary",
    "szkoła", "sznur", "sztorm", "ścian", "świat",
    "tango", "taran", "tarcza", "taśma", "temat",
    "teren", "tłuszcz", "token", "towar", "trawa",
    "trąba", "trener", "trzos", "tubka", "tunel",
    "tupet", "turbo", "twardy", "tygrysa", "tytuł",
    "ubogi", "ubrań", "ucisk", "udział", "ufoludek",
    "ulica", "upadek", "upały", "urlop", "usługa",
    "wakacje", "walka", "wanna", "warsztat", "wątek",
    "wejście", "wesele", "wiatr", "wiedza", "wierz",
    "wiking", "willa", "wiosna", "wirusy", "wizerunek",
    "właść", "wodór", "wolny", "worki", "wózek",
    "wrota", "wspólne", "wybór", "wyjście", "wykład",
    "wyrób", "wyspa", "wyścig", "wywiad", "zabawa",
    "zagra", "zakaz", "zamek", "zapaс", "zasób",
    "zawód", "ząbek", "zbieg", "zboże", "zegar",
    "zemsta", "zgoda", "ziemia", "zimno", "zjawa",
    "złoto", "zmiana", "znak", "zwrot", "żabka",
    "żaden", "żarty", "żelaz", "żółty", "życie",
    "pizza", "hasło", "konto", "marka", "ognio",
    "owies", "palma", "pasta", "peron", "pismo",
    "płacz", "płyta", "poker", "pompa", "porta",
    "prace", "prasa", "przed", "radio", "ranek",
    "razor", "rekord", "remiz", "rezon", "robot",
    "rodeo", "rozmach", "runda", "rysunek", "sauna",
    "sekta", "senat", "shrek", "siano", "sigma",
    "sinus", "siostra", "skaner", "skład", "skóra",
    "skulpa", "skwar", "słaby", "smaga", "smaki",
    "snowy", "sobie", "sojusz", "sonda", "spada",
    "spisu", "spóźnia", "sprzęt", "stado", "staja",
    "stały", "starter", "stary", "statek", "stelar",
    "stoły", "stres", "strona", "strój", "sukces",
    "szabla", "szafa", "szansa", "szatan", "szczyt",
    "szklana", "szmata", "szyna", "ślady", "śmiej",
    "środek", "święta", "tabel", "talia", "taniec",
    "tchórz", "tecza", "tekst", "temat", "tempo",
    "termin", "teściowa", "tiger", "tkaczy", "token",
    "torba", "towar", "tracić", "trans", "trawnik",
    "trend", "trójca", "truck", "trwać", "trzask",
    "tułów", "turniej", "twarz", "tyran", "układ",
    "ultra", "umowa", "upadł", "upraw", "urzęd",
    "walor", "warto", "wzrok", "ząbki", "zdarz"
];

// Konfiguracja sesji
const sessions = new Map();

// Funkcja generująca unikalne ID sesji
const generateSessionId = () => crypto.randomBytes(16).toString('hex');

// Funkcja pobierająca słowo na dany dzień
const getTodaysWord = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return WORD_LIST[dayOfYear % WORD_LIST.length].toLowerCase();
};

// Endpoint do inicjalizacji gry
app.post('/api/init', (req, res) => {
    const sessionId = generateSessionId();
    const todaysWord = getTodaysWord();
    const wordLength = todaysWord.length;
    
    sessions.set(sessionId, {
        word: todaysWord,
        attempts: [],
        maxAttempts: 6,
        gameOver: false,
        won: false,
        startTime: new Date(),
        wordLength: wordLength
    });
    
    res.json({
        sessionId,
        wordLength,
        maxAttempts: 6,
        attemptsLeft: 6
    });
});

// Endpoint do zgadywania słowa
app.post('/api/guess', (req, res) => {
    const { sessionId, guess } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(400).json({ error: 'Nieprawidłowa sesja' });
    }
    
    const session = sessions.get(sessionId);
    const todaysWord = session.word;
    
    if (session.gameOver) {
        return res.status(400).json({ error: 'Gra już się zakończyła' });
    }
    
    if (!guess || guess.trim().length === 0) {
        return res.status(400).json({ error: 'Puste słowo' });
    }
    
    const normalizedGuess = guess.trim().toLowerCase();
    
    if (normalizedGuess.length !== todaysWord.length) {
        return res.status(400).json({ 
            error: `Słowo musi mieć dokładnie ${todaysWord.length} liter` 
        });
    }
    
    // Sprawdź czy słowo jest w bazie (opcjonalne)
    const isWordValid = true; // Tymczasowo pomijamy walidację słów
    
    if (!isWordValid) {
        return res.status(400).json({ error: 'Nieznane słowo' });
    }
    
    // Oblicz wynik dla każdej litery
    const result = [];
    const wordChars = todaysWord.split('');
    const guessChars = normalizedGuess.split('');
    
    // Pierwsze przejście - poprawne litery w dobrym miejscu
    const usedIndices = new Set();
    
    for (let i = 0; i < todaysWord.length; i++) {
        if (guessChars[i] === wordChars[i]) {
            result.push({
                letter: guessChars[i],
                position: i,
                status: 'correct' // Zielony
            });
            usedIndices.add(i);
        }
    }
    
    // Drugie przejście - poprawne litery w złym miejscu
    for (let i = 0; i < todaysWord.length; i++) {
        if (result[i]) continue; // Już przetworzone
        
        const letter = guessChars[i];
        let found = false;
        
        for (let j = 0; j < todaysWord.length; j++) {
            if (usedIndices.has(j)) continue;
            if (wordChars[j] === letter) {
                result.push({
                    letter: letter,
                    position: i,
                    status: 'present' // Żółty
                });
                usedIndices.add(j);
                found = true;
                break;
            }
        }
        
        if (!found) {
            result.push({
                letter: letter,
                position: i,
                status: 'absent' // Szary
            });
        }
    }
    
    // Sortuj wyniki po pozycji (dla pewności)
    result.sort((a, b) => a.position - b.position);
    
    // Zapisz próbę
    session.attempts.push({
        guess: normalizedGuess,
        result: result,
        timestamp: new Date()
    });
    
    // Sprawdź czy wygrana
    const isWin = normalizedGuess === todaysWord;
    
    if (isWin) {
        session.gameOver = true;
        session.won = true;
    } else if (session.attempts.length >= session.maxAttempts) {
        session.gameOver = true;
        session.won = false;
    }
    
    // Zaktualizuj sesję
    sessions.set(sessionId, session);
    
    res.json({
        result: result,
        isWin: isWin,
        gameOver: session.gameOver,
        won: session.won,
        attemptsLeft: session.maxAttempts - session.attempts.length,
        totalAttempts: session.attempts.length,
        solution: isWin || session.gameOver ? todaysWord : null
    });
});

// Endpoint do pobrania statystyk dnia
app.get('/api/daily-stats', (req, res) => {
    const todaysWord = getTodaysWord();
    const stats = {
        date: new Date().toISOString().split('T')[0],
        wordLength: todaysWord.length,
        totalGames: 0,
        wins: 0,
        averageAttempts: 0
    };
    
    // W prawdziwej aplikacji te dane byłyby z bazy danych
    // Tutaj symulujemy statystyki
    
    res.json(stats);
});

// Endpoint do sprawdzenia stanu gry
app.get('/api/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sesja nie istnieje' });
    }
    
    const session = sessions.get(sessionId);
    res.json({
        wordLength: session.word.length,
        attempts: session.attempts,
        gameOver: session.gameOver,
        won: session.won,
        attemptsLeft: session.maxAttempts - session.attempts.length,
        totalAttempts: session.attempts.length
    });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error('Błąd serwera:', err);
    res.status(500).json({ 
        error: 'Wewnętrzny błąd serwera',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Profesjonalne Wordle API działa na porcie ${port}`);
    console.log(`🔐 Dzisiejsze słowo: ${getTodaysWord()}`);
    console.log(`📊 Dostępne endpointy:`);
    console.log(`   POST /api/init - inicjalizacja gry`);
    console.log(`   POST /api/guess - zgadywanie słowa`);
    console.log(`   GET  /api/status/:sessionId - stan gry`);
    console.log(`   GET  /api/daily-stats - statystyki dnia`);
    console.log(`   GET  /health - sprawdzenie zdrowia serwera`);
});
