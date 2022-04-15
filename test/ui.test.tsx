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
        const footer = await page.$('div[class="col-xs-12 text-center"]')
        const footerTitleText = await footer.evaluate(el => el.textContent);
        expect(footerTitleText).toEqual("МКН СПбГУ, 2019–20 гг.");
    })

    test("Hints exist", async () => {
        const hint = await page.$('input[placeholder="Пароль"]');
        const hintContent = hint.evaluate(el => (!!el));
        !expect(hintContent);
    })

    test("Random incorrect input", async () => {
        let email = "мем приколдес";
        let password = "а где";

        const username = await page.$('input[name="username"]');
        await username.evaluate((username, email) => {username.value = email}, email);

        const passwordCheck = await page.$('input[name="password"]');
        await passwordCheck.evaluate((passwordCheck, password) => {passwordCheck.value = password}, password);

        const submitButton = await page.$('input[type="submit"]');
        await submitButton.click();

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

        const mail = await page.$('input[name="email"]');
        await mail.evaluate((mail, email) => {mail.value = email}, email);

        const submitButton = await page.$('input[type="submit"]');
        await submitButton.click();

        await page.waitFor(2000);

        const error = await page.$('span.error-message');
        const errorMessage = await error.evaluate(el => el.textContent)
        expect(errorMessage).toMatch(/Введите корректный адрес электронной почты./);
    })

    test("Correct input (email) submit", async () => {
        let email = "example@mail.ru";
        await page.goto("https://emkn.ru/password_reset/")

        const mail = await page.$('input[name="email"]');
        await mail.evaluate((mail, email) => {mail.value = email}, email);

        const submitButton = await page.$('input[type="submit"]');
        await submitButton.click();

        await page.waitFor(1000);

        expect(page.url()).toEqual('https://emkn.ru/password_reset/done/');

        const res = await page.$('div.container-box');
        const resText =  await res.evaluate(el => el.textContent);
        expect(resText).toMatch(/Инструкции по смене пароля были высланы на указанный почтовый адрес./);
    })
})
