export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/settings',
        handler: 'settings.getSettings',
        config: {
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/settings',
        handler: 'settings.updateSettings',
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/settings/test',
        handler: 'settings.testEmail',
        config: {
          policies: [],
        },
      },
    ],
  },
};
