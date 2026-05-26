# 9thArtOnto

```
┌────────────────────────────────────────────┐
│  Manga. BD. Comics. Webtoon.               │
│  Complex visual narratives.                │
│  How do you make a machine understand      │
│  a FLASHBACK inside a single panel?        │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
              [ 9thArtOnto ]
```

An **OWL 2 ontology** for building knowledge graphs of comic book works. It jointly encodes:

- **The visual layer** — plates, panels, characters, balloons, captions, onomatopoeia
- **The narrative layer** — scenes, events, arcs, fabula vs. syuzhet, flashbacks

The two layers are bridged by a single `instantiates` property linking narrative segments to their panel-level content, making the full graph queryable from either end.

## Repository

```
9thArtOnto.rdf   ← OWL 2 / RDF-XML, edited with Protégé
                   Namespace: http://www.semanticweb.org/ajaud02/seqartonto#
```

## Paper

> *9thArtOnto: Towards an ontology for representing visual and narrative structures* — MANPU 2026
