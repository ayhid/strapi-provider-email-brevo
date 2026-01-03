import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../common';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Initialize plugin on startup
  const settings = await strapi.plugin(PLUGIN_ID).service('settings').getSettings();

  if (settings.enabled) {
    strapi.log.info(`[${PLUGIN_ID}] Plugin enabled with sender: ${settings.defaultFrom}`);
  } else {
    strapi.log.info(`[${PLUGIN_ID}] Plugin disabled - emails will be logged to console`);
  }
};

export default bootstrap;
