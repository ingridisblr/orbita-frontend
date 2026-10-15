/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API Flask, definida no arquivo .env */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
