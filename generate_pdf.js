const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    let browser;
    try {
        console.log('Menjalankan Puppeteer...');
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });
        const page = await browser.newPage();
        const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

        console.log('Membuka file:', filePath);
        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 90000 });

        // Jeda tambahan agar semua rendering selesai
        await new Promise(r => setTimeout(r, 2000));

        await page.setViewport({ width: 1440, height: 2500 });

        await page.addStyleTag({
            content: `
                video, .download-btn { display: none !important; } 
                
                header { 
                    position: relative !important; 
                    top: 0 !important; transform: none !important; left: 0 !important;
                    width: 100% !important;
                    background: #020617 !important; 
                    padding: 60px !important;
                    margin-bottom: 40px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    border: none !important;
                }
                .header-logo { 
                    height: 80px !important; 
                    margin-right: 30px !important; 
                    display: block !important; 
                    background: white !important;
                    padding: 5px !important;
                    border-radius: 10px !important;
                    -webkit-print-color-adjust: exact !important;
                }
                .header-title { 
                    font-size: 2.8rem !important; 
                    color: #fbbf24 !important; 
                    -webkit-text-fill-color: #fbbf24 !important;
                    display: block !important;
                    text-transform: uppercase !important;
                    font-weight: 800 !important;
                }

                .philosophy-card h3::after, .info-content h2::after {
                    -webkit-print-color-adjust: exact !important;
                    background: #fbbf24 !important;
                    display: block !important;
                }

                body { background: #020617 !important; -webkit-print-color-adjust: exact !important; }
                .hero { display: none !important; }
                .container { padding-top: 20px !important; }
                .info-section { margin-top: 50px !important; padding: 60px 40px !important; border-radius: 40px !important; background: #0f172a !important; }
                .philosophy-card { break-inside: avoid; background: #0f172a !important; border: 1px solid #334155 !important; margin-bottom: 30px !important; }
                .phil-list li { background: #334155 !important; color: #fbbf24 !important; border: 1px solid #fbbf24 !important; }
                footer { padding: 60px !important; background: #020617 !important; }
                .footer-line { background: #fbbf24 !important; }
            `
        });

        console.log('Mencetak PDF...');
        await page.pdf({
            path: 'Filosofi-Logo-Perokris.pdf',
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        console.log('BERHASIL: Filosofi-Logo-Perokris.pdf telah diperbarui.');
    } catch (error) {
        console.error('ERROR saat membuat PDF:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
