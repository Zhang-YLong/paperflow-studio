import type { TemplateProject } from './types';

const STORAGE_KEY = 'paperflow.projects.v1';

export const loadProjects = (fallback: TemplateProject[]): TemplateProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw) as TemplateProject[];
    if (!Array.isArray(parsed) || parsed.length === 0) return structuredClone(fallback);
    return parsed;
  } catch {
    return structuredClone(fallback);
  }
};

export const saveProjects = (projects: TemplateProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const resetProjects = (fallback: TemplateProject[]) => {
  const next = structuredClone(fallback);
  saveProjects(next);
  return next;
};
