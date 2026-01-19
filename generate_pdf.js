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

        // CSS khusus untuk PDF: perbaikan visibilitas dan spacing
        await page.addStyleTag({
            content: `
                video, .download-btn { display: none !important; } 
                header { 
                    position: relative !important; 
                    top: 0 !important; 
                    left: 0 !important; 
                    transform: none !important; 
                    width: 100% !important; 
                    background: #020617 !important; 
                    margin-bottom: 50px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    padding: 60px !important;
                } 
                .header-logo {
                    height: 60px !important;
                    margin-right: 20px !important;
                }
                .header-title {
                    position: relative !important;
                    left: 0 !important;
                    transform: none !important;
                    color: #fbbf24 !important;
                    font-size: 2rem !important;
                    -webkit-text-fill-color: #fbbf24 !important;
                }
                body { background: #020617 !important; }
                .hero { 
                    min-height: auto !important; 
                    padding-top: 50px !important; 
                }
                .philosophy-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
                .philosophy-card { break-inside: avoid; margin-bottom: 20px !important; padding: 20px !important; }
                .large-card { flex-direction: column !important; text-align: center !important; }
                .container { padding-top: 20px !important; }
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
