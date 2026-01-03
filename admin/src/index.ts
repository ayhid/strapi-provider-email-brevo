import { PLUGIN_ID } from '../../common';
import PluginIcon from './components/PluginIcon';
import trads from './translations';

export default {
  register(app: any) {
    // Create settings section
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.plugin.section`,
          defaultMessage: 'Brevo Email',
        },
      },
      [
        {
          id: `${PLUGIN_ID}.plugin.section.item`,
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.section.item`,
            defaultMessage: 'Configuration',
          },
          to: `/settings/${PLUGIN_ID}`,
          Component: () =>
            import('./pages/Settings').then((mod) => ({ default: mod.SettingsPageWrapper })),
        },
      ]
    );

    // Register the plugin
    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
    });
  },

  bootstrap() {
    // Bootstrap logic if needed
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        if (locale in trads) {
          const typedLocale = locale as keyof typeof trads;
          return trads[typedLocale]().then(({ default: trad }) => {
            return { data: trad, locale };
          });
        }
        return {
          data: {},
          locale,
        };
      })
    );
  },
};
