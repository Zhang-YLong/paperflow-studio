import type { Font, Template } from '@pdfme/common';
import { getInputFromTemplate } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { plugins } from './plugins';
import { FONT_NAME } from './templates';

let fontPromise: Promise<Font> | null = null;

export const getFont = (): Promise<Font> => {
  if (!fontPromise) {
    fontPromise = fetch(new URL('./fonts/NotoSansCJKsc-Regular.otf', document.baseURI))
      .then((response) => {
        if (!response.ok) throw new Error(`字体加载失败：${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => ({
        [FONT_NAME]: {
          data,
          fallback: true,
          subset: true,
        },
      }));
  }
  return fontPromise;
};

export const getEditableFieldNames = (template: Template) => {
  const names = new Set<string>();
  template.schemas.flat().forEach((schema) => {
    if (!schema.readOnly && schema.name) names.add(schema.name);
  });
  return [...names];
};

export const getSampleInput = (template: Template): Record<string, string> =>
  getInputFromTemplate(template)[0] ?? {};

export const generatePdf = async (
  template: Template,
  rows: Record<string, string>[],
): Promise<Uint8Array> => {
  const base = getInputFromTemplate(template)[0] ?? {};
  const inputs = rows.map((row) => ({ ...base, ...row }));
  const font = await getFont();
  return generate({
    template,
    inputs,
    plugins,
    options: {
      font,
      lang: 'zh',
      title: '纸舟 Studio',
    },
  });
};

export const downloadBytes = (bytes: Uint8Array, fileName: string, type: string) => {
  const blob = new Blob([new Uint8Array(bytes)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 20_000);
};

export const downloadText = (content: string, fileName: string, type = 'text/plain') => {
  const bytes = new TextEncoder().encode(content);
  downloadBytes(bytes, fileName, `${type};charset=utf-8`);
};
