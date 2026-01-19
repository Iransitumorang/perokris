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

        // Gunakan path absolut yang benar-benar bersih untuk Windows
        const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

        console.log('Membuka file:', filePath);
        // Tunggu sampai network benar-benar idle dan semua asset (termasuk logo) termuat
        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 90000 });

        // Set viewport besar untuk memastikan layout desktop ter-render dulu
        await page.setViewport({ width: 1440, height: 1200 });

        // CSS KHUSUS UNTUK PDF: Memperbaiki semua masalah tampilan
        await page.addStyleTag({
            content: `
                /* 1. Sembunyikan elemen video dan tombol download */
                video, .download-btn { display: none !important; } 
                
                /* 2. Header: Pastikan logo dan judul kelihatan & tidak mepet */
                header { 
                    position: relative !important; 
                    top: 0 !important; 
                    left: 0 !important; 
                    transform: none !important; 
                    width: 100% !important; 
                    background: #020617 !important; 
                    margin-bottom: 80px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    padding: 80px 20px !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                } 
                .header-logo {
                    display: block !important;
                    height: 80px !important;
                    width: auto !important;
                    margin-right: 30px !important;
                    background: white !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    -webkit-print-color-adjust: exact !important;
                }
                .header-title {
                    display: block !important;
                    position: relative !important;
                    left: 0 !important;
                    transform: none !important;
                    color: #fbbf24 !important;
                    font-size: 2.5rem !important;
                    font-weight: 800 !important;
                    background: none !important;
                    -webkit-text-fill-color: #fbbf24 !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    text-transform: uppercase !important;
                }

                /* 3. Perbaiki Background */
                body { 
                    background: #020617 !important; 
                    -webkit-print-color-adjust: exact !important;
                }

                /* 4. Kurangi Jarak Hero (Video diganti space) */
                .hero { 
                    min-height: auto !important; 
                    padding: 0 !important;
                    margin-bottom: 50px !important;
                }

                /* 5. Perbaiki Salib sebagai Batu Penjuru (Biar tidak mepet) */
                .info-section {
                    margin-top: 60px !important;
                    padding: 80px 40px !important;
                    page-break-inside: avoid !important;
                }
                .info-content h2 {
                    margin-top: 20px !important;
                    color: white !important;
                }

                /* 6. Aturan Layout Grid */
                .philosophy-grid { 
                    display: grid !important; 
                    grid-template-columns: 1fr 1fr !important; 
                    gap: 30px !important; 
                }
                .philosophy-card { 
                    page-break-inside: avoid !important; 
                    margin-bottom: 30px !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    -webkit-print-color-adjust: exact !important;
                }

                /* 7. Footer: Biar tidak misah sendiri di halaman terakhir sendirian */
                footer {
                    page-break-before: avoid !important;
                    padding: 40px !important;
                    background: #020617 !important;
                    color: #64748b !important;
                }
            `
        });

        console.log('Mencetak PDF...');
        await page.pdf({
            path: 'Filosofi-Logo-Perokris.pdf',
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' } // Kita pakai padding CSS saja
        });

        console.log('BERHASIL: Filosofi-Logo-Perokris.pdf telah diperbarui.');
    } catch (error) {
        console.error('ERROR saat membuat PDF:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
