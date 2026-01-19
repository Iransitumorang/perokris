const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    let browser;
    try {
        console.log('Memulai proses PDF...');
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });
        const page = await browser.newPage();

        // Nonaktifkan cache agar selalu ambil yang terbaru
        await page.setCacheEnabled(false);

        const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
        console.log('Membuka file:', filePath);

        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 90000 });

        // Beri waktu tambahan untuk render font & image
        await new Promise(r => setTimeout(r, 4000));

        await page.setViewport({ width: 1280, height: 4000 });

        // CSS Override untuk PDF yang Bersih & Akurat
        await page.addStyleTag({
            content: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

                /* Hilangkan elemen yang tidak diperlukan di PDF */
                video, .download-btn, .cosmic-bg, .hero, canvas { display: none !important; }

                * { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }

                body { 
                    background: #020617 !important; 
                    color: #ffffff !important; 
                    font-family: 'Outfit', sans-serif !important; 
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* HEADER KHUSUS PDF */
                header { 
                    position: relative !important; 
                    top: 0 !important; left: 0 !important; transform: none !important;
                    width: 100% !important;
                    background: #020617 !important; 
                    padding: 80px 40px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-bottom: 2px solid #1e293b !important;
                    margin-bottom: 40px !important;
                }
                .header-logo { 
                    height: 100px !important; 
                    width: auto !important;
                    margin-bottom: 20px !important; 
                    background: white !important;
                    padding: 10px !important;
                    border-radius: 15px !important;
                    display: block !important;
                }
                .header-title { 
                    font-size: 3rem !important; 
                    color: #fbbf24 !important; 
                    -webkit-text-fill-color: #fbbf24 !important;
                    display: block !important;
                    text-transform: uppercase !important;
                    font-weight: 800 !important;
                    letter-spacing: 3px !important;
                    text-align: center !important;
                    animation: none !important;
                }

                .container { padding: 20px 50px !important; max-width: 100% !important; }

                /* Judul Dimensi Rohani */
                .section-head h2 {
                    font-size: 3rem !important;
                    color: #fbbf24 !important;
                    -webkit-text-fill-color: #fbbf24 !important;
                    text-align: center !important;
                    font-weight: 800 !important;
                    margin-bottom: 60px !important;
                    text-transform: uppercase !important;
                    animation: none !important;
                }

                /* Grid Filosofi */
                .philosophy-grid { 
                    display: grid !important; 
                    grid-template-columns: 1fr 1fr !important; 
                    gap: 40px !important;
                    margin-bottom: 60px !important;
                }
                .philosophy-card.gold-card, .philosophy-card.large-card { 
                    grid-column: 1 / -1 !important; 
                }
                .philosophy-card { 
                    background: #0f172a !important; 
                    border: 1px solid #1e293b !important; 
                    padding: 40px !important;
                    border-radius: 40px !important;
                    page-break-inside: avoid !important;
                }
                .philosophy-card h3 { 
                    color: #fbbf24 !important; 
                    font-size: 2.2rem !important;
                    font-weight: 800 !important;
                    margin-bottom: 20px !important;
                }
                .philosophy-card h3::after {
                    content: '' !important;
                    display: block !important;
                    width: 60px !important;
                    height: 4px !important;
                    background: #fbbf24 !important;
                    margin-top: 10px !important;
                }
                .philosophy-card p { 
                    color: #cbd5e1 !important; 
                    line-height: 1.7 !important; 
                    font-size: 1.2rem !important;
                }
                .card-logo-icon { 
                    width: 180px !important; 
                    height: 180px !important; 
                    background: rgba(255, 255, 255, 0.95) !important; 
                    padding: 20px !important; 
                    border-radius: 30px !important; 
                    margin-bottom: 25px !important; 
                    display: block !important; 
                    object-fit: contain !important; 
                }
                /* Logo lebih besar untuk card Salib Emas, Alkitab Terbuka, Burung Merpati di PDF */
                .philosophy-card:not(.large-card) .card-logo-icon {
                    width: 220px !important;
                    height: 220px !important;
                    padding: 25px !important;
                }

                /* List Item */
                .phil-list, .phil-list-simple {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 12px !important;
                    margin-top: 25px !important;
                    padding: 0 !important;
                    list-style: none !important;
                }
                .phil-list li {
                    background: #1e293b !important;
                    color: #fbbf24 !important;
                    border: 1px solid #fbbf24 !important;
                    padding: 8px 15px !important;
                    border-radius: 10px !important;
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                }

                /* Info Section (Batu Penjuru) */
                .info-section { 
                    background: #0f172a !important; 
                    padding: 70px 50px !important; 
                    border-radius: 40px !important;
                    margin: 80px 0 !important;
                    text-align: center !important;
                    border: 1px solid #1e293b !important;
                    page-break-inside: avoid !important;
                }
                .info-tag { 
                    color: #fbbf24 !important; 
                    font-weight: 800 !important; 
                    font-size: 1.2rem !important;
                }
                .info-tag::after {
                    content: '' !important;
                    display: block !important;
                    width: 70px !important;
                    height: 4px !important;
                    background: #fbbf24 !important;
                    margin: 15px auto !important;
                }
                .info-content h2 { font-size: 3.5rem !important; margin: 30px 0 !important; }
                .info-details-grid { display: block !important; }
                .info-details-grid p { font-size: 1.3rem !important; margin-bottom: 25px !important; }

                /* Footer */
                footer { 
                    padding: 80px 40px !important; 
                    background: #020617 !important; 
                    text-align: center !important;
                    border-top: 2px solid #1e293b !important;
                    page-break-inside: avoid !important;
                }
                .footer-logo { height: 70px !important; margin-bottom: 20px !important; }
                .org-name { color: #ffffff !important; font-size: 1.5rem !important; font-weight: 800 !important; }
                .motto { color: #fbbf24 !important; font-size: 1.2rem !important; font-style: italic !important; margin-top: 20px !important; }
            `
        });

        console.log('Mencetak PDF...');
        await page.pdf({
            path: 'Filosofi-Logo-Perokris.pdf',
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            displayHeaderFooter: false
        });

        console.log('BERHASIL: Filosofi-Logo-Perokris.pdf telah diperbarui.');
        const stats = fs.statSync('Filosofi-Logo-Perokris.pdf');
        console.log(`Ukuran: ${(stats.size / 1024).toFixed(0)} KB`);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
