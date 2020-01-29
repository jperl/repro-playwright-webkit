const assert = require("assert");
const playwright = require("playwright");

const test = async type => {
  const browser = await playwright[type].launch({ headless: false });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.exposeFunction("clickCallback", () => {
    numReceived += 1;
  });

  await page.evaluateOnNewDocument(() => {
    if (!window._clickHandlerSetup) {
      window._clickHandlerSetup = true;

      document.addEventListener("click", () => clickCallback(), {
        capture: true,
        passive: true
      });
    }
  });

  await page.goto("http://google.com");

  let numReceived = 0;

  const handle = await page.$('zs="About"');
  await handle.click();
  await page.waitForNavigation();

  assert.strictEqual(
    numReceived,
    1,
    `incorrect number of callbacks for ${type}`
  );

  await browser.close();
};

test("chromium");
test("firefox");
test("webkit");
