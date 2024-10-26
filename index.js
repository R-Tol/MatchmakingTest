const express = require('express');
const app = express();
app.use(express.json());

// Usa la porta definita dall'ambiente, o 3000 in locale
const PORT = process.env.PORT || 3000;

// Mappa dei server attivi, dove `gameTag` è la chiave per ogni gruppo di server
let servers = {};
// Endpoint per pubblicare un server
app.post("/publish", (req, res) => {
    try {
        console.log("Dati ricevuti dal client:", req.body);

        const { game, desc, timeout } = req.body;

        // Converte timeout da stringa a numero
        const parsedTimeout = parseInt(timeout, 10);
        if (isNaN(parsedTimeout)) {
            return res.status(400).json({ error: "Il valore di timeout non è un numero valido." });
        }

        // Assicura che `desc` sia interpretato come oggetto
        let serverInfo;
        if (typeof desc === 'string') {
            serverInfo = JSON.parse(desc);
        } else {
            serverInfo = desc;
        }

        // Verifica che `description` contenga `hostuser`
        const hostUser = serverInfo.description?.hostuser;
        if (!hostUser) {
            return res.status(400).json({ error: "Il campo 'hostuser' è richiesto in description." });
        }

        // Stampa di debug per i valori
        console.log("Gioco:", game);
        console.log("Descrizione JSON (come oggetto):", serverInfo);
        console.log("Timeout:", parsedTimeout);
        console.log("Hostuser:", hostUser);

        // Inizializza `servers[game]` se non esiste già e rimuovi eventuali server con lo stesso `hostuser`
        servers[game] = servers[game] || [];
        servers[game] = servers[game].filter(server => server.data.description.hostuser !== hostUser);

        // Aggiungi il nuovo server con `desc` come stringa
        servers[game].push({
            data: serverInfo,
            expiresAt: Date.now() + parsedTimeout * 1000,
        });

        res.status(200).json({ message: "Server pubblicato con successo!" });
    } catch (error) {
        console.error("Errore durante la pubblicazione:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

app.get("/list", (req, res) => {
    const { game } = req.query;
    console.log(`Serving request for game: ${game}`);

    // Verifica se il parametro `game` è presente e ci sono server registrati
    if (!game) {
        return res.status(400).json({ error: "Il parametro 'game' è richiesto." });
    }

    // Filtra i server attivi (non scaduti) e mappa solo il campo `desc`
    const now = Date.now();
    const activeDescriptions = (servers[game] || [])
        .filter(server => server.expiresAt > now)
        .map(server => server.data); // estrai solo `desc` (o `data`)

    // Stampa di debug per le descrizioni dei server attivi
    console.log("Descrizioni dei server attivi:", activeDescriptions);

    // Restituisci la lista di descrizioni attive come risposta JSON
    return res.json(activeDescriptions);
});

// Endpoint per revocare un server
app.post('/revoke', (req, res) => {
    const { game, address, port } = req.body;
    if (!game || !address || !port || !servers[game]) {
        return res.status(400).json({ error: 'Dati incompleti.' });
    }

    servers[game] = servers[game].filter(server => 
        !(server.address === address && server.port === port)
    );

    return res.json({ message: 'Server revocato con successo.' });
});

app.listen(PORT, () => {
    console.log(`Server API in ascolto su http://localhost:${PORT}`);
});
