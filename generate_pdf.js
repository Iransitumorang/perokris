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

        // Jeda agar rendering asset dan font sempurna
        await new Promise(r => setTimeout(r, 2000));

        await page.setViewport({ width: 1440, height: 3500 });

        await page.addStyleTag({
            content: `
                video, .download-btn, .cosmic-bg { display: none !important; } 
                
                header { 
                    position: relative !important; 
                    top: 0 !important; transform: none !important; left: 0 !important;
                    width: 100% !important;
                    background: #020617 !important; 
                    padding: 80px 40px !important;
                    margin-bottom: 20px !important;
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
                    padding: 4px !important;
                    border-radius: 12px !important;
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

                /* Underlines visibility in PDF */
                .philosophy-card h3::after, .info-tag::after {
                    -webkit-print-color-adjust: exact !important;
                    background: #fbbf24 !important;
                    display: block !important;
                    height: 3px !important;
                }

                body { background: #020617 !important; -webkit-print-color-adjust: exact !important; color: white !important; }
                .hero { display: none !important; }
                
                .philosophy-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
                .philosophy-card.gold-card, .philosophy-card.large-card { grid-column: 1 / -1 !important; }
                .philosophy-card { 
                    page-break-inside: avoid !important; 
                    background: #0f172a !important; 
                    border: 1px solid #1e293b !important; 
                    margin-bottom: 25px !important; 
                }

                /* Paksa List sebaris di PDF */
                .phil-list {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: nowrap !important;
                    justify-content: space-between !important;
                }
                .phil-list li {
                    background: #1e293b !important;
                    color: #fbbf24 !important;
                    border: 1px solid #fbbf24 !important;
                    flex: 1 !important;
                    font-size: 10px !important;
                    padding: 5px 2px !important;
                    text-align: center !important;
                }

                .info-section { background: #0f172a !important; padding: 60px 40px !important; border-radius: 40px !important; break-inside: avoid; }
                footer { padding: 80px 40px !important; background: #020617 !important; }
                .footer-line { background: #fbbf24 !important; height: 1px !important; }
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
