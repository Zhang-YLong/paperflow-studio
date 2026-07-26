import type { Template } from '@pdfme/common';

export type PageId = 'home' | 'designer' | 'batch' | 'business';

export type TemplateProject = {
  id: string;
  name: string;
  category: string;
  accent: string;
  updatedAt: string;
  template: Template;
};

export type ToastState = {
  kind: 'success' | 'error' | 'info';
  message: string;
} | null;
