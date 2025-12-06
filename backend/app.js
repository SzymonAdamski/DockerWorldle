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

// Baza 365 słów - TYLKO 5-literowe polskie słowa
const WORD_LIST = [
    "amber", "basen", "bialy", "cialo", "czary",
    "demon", "droga", "dzban", "fajny", "forma",
    "glowa", "gniew", "goral", "grupa", "halas",
    "humor", "iskra", "jajko", "jasny", "karma",
    "klasa", "komin", "konik", "kosci", "lalka",
    "laska", "laser", "lista", "lomot", "lawka",
    "laska", "latwy", "magia", "malarz", "mango",
    "maslo", "maska", "matka", "medal", "metal",
    "mlody", "model", "morze", "motor", "mozog",
    "muzyk", "napis", "nerwy", "nisko", "numer",
    "obiad", "ocean", "ogien", "oklad", "opera",
    "ostra", "owady", "palec", "pasek", "pasta",
    "perla", "piesc", "pilka", "pisak", "pizza",
    "plaza", "poeta", "pokoj", "pomoc", "palac",
    "prawo", "praca", "proba", "punkt", "ranek",
    "rower", "reka", "rzeka", "saldo", "serce",
    "seria", "siara", "sieci", "silny", "skala",
    "sklep", "sloma", "slowo", "smrod", "sonda",
    "sport", "spory", "staly", "stopa", "stres",
    "sukno", "super", "szary", "sznur", "scian",
    "swiat", "tango", "taran", "tasma", "temat",
    "teren", "token", "towar", "trawa", "traba",
    "trzos", "tubka", "tunel", "tupet", "turbo",
    "tytul", "ubogi", "ucisk", "ulica", "urlop",
    "walka", "wanna", "watek", "wiatr", "wierz",
    "willa", "wolny", "worki", "wozek", "wrota",
    "wybor", "wyrob", "wyspa", "wyrok", "zakaz",
    "zamek", "zasob", "zawod", "zabek", "zbieg",
    "zboze", "zegar", "zemst", "zgoda", "ziemi",
    "zimno", "zjawa", "zloto", "zmian", "znak",
    "zwrot", "zabka", "zaden", "zarty", "zelaz",
    "zolty", "zycie", "pizza", "haslo", "konto",
    "marka", "ogien", "owies", "palma", "peron",
    "pismo", "placz", "plyta", "poker", "pompa",
    "porta", "prace", "prasa", "przed", "radio",
    "razor", "rezon", "robot", "rodeo", "runda",
    "sauna", "sekta", "senat", "shrek", "siano",
    "sigma", "sinus", "skwar", "slaby", "smaga",
    "smaki", "snowy", "sobie", "sonda", "spada",
    "spisu", "stado", "staja", "staly", "stary",
    "stres", "stroj", "szabla", "szafa", "szans",
    "szata", "szyna", "slady", "smiej", "srodek",
    "tabel", "talia", "tchoo", "tecza", "tekst",
    "tempo", "tiger", "token", "torba", "towar",
    "trans", "trend", "truck", "twarz", "tyran",
    "uklad", "ultra", "umowa", "urzad", "walor",
    "warto", "wzrok", "zabki", "zdarz", "zielo",
    "zolty", "bomba", "chleb", "cwany", "danie",
    "dobry", "domek", "drwal", "drzew", "duszy",
    "dziad", "dzien", "dziki", "filar", "firma",
    "flaga", "fotel", "fraza", "garaz", "gazet",
    "gecko", "gesty", "gibon", "gitar", "gnida",
    "golem", "goral", "goryl", "gouda", "gracz",
    "groch", "gront", "grosz", "groza", "gruda",
    "grunt", "grzyb", "gulag", "hades", "handel",
    "harfa", "hejla", "honda", "honor", "hotel",
    "husky", "hydra", "ikona", "indyk", "istot",
    "izola", "jazda", "jelit", "jezyk", "juhas",
    "kabla", "kadet", "kadra", "kakao", "karta",
    "kasza", "kempa", "kicia", "klaps", "klaun",
    "kleks", "klomb", "kluek", "knajp", "kobra",
    "kogut", "kokos", "kolba", "kombo", "komik",
    "korek", "korzy", "kotek", "kozak", "kpina",
    "kraje", "krata", "kredy", "kroki", "krola",
    "krowa", "krzak", "krzew", "ksiag", "ksyna",
    "kubek", "kucyk", "kudla", "kufek", "kufer",
    "kukla", "kulka", "kupce", "kupon", "kuras",
    "kusza", "kwasy", "kwiat", "kwoka", "lajna",
    "lampa", "landr", "larwa", "lasek", "latex",
    "lazur", "leczy", "legat", "legia", "lekko",
    "lemat", "lewar", "lewek", "lider", "lingo",
    "linik", "linik", "liryk", "lizak", "lokal",
    "losos", "lotek", "lotna", "lotra", "lotos",
    "lotus", "ludek", "lunch", "luter", "luzer",
    "lysos", "leczy", "limit", "lunar", "lutni",
    "lykom", "lyzka", "lyzwy", "mlyny", "mnich",
    "mocny", "moher", "monet", "morda", "mosty",
    "motyl", "muchy", "murek", "murla", "musli",
    "naboj", "nacze", "nadal", "nagle", "nakaz",
    "napor", "napoj", "naraz", "narty", "nasza",
    "nawet", "nazwa", "neron", "nocka", "norka",
    "nosal", "notka", "nozny", "nurek", "nylon"
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
    
    // Oblicz wynik dla każdej litery - poprawiony algorytm
    const result = new Array(todaysWord.length);
    const wordChars = todaysWord.split('');
    const guessChars = normalizedGuess.split('');
    const wordCharCount = {};
    
    // Zlicz litery w słowie docelowym
    for (let char of wordChars) {
        wordCharCount[char] = (wordCharCount[char] || 0) + 1;
    }
    
    // Pierwsze przejście - oznacz poprawne litery na poprawnych pozycjach (ZIELONE)
    for (let i = 0; i < todaysWord.length; i++) {
        if (guessChars[i] === wordChars[i]) {
            result[i] = {
                letter: guessChars[i],
                position: i,
                status: 'correct' // Zielony
            };
            wordCharCount[guessChars[i]]--; // Zmniejsz licznik
        }
    }
    
    // Drugie przejście - oznacz litery występujące w słowie ale na złej pozycji (ŻÓŁTE)
    for (let i = 0; i < todaysWord.length; i++) {
        if (result[i]) continue; // Już jest zielona, pomiń
        
        const letter = guessChars[i];
        
        if (wordCharCount[letter] && wordCharCount[letter] > 0) {
            result[i] = {
                letter: letter,
                position: i,
                status: 'present' // Żółty
            };
            wordCharCount[letter]--; // Zmniejsz licznik
        } else {
            result[i] = {
                letter: letter,
                position: i,
                status: 'absent' // Szary
            };
        }
    }
    
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
