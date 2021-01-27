declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    SESSION_SECRET: string;
    DBURL:string;
  }
}
