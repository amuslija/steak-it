import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      // const isDev = config.watchForFileChanges;
      const port = 3000;
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        screenshotOnRunFailure: !process.env.CI,
      };

      on('task', {
        log: (message) => {
          console.log(message);

          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
  },
});
