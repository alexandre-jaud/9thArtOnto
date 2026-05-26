```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ░█████╗░ ████████╗██╗  ██╗ █████╗  ██████╗ ████████╗ ██████╗    ║
║   ██╔══██╗╚══██╔══╝██║  ██║██╔══██╗ ██╔══██╗╚══██╔══╝██╔═══██╗   ║
║   ╚██████║   ██║   ███████║███████║ ██████╔╝   ██║   ██║   ██║   ║
║    ╚═══██║   ██║   ██╔══██║██╔══██║ ██╔══██╗   ██║   ██║   ██║   ║
║   ██████╔╝   ██║   ██║  ██║██║  ██║ ██║  ██║   ██║   ╚██████╔╝   ║
║   ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝   ║
║                                                                      ║
║            ✦  O N T O  ✦                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

<div align="center">

*An OWL 2 ontology for representing the visual and narrative structures of sequential art*

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![OWL 2](https://img.shields.io/badge/Format-OWL%202%20%2F%20RDF--XML-blue)](https://www.w3.org/TR/owl2-overview/)
[![Paper](https://img.shields.io/badge/Paper-MANPU%202026-orange)](.)

</div>

---

```
┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
│                                      │   │                                      │
│   Comics are the 9th art.            │   │  But how do you make a computer      │
│   Manga. Bande dessinée. Webtoon.    │   │  understand a FLASHBACK?             │
│   Manhwa. Graphic novel.             │   │  Or a polyptych? Or a balloon        │
│                                      │   │  that spans TWO panels?              │
│   Complex. Visual. Narrative.        │   │                                      │
│                                      │   │            ( ͡° ͜ʖ ͡°)               │
└──────────────────────────────────────┘   └──────────────────────────────────────┘
                                                          │
                                          ┌───────────────┘
                                          ▼
                             ┌────────────────────────────┐
                             │                            │
                             │   *** 9thArtOnto ***       │
                             │                            │
                             │  A formal OWL 2 ontology   │
                             │  that knows the difference │
                             │  between fabula & syuzhet. │
                             │                            │
                             │         *BOOM*             │
                             └────────────────────────────┘
```

## What is 9thArtOnto?

**9thArtOnto** is an OWL 2 ontology that provides a formal framework for building **knowledge graphs** of comic book works. It captures two intertwined dimensions of sequential art:

- **The visual layer** — every plate, panel, character, speech balloon, caption, and onomatopoeia, all the way down to individual text spans.
- **The narrative layer** — how those panels aggregate into scenes, events, arcs, and a full story; how to encode flashbacks, flash-forwards, and parallel narration.

The result is a single, queryable knowledge graph in which every visual element can be traced back to its narrative context — and vice versa.

---

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PANEL 1 — THE VISUAL LAYER                                             │
│                                                                         │
│  Book → Plate → Panel → TimeLevel                                       │
│                              │                                          │
│              ┌───────────────┼───────────────────┐                     │
│              ▼               ▼                   ▼                     │
│         Character         Balloon            Object                    │
│       (+ MetaChar.)    (Speech/Thought/   (+ MetaObject)               │
│                         Whisper/...)                                    │
│              │               │                   │                     │
│              └───────────────┴───────────────────┘                     │
│                          Interaction                                    │
│                    (hasAgent · hasPatient                               │
│                      · hasInstrument)                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  PANEL 2 — THE NARRATIVE LAYER                                          │
│                                                                         │
│  Story → Arc → Event → Scene → Segment                                 │
│                                    │                                   │
│                           instantiates TimeLevel  ◄──── visual layer   │
│                                                                         │
│  TemporalLink types:  BEFORE · SIMULTANEOUS · IDENTITY                 │
│  VNG roles:   Establisher · Initial · Peak · Release · Refiner         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key concepts

```
        ╔═══════════════╗
        ║   CHARACTER   ║ ← local occurrence in one panel
        ╚═══════════╤═══╝
                    │ instantiates
        ╔═══════════╧═════╗
        ║  METACHARACTER  ║ ← persistent identity across the whole work
        ╚═════════════════╝
