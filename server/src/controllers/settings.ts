import type { Core } from '@strapi/strapi';
import { PLUGIN_ID, validateSettings } from '../../../common';

const settingsController = ({ strapi }: { strapi: Core.Strapi }) => {
  const getService = () => strapi.plugin(PLUGIN_ID).service('settings');

  return {
    async getSettings(ctx: any) {
      try {
        const settings = await getService().getSettings();

        // Mask API key for security (show only last 4 chars)
        const maskedSettings = {
          ...settings,
          apiKey: settings.apiKey
            ? '••••••••' + settings.apiKey.slice(-4)
            : '',
        };

        ctx.body = maskedSettings;
      } catch (error) {
        ctx.throw(500, 'Failed to get settings');
      }
    },

    async updateSettings(ctx: any) {
      try {
        const { body } = ctx.request;

        // Validate settings
        const validation = validateSettings(body);
        if (!validation.valid) {
          ctx.throw(400, JSON.stringify(validation.errors));
        }

        const settings = await getService().updateSettings(body);
        ctx.body = settings;
      } catch (error) {
        if ((error as any).status === 400) {
          throw error;
        }
        ctx.throw(500, 'Failed to update settings');
      }
    },

    async testEmail(ctx: any) {
      try {
        const { to } = ctx.request.body;

        if (!to) {
          ctx.throw(400, 'Recipient email is required');
        }

        const emailService = strapi.plugin(PLUGIN_ID).service('email');
        await emailService.send({
          to,
          subject: 'Brevo Email Test - Strapi',
          text: 'This is a test email from your Strapi Brevo Email plugin.',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Test Email</h2>
              <p>This is a test email from your Strapi Brevo Email plugin.</p>
              <p>If you received this email, your configuration is working correctly!</p>
            </div>
          `,
        });

        ctx.body = { success: true, message: 'Test email sent successfully' };
      } catch (error) {
        ctx.throw(500, (error as Error).message || 'Failed to send test email');
      }
    },
  };
};

export default settingsController;
