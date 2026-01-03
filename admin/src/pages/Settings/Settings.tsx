import {
  Box,
  Button,
  Flex,
  Grid,
  Field,
  TextInput,
  Toggle,
  Typography,
} from '@strapi/design-system';
import { Check, Mail } from '@strapi/icons';
import { Layouts, Page, useNotification } from '@strapi/strapi/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PLUGIN_ID, Settings, SettingsForm, DEFAULT_SETTINGS, validateSettings } from '../../../../common';
import { useFetchClient } from '../../hooks/useFetchClient';

const SettingsPage = () => {
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const { get, put, post } = useFetchClient();

  const [values, setValues] = useState<SettingsForm>(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: [PLUGIN_ID, 'settings'],
    queryFn: async () => {
      const response = await get(`/${PLUGIN_ID}/settings`);
      return response.data as Settings;
    },
    onSuccess: (data: Settings) => {
      setValues({
        ...DEFAULT_SETTINGS,
        ...data,
        // Keep the masked API key display but allow new input
        apiKey: '',
      });
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: SettingsForm) => {
      const response = await put(`/${PLUGIN_ID}/settings`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLUGIN_ID, 'settings'] });
      toggleNotification({
        type: 'success',
        message: 'Settings saved successfully',
      });
    },
    onError: (error: any) => {
      toggleNotification({
        type: 'warning',
        message: error?.message || 'Failed to save settings',
      });
    },
  });

  // Test email mutation
  const testMutation = useMutation({
    mutationFn: async (to: string) => {
      const response = await post(`/${PLUGIN_ID}/settings/test`, { to });
      return response.data;
    },
    onSuccess: () => {
      toggleNotification({
        type: 'success',
        message: 'Test email sent successfully',
      });
    },
    onError: (error: any) => {
      toggleNotification({
        type: 'warning',
        message: error?.message || 'Failed to send test email',
      });
    },
  });

  const handleChange = (name: keyof SettingsForm, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSettings(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(values);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toggleNotification({
        type: 'warning',
        message: 'Please enter a recipient email address',
      });
      return;
    }

    setIsTesting(true);
    try {
      await testMutation.mutateAsync(testEmail);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <Page.Loading>Loading settings...</Page.Loading>;
  }

  const boxProps = {
    background: 'neutral0',
    hasRadius: true,
    shadow: 'filterShadow',
    padding: 6,
  };

  return (
    <Page.Main>
      <Page.Title>Brevo Email Settings</Page.Title>
      <form onSubmit={handleSubmit}>
        <Layouts.Header
          title="Brevo Email"
          subtitle="Configure your Brevo transactional email settings"
          primaryAction={
            <Button
              type="submit"
              startIcon={<Check />}
              loading={isSaving}
              disabled={isSaving}
            >
              Save
            </Button>
          }
        />
        <Layouts.Content>
          <Flex direction="column" gap={6}>
            {/* Enable/Disable */}
            <Box {...boxProps}>
              <Flex direction="column" alignItems="flex-start" gap={4}>
                <Typography variant="delta" tag="h2">
                  Plugin Status
                </Typography>
                <Field.Root>
                  <Field.Label>Enable Brevo Email</Field.Label>
                  <Toggle
                    checked={values.enabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange('enabled', e.target.checked);
                    }}
                    onLabel="On"
                    offLabel="Off"
                  />
                  <Field.Hint>
                    When disabled, emails will be logged to the console instead of being sent.
                  </Field.Hint>
                </Field.Root>
              </Flex>
            </Box>

            {/* API Configuration */}
            <Box {...boxProps}>
              <Flex direction="column" alignItems="flex-start" gap={4}>
                <Typography variant="delta" tag="h2">
                  API Configuration
                </Typography>
                <Grid.Root gap={4}>
                  <Grid.Item col={12}>
                    <Field.Root error={errors.apiKey}>
                      <Field.Label>Brevo API Key</Field.Label>
                      <TextInput
                        type="password"
                        name="apiKey"
                        placeholder="xkeysib-xxxxxxxxxxxx"
                        value={values.apiKey}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange('apiKey', e.target.value);
                        }}
                      />
                      <Field.Hint>
                        Get your API key from the Brevo dashboard under SMTP & API settings.
                      </Field.Hint>
                      {errors.apiKey && <Field.Error>{errors.apiKey}</Field.Error>}
                    </Field.Root>
                  </Grid.Item>
                </Grid.Root>
              </Flex>
            </Box>

            {/* Email Settings */}
            <Box {...boxProps}>
              <Flex direction="column" alignItems="flex-start" gap={4}>
                <Typography variant="delta" tag="h2">
                  Email Settings
                </Typography>
                <Grid.Root gap={4}>
                  <Grid.Item col={6} xs={12}>
                    <Field.Root error={errors.defaultFrom}>
                      <Field.Label>Default From Email</Field.Label>
                      <TextInput
                        type="email"
                        name="defaultFrom"
                        placeholder="noreply@example.com"
                        value={values.defaultFrom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange('defaultFrom', e.target.value);
                        }}
                      />
                      <Field.Hint>
                        The default sender email address for outgoing emails.
                      </Field.Hint>
                      {errors.defaultFrom && <Field.Error>{errors.defaultFrom}</Field.Error>}
                    </Field.Root>
                  </Grid.Item>
                  <Grid.Item col={6} xs={12}>
                    <Field.Root>
                      <Field.Label>Default From Name</Field.Label>
                      <TextInput
                        type="text"
                        name="defaultFromName"
                        placeholder="My App"
                        value={values.defaultFromName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange('defaultFromName', e.target.value);
                        }}
                      />
                      <Field.Hint>
                        The default sender name displayed in emails.
                      </Field.Hint>
                    </Field.Root>
                  </Grid.Item>
                  <Grid.Item col={6} xs={12}>
                    <Field.Root error={errors.defaultReplyTo}>
                      <Field.Label>Default Reply-To Email</Field.Label>
                      <TextInput
                        type="email"
                        name="defaultReplyTo"
                        placeholder="support@example.com"
                        value={values.defaultReplyTo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange('defaultReplyTo', e.target.value);
                        }}
                      />
                      <Field.Hint>
                        The default reply-to email address (optional).
                      </Field.Hint>
                      {errors.defaultReplyTo && <Field.Error>{errors.defaultReplyTo}</Field.Error>}
                    </Field.Root>
                  </Grid.Item>
                </Grid.Root>
              </Flex>
            </Box>

            {/* Test Email */}
            {values.enabled && (
              <Box {...boxProps}>
                <Flex direction="column" alignItems="flex-start" gap={4}>
                  <Typography variant="delta" tag="h2">
                    Test Configuration
                  </Typography>
                  <Grid.Root gap={4}>
                    <Grid.Item col={8} xs={12}>
                      <Field.Root>
                        <Field.Label>Send Test Email To</Field.Label>
                        <TextInput
                          type="email"
                          name="testEmail"
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setTestEmail(e.target.value);
                          }}
                        />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12}>
                      <Flex height="100%" alignItems="flex-end">
                        <Button
                          variant="secondary"
                          startIcon={<Mail />}
                          loading={isTesting}
                          disabled={isTesting || !values.apiKey}
                          onClick={handleTestEmail}
                        >
                          Send Test
                        </Button>
                      </Flex>
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </Box>
            )}
          </Flex>
        </Layouts.Content>
      </form>
    </Page.Main>
  );
};

export default SettingsPage;
