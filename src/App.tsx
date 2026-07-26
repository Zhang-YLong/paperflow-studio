import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import type { Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { parseCsv, escapeCsvCell } from './csv';
import {
  downloadBytes,
  downloadText,
  generatePdf,
  getEditableFieldNames,
  getFont,
  getSampleInput,
} from './pdf';
import { plugins } from './plugins';
import { loadProjects, resetProjects, saveProjects } from './storage';
import { defaultProjects } from './templates';
import type { PageId, TemplateProject, ToastState } from './types';

const navItems: { id: PageId; label: string; eyebrow: string }[] = [
  { id: 'home', label: '工作台', eyebrow: '01' },
  { id: 'designer', label: '模板设计', eyebrow: '02' },
  { id: 'batch', label: '批量生成', eyebrow: '03' },
  { id: 'about', label: '关于纸舟', eyebrow: '04' },
];

const Icon = ({ name }: { name: 'arrow' | 'spark' | 'shield' | 'download' }) => {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    spark: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />,
    shield: <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    download: <path d="M12 3v12m-4-4 4 4 4-4M5 20h14" />,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const Toast = ({ state }: { state: ToastState }) => {
  if (!state) return null;
  return <div className={`toast toast-${state.kind}`}>{state.message}</div>;
};

const ActionButton = ({
  children,
  onClick,
  variant = 'dark',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'dark' | 'lime' | 'ghost';
  disabled?: boolean;
}) => (
  <button className={`button button-${variant}`} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

const Topbar = ({ page }: { page: PageId }) => {
  const current = navItems.find((item) => item.id === page)!;
  return (
    <header className="topbar">
      <div>
        <span className="topbar-index">{current.eyebrow} / PAPERFLOW</span>
        <h1>{current.label}</h1>
      </div>
      <div className="privacy-pill">
        <span className="privacy-dot" />
        本地隐私模式
      </div>
    </header>
  );
};

const HomePage = ({
  projects,
  onOpen,
  onNavigate,
}: {
  projects: TemplateProject[];
  onOpen: (id: string) => void;
  onNavigate: (page: PageId) => void;
}) => (
  <main className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker">LOCAL-FIRST DOCUMENT AUTOMATION</span>
        <h2>
          把重复文档，
          <br />
          变成一次设计。
        </h2>
        <p>可视化设计模板，导入 CSV，一次生成整批 PDF。所有业务数据默认只留在这台电脑。</p>
        <div className="hero-actions">
          <ActionButton variant="lime" onClick={() => onNavigate('designer')}>
            开始设计 <Icon name="arrow" />
          </ActionButton>
          <ActionButton variant="ghost" onClick={() => onNavigate('batch')}>
            批量生成
          </ActionButton>
        </div>
      </div>
      <div className="hero-visual">
        <div className="paper paper-back" />
        <div className="paper paper-front">
          <div className="mini-brand">PAPERFLOW / 报价单</div>
          <div className="mini-title">让好生意，少一点重复劳动。</div>
          <div className="mini-rule" />
          <div className="mini-grid">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="mini-total">¥ 68,000</div>
        </div>
        <div className="hero-stamp">100% LOCAL</div>
      </div>
    </section>

    <section className="metrics">
      <div>
        <span className="metric-value">{projects.length}</span>
        <span className="metric-label">可用模板</span>
      </div>
      <div>
        <span className="metric-value">0</span>
        <span className="metric-label">数据上传</span>
      </div>
      <div>
        <span className="metric-value">CSV</span>
        <span className="metric-label">数据导入</span>
      </div>
      <div>
        <span className="metric-value">PDF</span>
        <span className="metric-label">输出格式</span>
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="kicker dark">READY TO USE</span>
          <h3>从一个好模板开始</h3>
        </div>
        <button className="text-link" onClick={() => onNavigate('designer')}>
          打开设计器 <Icon name="arrow" />
        </button>
      </div>
      <div className="template-grid">
        {projects.map((project, index) => (
          <button className="template-card" key={project.id} onClick={() => onOpen(project.id)}>
            <div className={`template-preview preview-${index % 3}`}>
              <span className="preview-accent" style={{ background: project.accent }} />
              <div className="preview-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="template-meta">
              <span>{project.category}</span>
              <h4>{project.name}</h4>
              <small>{project.updatedAt}</small>
            </div>
          </button>
        ))}
      </div>
    </section>

    <section className="local-callout">
      <div className="callout-icon">
        <Icon name="shield" />
      </div>
      <div>
        <span className="kicker">PRIVACY BY DESIGN</span>
        <h3>客户名单、报价与证书姓名，不必经过第三方服务器。</h3>
      </div>
      <p>当前版本没有登录、埋点或云端接口。模板可以导出为 JSON 备份，生成的 PDF 由浏览器直接保存到本机。</p>
    </section>
  </main>
);

const DesignerPage = ({
  project,
  onSave,
  notify,
}: {
  project: TemplateProject;
  onSave: (template: Template) => void;
  notify: (state: ToastState) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    getFont()
      .then((font) => {
        if (cancelled || !containerRef.current) return;
        const designer = new Designer({
          domContainer: containerRef.current,
          template: project.template,
          plugins,
          options: {
            lang: 'zh',
            font,
            maxZoom: 250,
            theme: { token: { colorPrimary: '#171914', borderRadius: 2 } },
          },
        });
        designerRef.current = designer;
        designer.onSaveTemplate((template) => {
          onSave(template);
          notify({ kind: 'success', message: '模板已保存到本机' });
        });
      })
      .catch((error) => {
        console.error(error);
        notify({ kind: 'error', message: '离线中文字体加载失败' });
      });

    return () => {
      cancelled = true;
      designerRef.current?.destroy();
      designerRef.current = null;
    };
  }, [project.id]);

  const save = () => {
    if (!designerRef.current) return;
    onSave(designerRef.current.getTemplate());
    notify({ kind: 'success', message: '模板已保存到本机' });
  };

  const exportTemplate = () => {
    if (!designerRef.current) return;
    downloadText(
      JSON.stringify(designerRef.current.getTemplate(), null, 2),
      `${project.name}.json`,
      'application/json',
    );
  };

  const importTemplate = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !designerRef.current) return;
    try {
      const parsed = JSON.parse(await file.text()) as Template;
      designerRef.current.updateTemplate(parsed);
      notify({ kind: 'success', message: '模板文件已导入，请保存确认' });
    } catch {
      notify({ kind: 'error', message: '模板文件无法读取，请检查 JSON 格式' });
    }
    event.target.value = '';
  };

  return (
    <main className="page designer-page">
      <section className="workspace-toolbar">
        <div>
          <span className="kicker dark">{project.category}</span>
          <h2>{project.name}</h2>
        </div>
        <div className="toolbar-actions">
          <input
            ref={fileRef}
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={importTemplate}
          />
          <ActionButton variant="ghost" onClick={() => fileRef.current?.click()}>
            导入 JSON
          </ActionButton>
          <ActionButton variant="ghost" onClick={exportTemplate}>
            导出模板
          </ActionButton>
          <ActionButton variant="lime" onClick={save}>
            保存模板
          </ActionButton>
        </div>
      </section>
      <div className="designer-note">
        <Icon name="spark" />
        左侧添加字段，拖拽调整位置；右侧可修改字体、颜色、对齐和数据字段名。
      </div>
      <div className="designer-shell" ref={containerRef} />
    </main>
  );
};

