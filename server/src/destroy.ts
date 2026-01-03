import type { Core } from '@strapi/strapi';

const destroy = ({ strapi }: { strapi: Core.Strapi }) => {
  // Cleanup on shutdown
};

export default destroy;
