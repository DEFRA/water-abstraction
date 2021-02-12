/* eslint-disable no-undef */

// const { loginAsUser } = require('../shared/helpers/login-as-user');
const { baseUrl, userEmails } = require('./config');
// const { getPageTitle } = require('../shared/helpers/page');

describe('view licences as an external user', () => {
  it('sees the licences table', () => {
    browser.navigateTo(`${baseUrl}/signin`);
    console.log(browser.getUrl());
    let emailField = $('#email');
    emailField.setValue(userEmails.external);
    let passwordField = $('#password');
    passwordField.setValue('P@55word');
    const title1 = $('h1[class="govuk-heading-l"]');
    title1.getText();
    console.log(browser.getUrl());
    const signInButton = $('button=Sign in');
    const title = $('h1[class="govuk-heading-l"]');
    expect(title).toHaveText('Sign in');
    console.log(browser.getUrl());
    signInButton.click();
    console.log(browser.getUrl());
    const title2 = $('h1[class="govuk-heading-l"]');
    title2.waitForExist({ timeout: 60000, interval: 5000 });
    expect(title2).toHaveText('Your licences');
  });

  // it('sees the three licences created by the setup routine', () => {
  //   console.log(browser.getUrl());
  //   login();
  // const table = $('#results');
  // expect(table).toHaveTextContaining('AT/CURR/DAILY/01');
  // expect(table).toHaveTextContaining('AT/CURR/WEEKLY/01');
  // expect(table).toHaveTextContaining('AT/CURR/MONTHLY/01');
  // expect(table).not.toHaveTextContaining('AT/CURR/XXXXXX/01');
  // });

  // it('clicks on the DAILY licence', () => {
  //   browser.getUrl();
  //     const dailyLicenceLink = $('*=DAILY');
  //     dailyLicenceLink.click();

  //     const licencePageHeader = getPageTitle();

  //     expect(licencePageHeader).toBeDisplayed();

  //   expect(licencePageHeader).toHaveTextContaining('Licence number AT/CURR/DAILY/01');
  // });

  // it('sees the Summary table', () => {
  //   const table = $('#summary');

  //   expect(table).toBeVisible();
  // });

  // it('checks that the abstraction point is correct, for funsies', () => {
  //   const table = $('#summary');

  //   expect(table).toHaveTextContaining('At National Grid Reference TQ 123 123 (Test local name)');
  // });
});
