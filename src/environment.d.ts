export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}