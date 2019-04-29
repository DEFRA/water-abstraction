const { get } = require('lodash');
const { confirmForm } = require('./forms/confirm');
const helpers = require('./lib/helpers');
const csv = require('../../lib/csv-download');
const batchNotificationsConnector = require('../../lib/connectors/water-service/batch-notifications');

const getPageTitle = (ev) => {
  const name = get(ev, 'metadata.name');
  const titles = {
    'Returns: reminder': 'Send returns reminders'
  };
  return titles[name];
};

/**
 * Renders a page where the user can download a CSV of recipients and confirm
 * sending of the form
 * @param {String} request.params.eventId - the water service event for this message
 */
const getReview = async (request, h) => {
  const ev = await helpers.loadEvent(request);

  const view = {
    ev,
    ...request.view,
    csvPath: `/admin/batch-notifications/csv/${ev.event_id}`,
    form: confirmForm(request, ev.metadata.recipients),
    back: `/admin/returns-notifications/reminders`,
    pageTitle: getPageTitle(ev)
  };
  const options = { layout: false };
  return h.view('nunjucks/batch-notifications/review.njk', view, options);
};

/**
 * Maps a message record from water service to a row in the CSV download
 * @param  {Object} message - scheduled_notification row from water service
 * @return {Object}
 */
const mapCSVRow = message => ({
  ...message.personalisation,
  message_type: message.message_type,
  recipient: message.recipient
});

/**
 * Gets CSV filename
 * @param  {Object} ev - water service event record
 * @return {String}    CSV filename
 */
const getCSVFilename = ev => {
  return `${ev.metadata.name} - ${ev.reference_code}.csv`;
};

/**
 * Downloads a CSV of data for this notification
 * @param {String} request.params.eventId - the water service event for this message
 */
const getRecipientsCSV = async (request, h) => {
  const ev = await helpers.loadEvent(request);
  const messages = await helpers.loadMessages(ev);
  return csv.csvDownload(h, messages.map(mapCSVRow), getCSVFilename(ev));
};

/**
 * Send the notification
 * @param {String} request.params.eventId - the water service event for this message
 */
const postSendNotification = async (request, h) => {
  const { eventId } = request.params;
  const { username } = request.auth.credentials;
  await batchNotificationsConnector.sendReminders(eventId, username);
  return h.redirect(`/admin/batch-notifications/confirmation/${eventId}`);
};

const getConfirmationHeading = (event) => {
  const name = get(event, 'subtype');
  const titles = {
    'returnReminder': 'Return reminders sent'
  };
  return titles[name];
};

/**
 * Renders a confirmation page to show the message is sending
 * @param {String} request.params.eventId - the water service event for this message
 */
const getConfirmation = async (request, h) => {
  const ev = await helpers.loadEvent(request);
  const view = {
    ...request.view,
    event: ev,
    pageTitle: getConfirmationHeading(ev)
  };
  const options = { layout: false };
  return h.view('nunjucks/batch-notifications/confirmation.njk', view, options);
};

exports.getReview = getReview;
exports.getRecipientsCSV = getRecipientsCSV;
exports.postSendNotification = postSendNotification;
exports.getConfirmation = getConfirmation;
