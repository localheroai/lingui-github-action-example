import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { App } from "./App.tsx";
import { activateLocale, DEFAULT_LOCALE } from "./i18n.ts";
import "./styles.css";

activateLocale(DEFAULT_LOCALE).then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </StrictMode>
  );
});
