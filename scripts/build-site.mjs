import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const configDirectory = join(root, "papers.config");
const requiredText = ["title", "short", "abstract"];

async function loadPapers() {
  const files = (await readdir(configDirectory)).filter((file) => file.endsWith(".json")).sort();
  const papers = [];
  const slugs = new Set();
  const orders = new Set();

  for (const file of files) {
    const paper = JSON.parse(await readFile(join(configDirectory, file), "utf8"));
    for (const field of ["slug", "number", "order", "year", "status", "source", "en", "zh"]) {
      if (!paper[field]) throw new Error(`${file}: missing ${field}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(paper.slug)) throw new Error(`${file}: invalid slug`);
    if (slugs.has(paper.slug)) throw new Error(`${file}: duplicate slug ${paper.slug}`);
    if (!Number.isInteger(paper.order) || paper.order < 1) throw new Error(`${file}: order must be a positive integer`);
    if (orders.has(paper.order)) throw new Error(`${file}: duplicate order ${paper.order}`);
    if (!paper.source.directory || !paper.source.tex || !Array.isArray(paper.source.include) || paper.source.include.length === 0) {
      throw new Error(`${file}: incomplete source`);
    }
    for (const language of ["en", "zh"]) {
      for (const field of requiredText) if (!paper[language][field]) throw new Error(`${file}: missing ${language}.${field}`);
    }
    slugs.add(paper.slug);
    orders.add(paper.order);
    papers.push(paper);
  }
  return papers.sort((left, right) => left.order - right.order);
}

function pageTemplate(paper) {
  const description = paper.en.short.replaceAll('"', "&quot;");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <title>${paper.en.title} | Zavier Li</title>
  <link rel="stylesheet" href="/assets/site.css">
  <link rel="stylesheet" href="/assets/reader.css">
</head>
<body data-page="paper" data-paper="${paper.slug}">
  <div class="site-shell">
    <header class="site-header" data-header></header>
    <main>
      <section class="paper-hero reveal">
        <a class="back-link" href="/" data-back></a>
        <p class="paper-status" data-paper-status></p>
        <h1 data-paper-title></h1>
      </section>
      <section class="paper-layout">
        <article>
          <h2 class="section-index" data-abstract-label></h2>
          <p class="paper-abstract" data-paper-abstract></p>
          <a class="resource-link" data-pdf target="_blank" rel="noreferrer"></a><br>
          <a class="resource-link" data-arxiv target="_blank" rel="noreferrer"></a>
        </article>
        <aside class="paper-side">
          <h2 data-details-label></h2>
          <p><span data-year-label></span><br><strong data-year></strong></p>
          <p><span data-status-label></span><br><strong data-status></strong></p>
        </aside>
      </section>
      <section class="paper-reader section-rule" aria-labelledby="reader-title">
        <div class="reader-heading">
          <p class="section-index">PDF</p>
          <h2 id="reader-title" data-reader-label></h2>
        </div>
        <iframe class="pdf-frame" data-viewer loading="lazy"></iframe>
      </section>
    </main>
    <footer class="site-footer" data-footer></footer>
  </div>
  <script src="/assets/papers-data.js"></script>
  <script src="/assets/site.js"></script>
</body>
</html>
`;
}

async function build() {
  const papers = await loadPapers();
  const publicData = Object.fromEntries(papers.map((paper) => [paper.slug, {
    no: paper.number,
    year: paper.year,
    status: paper.status,
    arxiv: paper.arxiv,
    pdf: `${paper.slug}.pdf`,
    en: paper.en,
    zh: paper.zh
  }]));

  await mkdir(join(root, "assets"), { recursive: true });
  await writeFile(join(root, "assets", "papers-data.js"), `window.PAPERS = ${JSON.stringify(publicData, null, 2)};\n`);
  for (const paper of papers) {
    const directory = join(root, "papers", paper.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "index.html"), pageTemplate(paper));
  }
  process.stdout.write(`Generated ${papers.length} paper pages.\n`);
}

async function matrix() {
  const papers = await loadPapers();
  const include = papers.map((paper) => ({
    slug: paper.slug,
    directory: paper.source.directory,
    tex: paper.source.tex,
    pdf: paper.source.tex.replace(/\.tex$/i, ".pdf")
  }));
  process.stdout.write(`matrix=${JSON.stringify({ include })}\n`);
}

const command = process.argv[2] ?? "build";
if (command === "build") await build();
else if (command === "matrix") await matrix();
else throw new Error(`Unknown command: ${command}`);
