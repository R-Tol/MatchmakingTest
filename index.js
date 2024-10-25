const express = require('express');
const app = express();
app.use(express.json());

// Usa la porta definita dall'ambiente, o 3000 in locale
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server API in ascolto su http://localhost:${PORT}`);
});

// Mappa dei server attivi, dove `gameTag` è la chiave per ogni gruppo di server
let servers = {};

// Endpoint per pubblicare un server
app.post('/publish', (req, res) => {
    const { game, desc, timeout } = req.body;
    if (!game || !desc) {
        return res.status(400).json({ error: 'Dati incompleti.' });
    }

    const serverInfo = JSON.parse(desc);
    servers[game] = servers[game] || [];
    servers[game].push({
        ...serverInfo,
        expiresAt: Date.now() + timeout * 1000,
    });

    return res.json({ message: 'Server pubblicato con successo.' });
});

// Endpoint per ottenere la lista dei server
app.get('/list', (req, res) => {
    const { game } = req.query;
    if (!game || !servers[game]) {
        return res.json([]);
    }

    const now = Date.now();
    servers[game] = servers[game].filter(server => server.expiresAt > now);
    return res.json(servers[game]);
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
