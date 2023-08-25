const express = require('express');
const cors = require('cors');
const app = express();

const newscrapper = require('./newscrapper');

app.use(cors());

app.get('/scrape', async (req, res) => {
    try {
        const scrapedData = await newscrapper.scrapeData();
        res.json(scrapedData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao executar o script.' });
    }
});

const port = 3333;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});