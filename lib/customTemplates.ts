import { ReportPreset } from "./reportPresets";

export type CustomTemplate = ReportPreset & {
  id: string;
  name: string;
  createdAt: string;
  raceFormat: "custom";
};

const storageKey = "ocht.customTemplates";
const legacyStorageKey = "reprun.customTemplates";

export function loadCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawTemplates =
      window.localStorage.getItem(storageKey) ??
      window.localStorage.getItem(legacyStorageKey);

    if (!rawTemplates) {
      return [];
    }

    const templates = JSON.parse(rawTemplates);

    if (!Array.isArray(templates)) {
      return [];
    }

    const customTemplates = templates.filter(
      (template) => template.raceFormat === "custom",
    );

    if (!window.localStorage.getItem(storageKey)) {
      window.localStorage.setItem(storageKey, JSON.stringify(customTemplates));
    }

    return customTemplates;
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: CustomTemplate[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(templates));
}
