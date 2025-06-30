# WhatsForDinner

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

## Setup for Development

This project uses Groq's API for generating meal suggestions. To run it locally:

1. Copy the environment template:

   ```
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```

2. Add your Groq API key to the environment.ts file:

   ```typescript
   export const environment = {
     production: false,
     groqApiUrl: 'https://api.groq.com/openai/v1/chat/completions',
     groqApiKey: 'YOUR_ACTUAL_GROQ_API_KEY_HERE', // Get this from your Groq account
     groqModel: 'llama3-8b-8192',
   };
   ```

3. Start the development server:
   ```
   ng serve
   ```

> **Note**: The environment.ts file is excluded from git to keep API keys secure.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
