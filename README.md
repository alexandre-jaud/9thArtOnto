# 🎨 9thArtOnto Graph Viewer

![Version](https://img.shields.io/badge/version-1.0.0-blue)


> Interactive graph visualization tool for **9thArtOnto**, an ontology for representing the visual and narrative structures of comics.

## 📖 Context

### 9thArtOnto

> **9thArtOnto: Towards an ontology for representing visual and narrative structures.**

9thArtOnto is an ontology designed to formally represent the structural elements of comics, from the physical layout (books, plates, panels) to the narrative layer (characters, events, story arcs) and the visual content (balloons, captions, onomatopoeia, objects). It provides a shared vocabulary for annotating and reasoning over comic books as semantic knowledge graphs.

### 🏛️ MANPU 2026

This work is presented at **MANPU** (International Workshop on coMics ANalysis, Processing and Understanding), a workshop co-located with **ICPR** (International Conference on Pattern Recognition). MANPU brings together researchers working on automatic analysis of comics, manga, and graphic novels.

More info: [https://manpu2026.imlab.jp/](https://manpu2026.imlab.jp/)

### 📚 Default dataset: WIPO Patent Comics

The dataset loaded by default is the semantic graph of the **WIPO Patent Comics** ([*Understanding Industrial Property*](https://www.wipo.int/publications/en/details.jsp?id=67)), a publicly available educational comic book published by the World Intellectual Property Organization. It is used as a reference corpus for annotating comics with 9thArtOnto.

## ✨ Features

- 🔵 **Graph view** — force-directed visualization of the ontology graph, with zoom/pan, node tooltips (with image crop), click to inspect, right-click context menu
- 🧭 **Navigation mode** — step through panels in reading order (hasNextPanel edges)
- 🎛️ **Filter panel** — toggle node and edge types by visibility
- 🖼️ **Pages viewer** — gallery of book pages with fullscreen mode
- 📘 **Ontology helper** — embedded 9thArtOnto documentation
- 💾 **Export** — download graph as JSON

## 🚀 Getting started

### Prerequisites
- Node.js >= 18
- npm

### Installation

```bash
npm install
```

### Run

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).  
The app loads the WIPO Patent Comics dataset automatically on startup.

## 💬 Contact

This tool is a work in progress and will continue to evolve alongside the ontology. Feedback, suggestions, and improvement ideas are very welcome.

**Alexandre Jaud**  
alexandre.jaud@univ-lr.fr
