const driver = require('puppeteer');

describe('Tests',() => {
    jest.setTimeout(15000);
    let browser, page;

    beforeEach(async () => {
        browser = await driver.launch({
            headless: true,
            args: ['--no-sandbox'],
        });
        page = await browser.newPage();
        await page.goto('https://emkn.ru/login/');
    })

    afterEach(async () => {
        await browser.close();
    })

    test('Correct page title', async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Войти');
    })

    test("Form exists", async () => {
        const navbar = await page.$eval('form', el => (!!el));
        expect(navbar).toBe(true);
    })

    test("Correct footer title", async () => {
        const footerTitleText = await page.$eval('div[class="col-xs-12 text-center"]', el => el.textContent);
        expect(footerTitleText).toEqual("МКН СПбГУ, 2019–20 гг.");
    })

    test("Hints exist", async () => {
        const hint = await page.$eval('input[placeholder="Пароль"]', el => (!!el));
        expect(hint).toBe(true);
    })

    test("Random incorrect input", async () => {
        let email = "мем приколдес";
        let password = "а где";

        await page.$eval('input[name="username"]', (el, email) => {el.value = email}, email);

        await page.$eval('input[name="password"]', (el, password) => {el.value = password}, password);

        await page.$eval('input[type="submit"]', el => el.click())

        await page.waitFor(1000);
        const error = await page.waitForSelector('span.error-message');

        expect(error).not.toEqual(null);
    })

    test("Correct redirect clicking 'Забыли пароль?'", async () => {
        await page.click('a.forgot');

        expect(page.url()).toEqual("https://emkn.ru/password_reset/");
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Восстановление пароля');
    });

    test("Random incorrect input (email)", async () => {
        let email = "мем приколдес";
        await page.goto("https://emkn.ru/password_reset/")

        await page.$eval('input[name="email"]', (el, email) => {el.value = email}, email);
        await page.$eval('input[type="submit"]', el => el.click())

        await page.waitFor(2000);
        const errorMessage = await page.$eval('span.error-message', el => el.textContent);
        expect(errorMessage).toMatch(/Введите корректный адрес электронной почты./);
    })

    test("Correct input (email) submit", async () => {
        let email = "example@mail.ru";
        await page.goto("https://emkn.ru/password_reset/")

        await page.$eval('input[name="email"]', (el, email) => {el.value = email}, email);
        await page.$eval('input[type="submit"]', el => el.click())

        await page.waitFor(1000);

        expect(page.url()).toEqual('https://emkn.ru/password_reset/done/');

        const res = await page.$eval('div.container-box', el => el.textContent);
        expect(res).toMatch(/Инструкции по смене пароля были высланы на указанный почтовый адрес./);
    })
})
