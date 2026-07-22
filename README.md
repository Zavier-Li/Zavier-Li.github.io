# Zavier Li

Personal research website for Zavier Li. The site is a dependency-free static
GitHub Pages site with English and Chinese interfaces, individual research
pages, arXiv links, and local PDF downloads.

## Add or update a paper

Each paper is described by one JSON file in `papers.config/`. Public ordering
is controlled by the positive integer `order`; use the next integer to append
a paper. The `source.directory` value is relative to the local research
repository root.

Import source only after reviewing and approving the paper directory:

```powershell
.\scripts\import-paper.ps1 `
  -Config papers.config\06-example.json `
  -SourceRoot "C:\path\to\research-repository" `
  -Confirmed
```

The importer copies the approved LaTeX source into `paper-source/` while
excluding build caches, experiments, old distributions, review material, and
generated manuscript PDFs. Run `node scripts/build-site.mjs build` to validate
the configuration and regenerate the static pages.

Pushing `main` starts GitHub Actions. It compiles every configured TeX entry
point, generates the paper pages, embeds the resulting PDFs, and deploys the
site to GitHub Pages. The workflow reads only files committed to this
repository; it does not access the research repository.
