# josangyeon.github.io

Personal academic/research homepage for **Sangyeon Cho** — served by GitHub Pages
from the repository root.

## Structure

```
index.html      section shells + Hero / Education / Technologies (static content)
css/style.css   design tokens (CSS variables), light + dark themes
js/render.js    renders data/*.json into the shells — no build step, no deps
data/
  publications.json   ← papers
  news.json           ← "News" feed
  experience.json     ← positions
  projects.json       ← projects
  awards.json         ← awards + honors
  SangYeonCho_CV.pdf  ← linked from the hero
  Graduate_thesis.pdf     ⚠️ do not rename — linked from the published CV
  Transcripts(BS).pdf     ⚠️ do not rename — linked from the published CV
  Transcripts(MS).pdf     ⚠️ do not rename — linked from the published CV
```

The only external dependency is Google Fonts (Newsreader + Inter).
No Bootstrap, no jQuery, no build tooling.

## Adding a publication

Prepend an entry to `data/publications.json`:

```json
{
  "id": "C6",
  "title": "Paper Title",
  "authors": "Sangyeon Cho, Coauthor Name, Advisor Name*",
  "venue": "NeurIPS",
  "year": 2027,
  "tags": ["multimodal"],
  "links": [{ "label": "Paper", "url": "https://..." }]
}
```

- `id` — `C`onference or `J`ournal, numbered per type, oldest = 1.
- `authors` — a plain string. `render.js` bolds `Sangyeon Cho` automatically.
- `tags` — any key from `TAGS` at the top of `js/render.js`:
  `multimodal`, `kd`, `nlp`, `medical`.

### Adding a new tag

Tag colours are **not** generated — they come from a curated 8-slot palette
in `css/style.css` (`--tag-1-*` … `--tag-8-*`, defined for both themes).
A tag picks its slot by number, so adding one is a single line in
`js/render.js`:

```js
const TAGS = {
  multimodal: ['Multimodal',             1],
  kd:         ['Knowledge Distillation', 2],
  nlp:        ['NLP',                    3],
  medical:    ['Medical AI',             4],
  efficiency: ['Efficiency',             5],   // ← new tag, no CSS edit
};
```

The new key is then usable in `publications.json` and appears in the filter
row automatically. A tag used in the JSON but missing from `TAGS` still
renders — it falls back to its raw key and slot 8 (slate) — but it will not
get a filter button, which makes typos easy to spot. Slots repeat freely if
you ever need more than eight tags.
- `links` — may be empty (`[]`).

Then add a one-line entry to `data/news.json`. That's the whole update.

## Local preview

`fetch()` is blocked over `file://`, so open the site through a server:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

(If you skip this, the page renders with an inline note explaining the same thing.)
