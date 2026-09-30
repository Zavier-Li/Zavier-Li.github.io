# Zavier Li — creative coding portfolio study

## Homepage themes

The current Z Lab homepage offers **Z Signal** and **Night City** through the
header switch and the hero's Style Index. Theme and sound preferences are saved
locally. Existing content and links are shared by both themes.

Night City uses an original generated city plate (`assets/night-city.webp`), a
layered mechanical SVG Z, and a canvas for rain, flight trails and energy waves.
Move across the scene to disturb the rain; hold an empty area to charge; drag to
pull an arc from the Z; release to emit a shockwave. Native scrolling and text
selection remain available. Reduced-motion mode keeps the composition static.

The Web Audio soundscape combines a reactor drone, filtered rain, stereo reverb
and interaction tones. Browsers require a gesture to start sound: switching to
Night City or clicking the page starts it unless muted. The header audio control
toggles sound independently. Background tabs suspend audio and rendering.

Theme styles and interaction code live in `assets/cyber-theme.css` and
`assets/cyber-theme.js`; the page requires no build step or external runtime.

This is an original local study of editorial portfolio interaction patterns observed on public creative-development references. It does not copy the original site's photography, copy, brand identity, or proprietary assets.

## Run locally

```powershell
python -m http.server 4174
```

Then open `http://127.0.0.1:4174/index.html`.

## Included pages

- `index.html` — hero, interactive canvas visual, selected work and CTA
- `work.html` — bilingual work archive with filters
- `about.html` — bilingual point of view, education, skills and recognition
- `contact.html` — bilingual contact form surface
- `project.html?project=zhixing` — reusable bilingual project detail template

## Featured experience set

- Xidian Zhixing — campus services and RAG assistant
- Vibe Videoing — code-driven video editing with React, TypeScript and Remotion
- Hierarchical ER Skill — evidence-backed entity-relation extraction
- Zodel — LLM routing and Zflow workflow orchestration
- FlowPaster — Windows clipboard and Quick Paste product
- Reflex — cross-platform English response training app

## Motion and language system

- GSAP page wipe and scroll reveal when available
- CSS marquee and hover states
- Pointer-reactive canvas field
- Magnetic links and custom cursor on fine pointers
- Reduced-motion fallback
- English / Chinese switch persisted in local storage
- Project data and project detail pages translated through keyed dictionaries

The reusable Codex instructions for this type of work live at:

```text
C:\Users\24045\.codex\skills\creative-coding-frontend
```
