import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sassalao.app",
  appName: "Beleza em Dia",
  // Usa o servidor Vercel em vez de arquivos locais
  server: {
    url: "https://sassalao-hm6l.vercel.app",
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
