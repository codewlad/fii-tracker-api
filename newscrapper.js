const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeData() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const url = 'https://www.fundsexplorer.com.br/ranking';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extrair o HTML da página
    const pageHTML = await page.content();

    // Configurar o cabeçalho personalizado
    await page.setExtraHTTPHeaders({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    });

    // Busca a tabela no conteúdo extraído
    const tableRegex = /<table([\s\S]*?)<\/table>/g;
    const tableMatches = pageHTML.match(tableRegex);

    if (tableMatches) {
        for (const tableContent of tableMatches) {
            // Extrair os dados da tabela HTML
            const $ = cheerio.load(tableContent);
            const dataRows = $('tbody tr');

            // Função para extrair os dados de uma linha da tabela e criar um objeto
            function extractRowData(row) {
                const cells = $(row).find('td');
                const paper = $(cells[0]).text();
                const sector = $(cells[1]).text();
                const paperValue = parseFloat($(cells[2]).text().replace(',', '.'));
                const liquidity = parseFloat($(cells[3]).text().replace(/\./g, '').replace(',', '.'));
                const dividend = parseFloat($(cells[5]).text().replace(',', '.'));
                const dividendYield = parseFloat($(cells[6]).text().replace(',', '.').replace(' %', ''));
                const averageDividendYieldFor12Months = parseFloat($(cells[12]).text().replace(',', '.').replace(' %', ''));
                const pVpa = parseFloat($(cells[19]).text().replace(',', '.'));
                const amountOfAssets = parseInt($(cells[26]).text());
            
                return {
                paper,
                sector,
                paperValue,
                liquidity,
                dividend,
                dividendYield,
                averageDividendYieldFor12Months,
                pVpa,
                amountOfAssets,
                // Adicione mais propriedades conforme necessário
                };
            }
            
            // Transformar os dados das linhas em um array de objetos
            const fiisData = [];
            dataRows.each((index, row) => {
                const rowData = extractRowData(row);
                fiisData.push(rowData);
            });
            
            return fiisData;
        }
    } else {
        console.log('Nenhuma tabela encontrada.');
    }

    await browser.close();
}

module.exports = {
    scrapeData,
};