```

| Concept | What it models |
|---|---|
| **Book** | The work as a whole (covers manga, BD, comics, webtoon…) |
| **Plate** | A single page, with an `atmosphericLayer` for first-glance ambience |
| **Panel** | Described by a mask (not just a box); carries transition type (McCloud) and panel function (Cohn) |
| **TimeLevel** | A spatio-temporal stratum within a panel — required for *polychronic panels* where two time periods coexist |
| **MetaCharacter / Character** | Identity persistence pattern: one meta-node per character, one local node per panel occurrence |
| **Balloon** | Five types: Speech, Thought, Whisper, Exclamation, Broadcast |
| **Onomatopoeia** | Linked to its sound source via `hasOrigin`; can span multiple panels |
| **Caption** | Three types: Narrative, Effect, Internal |
| **NarrativeConstituent** | Five-level tree: Story → Arc → Event → Scene → Segment |
| **TemporalLink** | Encodes non-linear narrative (BEFORE / SIMULTANEOUS / IDENTITY) |
| **NarrativeLocation** | Recursive hierarchy of diegetic places |

---

```
  ╔══════════════════════════════════════════════════════════╗
  ║  *KABOOM*   Special panel types handled by 9thArtOnto   ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  POLYCHRONIC  │ Two time periods in one panel            ║
  ║  POLYPTYCH    │ One background across several panels     ║
  ║  POLYMORPHIC  │ One character at successive instants     ║
  ║               │ within one panel                         ║
  ║  LOCATIVE     │ Panel that sets the scene, no action     ║
  ║  BORDERLESS   │ Panels without a physical border         ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
```

---

## What's in this repository?

```
9thArtOnto/
└── 9thArtOnto.rdf   ← The OWL 2 ontology, serialised in RDF/XML
                        Namespace: http://www.semanticweb.org/ajaud02/seqartonto#
                        Editor: Protégé
```

The annotated knowledge graph (1 414 nodes · 2 307 arcs) built from the bande dessinée *Patents* (WIPO) is available in the **supplementary repository** linked in the paper.

---

## Applications

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Accessibility│  │ Automated    │  │ Cross-work   │  │     LLM      │
│ for visually │  │ plot         │  │ narrative    │  │  grounding   │
│ impaired     │  │ summarisation│  │ comparison   │  │  in comics   │
│  readers     │  │              │  │              │  │   content    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## How to use it

Load `9thArtOnto.rdf` in **[Protégé](https://protege.stanford.edu/)** to browse or extend the ontology, or use any OWL/RDF library to query it programmatically.

```python
# Example: load with rdflib (Python)
from rdflib import Graph

g = Graph()
g.parse("9thArtOnto.rdf")
print(f"{len(g)} triples loaded")
```

To query a knowledge graph conforming to 9thArtOnto, use SPARQL:

```sparql
# All balloons emitted by a specific character
PREFIX onto: <http://www.semanticweb.org/ajaud02/seqartonto#>

SELECT ?balloon ?text WHERE {
  ?balloon a onto:Balloon ;
           onto:emittedBy ?char .
  ?char onto:instantiates ?meta .
  ?meta rdfs:label "Asterix" .
  ?balloon onto:hasTextLine/onto:content ?text .
}
```

---

## Paper

```
  ╔════════════════════════════════════════════════════════════════╗
  ║  "9thArtOnto: Towards an ontology for representing visual     ║
  ║   and narrative structures"                                    ║
  ║                                                                ║
  ║  Presented at MANPU 2026                                       ║
  ║  (International Workshop on coMics ANalysis, Processing       ║
  ║   and Understanding)                                           ║
  ╚════════════════════════════════════════════════════════════════╝
```

---

## Limitations & future work

The current version deliberately keeps its scope focused. Known gaps include:

- **Social character relations** (friendship, rivalry, family ties) across the full work — planned as an extension aligned with GOLEM's relationship modules.
- **Implicit temporal markers** (a darkening sky, a changing season visible in the artwork).
- **Page layout structure** (Cohn's External Compositional Structure: rows, columns, overlapping insets).
- Validation on a broader, more narratively complex corpus.

---

```
╔══════════════════════════════════════════════════════════════╗
║                        *THE END*                             ║
║                                                              ║
║  Issues, suggestions, and pull requests are welcome.         ║
╚══════════════════════════════════════════════════════════════╝
```