const BatchPage = ({
  projects,
  selectedId,
  onSelect,
  notify,
}: {
  projects: TemplateProject[];
  selectedId: string;
  onSelect: (id: string) => void;
  notify: (state: ToastState) => void;
}) => {
  const project = projects.find((item) => item.id === selectedId) ?? projects[0];
  const fields = useMemo(() => getEditableFieldNames(project.template), [project]);
  const sample = useMemo(() => getSampleInput(project.template), [project]);
  const createExample = () => {
    const header = fields.map(escapeCsvCell).join(',');
    const first = fields.map((field) => escapeCsvCell(sample[field] ?? '')).join(',');
    const second = fields
      .map((field) => escapeCsvCell(field === fields[0] ? `${sample[field] ?? ''}-02` : sample[field] ?? ''))
      .join(',');
    return `${header}\n${first}\n${second}`;
  };
  const [csv, setCsv] = useState(createExample);
  const [busy, setBusy] = useState(false);

  useEffect(() => setCsv(createExample()), [project.id]);
  const rows = useMemo(() => parseCsv(csv), [csv]);

  const generateBatch = async () => {
    if (rows.length === 0) {
      notify({ kind: 'error', message: '至少需要一行 CSV 数据' });
      return;
    }
    setBusy(true);
    try {
      const pdf = await generatePdf(project.template, rows);
      downloadBytes(pdf, `${project.name}-${rows.length}份.pdf`, 'application/pdf');
      notify({ kind: 'success', message: `已生成 ${rows.length} 份文档` });
    } catch (error) {
      console.error(error);
      notify({ kind: 'error', message: '生成失败，请检查字段内容或模板设置' });
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsv(await file.text());
    event.target.value = '';
  };

  return (
    <main className="page batch-page">
      <section className="batch-intro">
        <div>
          <span className="kicker dark">CSV → MULTI-PAGE PDF</span>
          <h2>一份数据，一次交付。</h2>
          <p>第一行是模板字段名，后续每一行生成一份文档。适合证书、报价单、标签和通知书。</p>
        </div>
        <div className="batch-count">
          <strong>{rows.length}</strong>
          <span>待生成文档</span>
        </div>
      </section>

      <section className="batch-grid">
        <div className="batch-panel">
          <label className="field-label" htmlFor="template-select">
            选择模板
          </label>
          <select id="template-select" value={project.id} onChange={(event) => onSelect(event.target.value)}>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="field-row">
            <label className="field-label" htmlFor="csv-data">
              CSV 数据
            </label>
            <label className="file-button">
              读取 CSV
              <input className="visually-hidden" type="file" accept=".csv,text/csv" onChange={onFile} />
            </label>
          </div>
          <textarea
            id="csv-data"
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            spellCheck={false}
          />
          <div className="csv-hint">
            <span>识别字段：{fields.join(' · ')}</span>
            <button onClick={() => downloadText(createExample(), `${project.name}-示例.csv`, 'text/csv')}>
              下载示例
            </button>
          </div>
        </div>

        <aside className="generate-panel">
          <span className="panel-number">03</span>
          <h3>准备生成</h3>
          <ul>
            <li>
              <span>模板</span>
              <strong>{project.name}</strong>
            </li>
            <li>
              <span>数据行</span>
              <strong>{rows.length}</strong>
            </li>
            <li>
              <span>输出</span>
              <strong>单个多页 PDF</strong>
            </li>
            <li>
              <span>上传</span>
              <strong>无</strong>
            </li>
          </ul>
          <ActionButton variant="lime" onClick={generateBatch} disabled={busy}>
            {busy ? '正在生成…' : '生成并下载 PDF'} <Icon name="download" />
          </ActionButton>
          <p className="generate-note">生成在浏览器内完成，大批量任务可能需要几秒钟。</p>
        </aside>
      </section>
    </main>
  );
};

const AboutPage = () => (
  <main className="page about-page">
    <section className="about-hero">
      <span className="kicker">A SMALL TOOL, BUILT WITH CARE</span>
      <h2>纸舟是我想长期打磨的一件小工具。</h2>
      <p>它从一个很具体的问题开始：同一类文档明明只换了几项数据，却总要重新排版、复制和检查。</p>
    </section>
    <section className="about-grid">
      <article className="about-card">
        <span>01 / 我在意的事</span>
        <h3>先把本地体验做好</h3>
        <p>
          纸舟不要求注册账号。模板编辑、CSV 解析和 PDF 生成都在浏览器里完成，重要模板也可以随时导出备份。
        </p>
      </article>
      <article className="about-card">
        <span>02 / 当前版本</span>
        <h3>够用、清楚、可继续改</h3>
        <p>
          现在提供三套中文模板、可视化设计器和批量生成流程。项目还在早期，我会优先修复真实使用中遇到的问题。
        </p>
      </article>
    </section>
    <section className="about-note">
      <div>
        <span className="kicker">MADE BY ZHANG-YLONG</span>
        <h3>如果你也在处理重复文档，欢迎告诉我你的使用场景。</h3>
        <p>一个能复现的问题，或者一份脱敏后的模板示例，都比泛泛的功能清单更有帮助。</p>
      </div>
      <a
        className="about-link"
        href="https://github.com/Zhang-YLong/paperflow-studio/issues"
        target="_blank"
        rel="noreferrer"
      >
        在 GitHub 留言 <Icon name="arrow" />
      </a>
    </section>
  </main>
);

export default function App() {
  const [page, setPage] = useState<PageId>(() => {
    const requested = new URLSearchParams(window.location.search).get('page') as PageId | null;
    return navItems.some((item) => item.id === requested) ? requested! : 'home';
  });
  const [projects, setProjects] = useState<TemplateProject[]>(() => loadProjects(defaultProjects));
  const [selectedId, setSelectedId] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('template');
    return projects.some((project) => project.id === requested) ? requested! : projects[0].id;
  });
  const [toast, setToast] = useState<ToastState>(null);
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

  const notify = (state: ToastState) => {
    setToast(state);
    window.setTimeout(() => setToast(null), 2600);
  };

  const updateTemplate = (template: Template) => {
    const next = projects.map((project) =>
      project.id === selectedId
        ? {
            ...project,
            template,
            updatedAt: new Intl.DateTimeFormat('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date()),
          }
        : project,
    );
    setProjects(next);
    saveProjects(next);
  };

  const openProject = (id: string) => {
    setSelectedId(id);
    setPage('designer');
  };

  const resetAll = () => {
    if (!window.confirm('恢复内置模板会覆盖本机保存的修改，确定继续吗？')) return;
    const next = resetProjects(defaultProjects);
    setProjects(next);
    setSelectedId(next[0].id);
    notify({ kind: 'success', message: '已恢复内置模板' });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('home')} aria-label="返回工作台">
          <span className="brand-mark">
            <i />
            <i />
          </span>
          <span>
            <strong>纸舟</strong>
            <small>PAPERFLOW STUDIO</small>
          </span>
        </button>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              onClick={() => setPage(item.id)}
            >
              <span>{item.eyebrow}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={resetAll}>恢复内置模板</button>
          <span>v0.1 · PUBLIC BETA</span>
        </div>
      </aside>
      <div className="app-content">
        <Topbar page={page} />
        {page === 'home' && (
          <HomePage projects={projects} onOpen={openProject} onNavigate={setPage} />
        )}
        {page === 'designer' && (
          <DesignerPage project={selected} onSave={updateTemplate} notify={notify} />
        )}
        {page === 'batch' && (
          <BatchPage
            projects={projects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            notify={notify}
          />
        )}
        {page === 'about' && <AboutPage />}
      </div>
      <Toast state={toast} />
    </div>
  );
}
