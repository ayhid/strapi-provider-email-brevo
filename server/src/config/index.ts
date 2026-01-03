export default {
  default: {
    enabled: false,
    apiKey: '',
    defaultFrom: '',
    defaultFromName: '',
    defaultReplyTo: '',
  },
  validator: (config: Record<string, unknown>) => {
    // Optional validation for config file values
  },
};
