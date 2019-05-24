/**
* HAPI redirect plugin
* If the user landed on a page with UTM tracking codes, but the controller
* wishes to redirect (301/302 status code), we render an HTML page so GA
* can track before redirecting.
*
* @module lib/hapi-redirect-plugin
*/

const onPreResponse = async (request, h) => {
  // Detect redirect
  const { statusCode } = request.response;
  if ([301, 302].includes(statusCode)) {
    // Get utm codes
    const { utm_source: utmSource, utm_medium: utmMedium, utm_campaign: utmCampaign } = request.query;

    if (utmSource || utmMedium || utmCampaign) {
      // Build the URL being redirected to
      const { location: redirectUrl } = request.response.headers;

      const { view } = request;

      // Render HTML page with tracking code and JS / meta tag redirect
      return h.view('water/redirect', {
        ...view,
        redirectUrl
      }, { layout: 'blank' });
    }
  }

  // Continue processing request
  return h.continue;
};

const redirectPlugin = {
  register: (server, options) => {
    server.ext({
      type: 'onPreResponse',
      method: onPreResponse
    });
  },

  pkg: {
    name: 'redirectPlugin',
    version: '2.0.0'
  }
};

module.exports = redirectPlugin;
