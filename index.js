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
        const { game, desc, timeout } = req.body;

        // Convertiamo timeout da stringa a numero, impostando un valore di default se non è valido
        const parsedTimeout = parseInt(timeout, 10);
        if (isNaN(parsedTimeout)) {
            return res.status(400).json({ error: "Il valore di timeout non è un numero valido." });
        }

        console.log("Gioco:", game);
        console.log("Descrizione:", desc);
        console.log("Timeout:", parsedTimeout);

        // Qui puoi salvare o gestire i dati
        res.status(200).json({ message: "Server pubblicato con successo!" });
    } catch (error) {
        console.error("Errore durante la pubblicazione:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// Endpoint per ottenere la lista dei server
app.get("/list", (req, res) => {
    const { game, timeout } = req.query;

    // Convertiamo timeout da stringa a numero
    const parsedTimeout = parseInt(timeout, 10);
    if (isNaN(parsedTimeout)) {
        return res.status(400).json({ error: "Il valore di timeout non è un numero valido." });
    }

    console.log("Gioco:", game);
    console.log("Timeout:", parsedTimeout);

    // Qui puoi gestire il recupero della lista dei server

    res.status(200).json({ message: "Lista dei server restituita con successo!" });
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
