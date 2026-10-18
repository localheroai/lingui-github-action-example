import { defineConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  locales: ["en", "sv", "pl", "ar"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"]
    }
  ],
  format: formatter({ lineNumbers: true }),
  compileNamespace: "ts"
});
