const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    let browser;
    let tempHtmlPath = null;
    try {
        console.log('Memulai proses PDF...');
        
        // BACA HTML DAN INJECT BASE64 LANGSUNG
        console.log('Membaca dan mengonversi gambar ke base64...');
        const htmlPath = path.join(__dirname, 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Cari semua gambar di HTML
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const imageFiles = [];
        let match;
        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const imgSrc = match[1];
            if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
                imageFiles.push(imgSrc);
            }
        }
        
        const uniqueImages = [...new Set(imageFiles)];
        console.log(`Ditemukan ${uniqueImages.length} gambar:`, uniqueImages);
        
        // Konversi semua gambar ke base64
        for (const imgFile of uniqueImages) {
            try {
                const imgPath = path.join(__dirname, imgFile);
                if (fs.existsSync(imgPath)) {
                    const imgBuffer = fs.readFileSync(imgPath);
                    const base64 = imgBuffer.toString('base64');
                    const ext = path.extname(imgFile).slice(1).toLowerCase();
                    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'png' ? 'png' : ext === 'gif' ? 'gif' : ext === 'svg' ? 'svg+xml' : 'png';
                    const base64Data = `data:image/${mimeType};base64,${base64}`;
                    
                    // Replace semua kemunculan gambar ini di HTML
                    const escapedSrc = imgFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`src=["']${escapedSrc}["']`, 'gi');
                    htmlContent = htmlContent.replace(regex, `src="${base64Data}"`);
                    console.log(`✓ ${imgFile} di-inject ke HTML (${(imgBuffer.length / 1024).toFixed(1)} KB)`);
                } else {
                    console.log(`⚠ File tidak ditemukan: ${imgFile}`);
                }
            } catch (err) {
                console.log(`⚠ Error membaca ${imgFile}:`, err.message);
            }
        }
        
        // Simpan HTML sementara dengan base64
        tempHtmlPath = path.join(__dirname, 'temp_pdf.html');
        fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
        console.log('✓ HTML dengan base64 disimpan ke temp_pdf.html');
        
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });
        const page = await browser.newPage();

        // Nonaktifkan cache
        await page.setCacheEnabled(false);

        const filePath = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
        console.log('Membuka file:', filePath);

        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 90000 });

        // Verifikasi gambar sudah base64 dan ter-load
        console.log('Memverifikasi gambar...');
        const imageStatus = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).map((img, idx) => ({
                index: idx,
                loaded: img.complete && img.naturalHeight !== 0 && img.naturalWidth !== 0,
                dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
                isBase64: img.src.startsWith('data:')
            }));
        });
        console.log('Status gambar:');
        imageStatus.forEach(status => {
            console.log(`  [${status.index}] ${status.loaded ? '✓' : '✗'} ${status.dimensions} ${status.isBase64 ? '(base64)' : '(file)'}`);
        });

        // Tunggu semua gambar ter-load
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images).map((img) => {
                    if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 5000);
                    });
                })
            );
        });

        // Tunggu render
        await new Promise(r => setTimeout(r, 2000));

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

                /* HEADER KHUSUS PDF - Spacing lebih elegan */
                header { 
                    position: relative !important; 
                    top: 0 !important; left: 0 !important; transform: none !important;
                    width: 100% !important;
                    background: #020617 !important; 
                    padding: 60px 40px 50px 40px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-bottom: 2px solid #1e293b !important;
                    margin-bottom: 50px !important;
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

                .container { 
                    padding: 30px 50px 40px 50px !important; 
                    max-width: 100% !important; 
                }

                /* Judul Dimensi Rohani */
                .section-head h2 {
                    font-size: 3rem !important;
                    color: #fbbf24 !important;
                    -webkit-text-fill-color: #fbbf24 !important;
                    text-align: center !important;
                    font-weight: 800 !important;
                    margin-top: 20px !important;
                    margin-bottom: 50px !important;
                    text-transform: uppercase !important;
                    animation: none !important;
                }

                /* Grid Filosofi */
                .philosophy-grid { 
                    display: grid !important; 
                    grid-template-columns: 1fr 1fr !important; 
                    gap: 35px !important;
                    margin-bottom: 50px !important;
                }
                .philosophy-card.gold-card, .philosophy-card.large-card { 
                    grid-column: 1 / -1 !important; 
                }
                .philosophy-card { 
                    background: #0f172a !important; 
                    border: 1px solid #1e293b !important; 
                    padding: 45px 40px !important;
                    border-radius: 40px !important;
                    page-break-inside: avoid !important;
                    margin-bottom: 10px !important;
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
                img { 
                    max-width: 100% !important; 
                    height: auto !important; 
                    display: block !important; 
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
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                /* Logo lebih besar untuk card Salib Emas, Alkitab Terbuka, Burung Merpati di PDF */
                .philosophy-card:not(.large-card) .card-logo-icon {
                    width: 220px !important;
                    height: 220px !important;
                    padding: 25px !important;
                }
                .header-logo,
                .footer-logo,
                .card-logo-icon {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                .header-logo img,
                .footer-logo img,
                .card-logo-icon img {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
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
                    padding: 60px 50px !important; 
                    border-radius: 40px !important;
                    margin: 50px 0 !important;
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
                    padding: 60px 40px 50px 40px !important; 
                    background: #020617 !important; 
                    text-align: center !important;
                    border-top: 2px solid #1e293b !important;
                    margin-top: 50px !important;
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            displayHeaderFooter: false
        });

        console.log('BERHASIL: Filosofi-Logo-Perokris.pdf telah diperbarui.');
        const stats = fs.statSync('Filosofi-Logo-Perokris.pdf');
        console.log(`Ukuran: ${(stats.size / 1024).toFixed(0)} KB`);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        if (browser) await browser.close();
        // Hapus file temp
        if (tempHtmlPath && fs.existsSync(tempHtmlPath)) {
            try {
                fs.unlinkSync(tempHtmlPath);
                console.log('✓ File temp dihapus');
            } catch (e) {
                console.log('⚠ Gagal hapus temp file:', e.message);
            }
        }
    }
})();
