const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');
const path = require('path');

const readdir = util.promisify(fs.readdir);

const GROUPSIZE = 5;

const scrape = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: path.join(__dirname, './chrome/chrome.exe'),
    });
    const pathNames = await readdir(`${__dirname}/images`);
    const requests = pathNames.map(path => () => scrapePage(browser, path));

    const promiseGroups = [];
    for (let i = 0; i < requests.length; i += GROUPSIZE) {
        promiseGroups.push(requests.slice(i, i + GROUPSIZE));
    }
    await runByQueue(promiseGroups);

    browser.close();
    console.log('下载完成，请查看默认下载目录');
};

const runByQueue = async (groups) => {
    for (let promises of groups) {
        await Promise.all(promises.map(func => func()));
    }
}

const scrapePage = async (browser, path) => {
    const pageUrl = `https://acpatterns.com/editor`;
    const page = await browser.newPage();
    await page.setViewport({
        width: 1280,
        height: 768,
        deviceScaleFactor: 1,
      });
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 0,
    });

    await editPatternDetail(page, path);
    await convertImage(page, path);
    await downloadQRCode(page);

    await page.waitFor(1000);
    page.close();
};

const editPatternDetail = async (page, path) => {
    await page.click('button.editInfo');
    await page.waitFor(1000);
    await page.focus('.edit-info input');
    await deleteAll(page);
    await page.type('.edit-info input', path.slice(0, path.lastIndexOf('.')), { delay: 100 });
    await page.type('.edit-info span:nth-child(2) input', '1', { delay: 100 });
    await page.type('.edit-info span:nth-child(3) input', '1', { delay: 100 });
    await page.click('.edit-buttons button:nth-child(3)');
}

const deleteAll = async (page) => {
    await page.keyboard.down('ControlLeft');
    await page.keyboard.down('KeyA');
    await page.keyboard.up('KeyA');
    await page.keyboard.up('ControlLeft');
    await page.keyboard.press('Backspace');
}

const convertImage = async (page, path) => {
    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('.tool-buttons button:nth-child(2)'),
    ]);
    await fileChooser.accept([`${__dirname}/images/${path}`]);

    await page.evaluate(() => {
        const inputDOM = document.querySelectorAll('input[type="file"]')[1];
        const event = document.createEvent("HTMLEvents");
        event.initEvent("change", false, true);
        inputDOM.dispatchEvent(event);
    });
    await page.waitFor(1000);
    await page.click('.cropper-container button:last-child');
}

const downloadQRCode = async (page) => {
    await page.click('.buttons button:last-child');
    await page.click('.tool-buttons button:last-child');
    await page.click('.modal-window.modal-centered button');
}

scrape();
