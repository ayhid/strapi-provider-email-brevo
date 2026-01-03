import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../common';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register the plugin
  strapi.log.info(`[${PLUGIN_ID}] Plugin registered`);
};

export default register;
