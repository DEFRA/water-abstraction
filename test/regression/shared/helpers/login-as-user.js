/* eslint-disable no-undef */

const loginAsUser = (baseUrl, userEmail) => {
  try {
    browser.url(`${baseUrl}/signin`);
    const title = $('h1[class="govuk-heading-l"]');
    const titleText = title.getText();
    console.log(titleText);
    const SignInButton = $('button[class="govuk-button govuk-button--start"]');

    let emailField = $('#email');
    emailField.setValue(userEmail);

    let passwordField = $('#password');
    passwordField.setValue('P@55word');

    SignInButton.click();
    browser.pause(500);
  } catch (err) {
    console.log(err);
  }
};

exports.loginAsUser = loginAsUser;
