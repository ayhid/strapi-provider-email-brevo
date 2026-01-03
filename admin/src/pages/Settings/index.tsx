export const SettingsPageWrapper = async () => {
  const { default: Settings } = await import('./Settings');
  return { default: Settings };
};
