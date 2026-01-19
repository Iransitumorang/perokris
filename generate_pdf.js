const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    let browser;
    try {
        console.log('Menjalankan Puppeteer...');
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

        console.log('Membuka file:', filePath);
        await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.setViewport({ width: 1440, height: 900 });

        // CSS khusus untuk PDF: sembunyikan video & tombol download
        await page.addStyleTag({
            content: `
                video, .download-btn { display: none !important; } 
                header { position: static !important; background: #020617 !important; } 
                body { background: #020617 !important; }
                .hero { min-height: auto !important; padding: 50px 2rem !important; }
                .philosophy-card { break-inside: avoid; }
            `
        });

        console.log('Mencetak PDF...');
        await page.pdf({
            path: 'Filosofi-Logo-Perokris.pdf',
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        console.log('BERHASIL: Filosofi-Logo-Perokris.pdf telah dibuat.');
    } catch (error) {
        console.error('ERROR saat membuat PDF:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
