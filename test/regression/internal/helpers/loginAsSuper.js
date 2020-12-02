/* eslint-disable no-undef */

const loginAsSuperUser = async (instanceOfBrowser) => {
  await browser.url('http://localhost:8008/signin');

  let emailField = await $('#email');
  await emailField.setValue('regression.tests@defra.gov.uk');

  let passwordField = await $('#password');
  await passwordField.setValue('regression.tests#100');

  let SignInButton = await $('button[class="govuk-button govuk-button--start"]');
  await SignInButton.click();

  await $('#navbar-notifications').isDisplayed;

  return browser;
};

exports.loginAsSuperUser = loginAsSuperUser;