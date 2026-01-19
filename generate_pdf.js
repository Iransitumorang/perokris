const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

    console.log('Membuka file:', filePath);
    await page.goto(filePath, { waitUntil: 'networkidle2' });

    // Set viewport to a realistic desktop size
    await page.setViewport({ width: 1440, height: 900 });

    // Hide video for PDF as it would just be a black/empty box usually, 
    // or let it be if it captures the first frame.
    // Better to hide elements that don't make sense in print
    await page.addStyleTag({ content: 'video { display: none !important; } header { position: static !important; } .hero { min-height: auto !important; padding-top: 50px !important; }' });

    await page.pdf({
        path: 'Filosofi-Logo-Perokris.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    console.log('PDF berhasil dibuat: Filosofi-Logo-Perokris.pdf');
})();
