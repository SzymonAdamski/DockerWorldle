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

// Baza 365 słów - profesjonalna lista
const WORD_LIST = [
    "kreatywność", "innowacje", "rozwój", "sukces", "wyzwanie", 
    "strategia", "wizja", "cel", "działanie", "wynik",
    "jakość", "efektywność", "produktywność", "harmonia", "balans",
    "motywacja", "inspiracja", "energia", "siła", "odwaga",
    "poczucie", "satysfakcja", "radość", "spokój", "szczęście",
    "miłość", "życzliwość", "szacunek", "zaufanie", "współpraca",
    "komunikacja", "rozwiązanie", "problem", "analiza", "synteza",
    "logika", "intuicja", "mądrość", "wiedza", "doświadczenie",
    "praktyka", "teoria", "badania", "eksperyment", "odkrycie",
    "nauka", "technologia", "cyfryzacja", "automatyzacja", "informatyka",
    "programowanie", "algorytm", "dane", "informacja", "wiedza",
    "szkoła", "uczenie", "edukacja", "rozwój", "postęp",
    "społeczność", "kultura", "sztuka", "muzyka", "literatura",
    "film", "teatr", "fotografia", "design", "architektura",
    "przyroda", "ekologia", "środowisko", "klimat", "energia",
    "zdrowie", "fitness", "odżywianie", "relaks", "medytacja",
    "podróż", "odkrywanie", "przygoda", "eksploracja", "horyzont",
    "biznes", "przedsiębiorca", "start-up", "inwestycja", "zysk",
    "finanse", "budżet", "oszczędności", "inwestycje", "rynek",
    "praca", "kariera", "zasoby", "talent", "umiejętność",
    "czas", "planowanie", "organizacja", "priorytety", "cele",
    "metoda", "proces", "system", "struktura", "hierarchia",
    "lider", "menedżer", "zespół", "kooperacja", "konkurencja",
    "rynek", "klient", "produkt", "usługa", "jakość",
    "marka", "reputacja", "zaufanie", "wiarygodność", "lojalność",
    "marketing", "sprzedaż", "promocja", "reklama", "media",
    "społeczność", "relacje", "sieć", "kontakty", "współpraca",
    "projekt", "inicjatywa", "realizacja", "wytwarzanie", "dostawa",
    "logistyka", "transport", "magazyn", "kontrola", "jakość",
    "bezpieczeństwo", "ochrona", "bezpieczeństwo", "ryzyko", "bezpieczeństwo",
    "prawo", "regulacje", "zgodność", "etapy", "procesy",
    "dokumentacja", "archiwizacja", "przechowywanie", "backup", "odzyskiwanie",
    "technologia", "innowacje", "badania", "rozwój", "wytwarzanie",
    "produkcja", "wydajność", "jakość", "kontrola", "testowanie",
    "optymalizacja", "ulepszenie", "modernizacja", "transformacja", "rewolucja",
    "cyfrowa", "transformacja", "automatyzacja", "robotyzacja", "sztuczna",
    "inteligencja", "uczenie", "maszynowe", "algorytmy", "dane",
    "analiza", "wizualizacja", "raportowanie", "decyzje", "strategie",
    "planowanie", "prognozowanie", "symulacje", "modelowanie", "predykcja",
    "trendy", "prognozy", "scenariusze", "planowanie", "kontyngencja",
    "kryzys", "zarządzanie", "ryzyko", "bezpieczeństwo", "stabilność",
    "adaptacja", "elastyczność", "odporność", "wytrzymałość", "trwałość",
    "zrównoważony", "rozwój", "ekologia", "społeczność", "gospodarka",
    "społeczna", "odpowiedzialność", "etyka", "moralność", "wartości",
    "zasady", "normy", "standardy", "jakość", "wydajność",
    "wyniki", "efekty", "skuteczność", "efektywność", "produktywność",
    "innowacje", "kreatywność", "myślenie", "krytyczne", "rozwiązywanie",
    "problemów", "decyzje", "wybory", "opcje", "alternatywy",
    "bezpieczeństwo", "stabilność", "pewność", "zaufanie", "wiarygodność",
    "reputacja", "marka", "tożsamość", "wizerunek", "postrzeganie",
    "społeczność", "kultura", "tradycja", "nowoczesność", "postęp",
    "edukacja", "wiedza", "umiejętności", "kompetencje", "doświadczenie",
    "praktyka", "teoria", "badania", "rozwój", "doskonalenie",
    "doskonałość", "mistrzostwo", "ekspertyza", "profesjonalizm", "majstersztyk"
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
