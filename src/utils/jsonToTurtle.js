const BASE = 'http://www.semanticweb.org/ajaud02/seqartonto#';

// JSON node type → ontology class
const TYPE_MAP = {
    book:           'Book',
    plate:          'Plate',
    panel:          'Panel',
    scene:          'Level',
    balloon:        'Balloon',
    caption:        'Caption',
    character:      'Character',
    metaCharacter: 'MetaCharacter',
    metaObject:    'MetaObject',
    object:         'Object',
    onomatopoeia:   'Onomatopoeia',
    event:          'Event',
    eventSegment:   'Segment',
    macroEvent:     'Story',
    interaction:    'Interaction',
};

// JSON data property key → ontology DatatypeProperty name
// (only overrides needed — identical names are handled automatically)
const DATA_PROP_MAP = {
    title:        'name',         // Book uses :name in the ontology
    balloon_type: 'balloonType',
};

// JSON edge relation → ontology ObjectProperty name
// For 'contains', we resolve based on target node type (see getEdgeProperty)
const RELATION_MAP = {
    hasPlate:          'hasPlate',
    hasNextPlate:      'hasNextPlate',
    is_character:      'isCharacter',
    is_object:         'isObject',
    next_text_line:    'nextTextLine',
    mentions:          'mentions',
    emittedBy:         'emittedBy',
    scene_graph_link:  'linkedTo',
    link_panel_spatial:'linkedTo',
    extra_link:        'linkedTo',
    reading_order:     'hasNextPanel',
    hasNextPanel:      'hasNextPanel',
    event_panel_link:  'hasEvent',
    event_segment_link:'hasSegment',
    macro_event_link:  'hasNarrativeUnit',
    hasInteraction:    'hasInteraction',
    hasAgent:          'hasAgent',
    hasPatient:        'hasPatient',
    hasInstrument:     'hasInstrument',
};

// Specific 'contains' resolution by target type
const CONTAINS_BY_TARGET = {
    plate:        'hasPlate',
    panel:        'hasPanel',
    scene:        'hasLevel',
    balloon:      'hasBalloon',
    caption:      'hasCaption',
    character:    'hasCharacter',
    object:       'hasObject',
    onomatopoeia: 'hasOnomatopoeia',
    textLine:     'hasTextLine',
};

// Properties to skip entirely (internal / rendering)
const SKIP_KEYS = new Set([
    'id', 'type',
    'vx', 'vy', 'index', 'fx', 'fy', 'x', 'y',
    'image', 'imgX', 'imgY',
]);

// Sanitize an id for use as a Turtle local name
const localName = (id) => id.replace(/[^a-zA-Z0-9_]/g, '_');

// Render a JS value as a Turtle literal
const renderLiteral = (value) => {
    if (typeof value === 'boolean') {
        return `"${value}"^^xsd:boolean`;
    }
    if (typeof value === 'number') {
        return Number.isInteger(value)
            ? `"${value}"^^xsd:integer`
            : `"${value}"^^xsd:decimal`;
    }
    const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
};

// Resolve the ontology property for an edge
const getEdgeProperty = (edge, nodes) => {
    if (edge.relation === 'contains') {
        const tgtType = nodes[edge.target]?.type;
        return CONTAINS_BY_TARGET[tgtType] || 'contains';
    }
    return RELATION_MAP[edge.relation]
        ?? edge.relation.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
};

// Main export
export function jsonToTurtle(jsonContent) {
    const nodes = jsonContent?.node || {};
    const edges  = jsonContent?.edge  || {};
    const lines  = [];

    // --- Prefixes ---
    lines.push(`@prefix :    <${BASE}> .`);
    lines.push('@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .');
    lines.push('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .');
    lines.push('@prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#> .');
    lines.push('');

    // --- Nodes ---
    for (const node of Object.values(nodes)) {
        const ontClass = TYPE_MAP[node.type] ?? node.type;
        const id = localName(node.id);

        const triples = [`a :${ontClass}`];

        for (const [key, value] of Object.entries(node)) {
            if (SKIP_KEYS.has(key)) continue;
            if (value === null || value === undefined) continue;
            if (typeof value === 'object') continue; // skip nested objects

            const prop = DATA_PROP_MAP[key]
                ?? key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

            triples.push(`:${prop} ${renderLiteral(value)}`);
        }

        lines.push(`:${id}`);
        lines.push('    ' + triples.join(' ;\n    ') + ' .');
        lines.push('');
    }

    // --- Edges (object properties) ---
    for (const edge of Object.values(edges)) {
        if (!edge.source || !edge.target) continue;
        const src  = localName(edge.source);
        const tgt  = localName(edge.target);
        const prop = getEdgeProperty(edge, nodes);
        lines.push(`:${src} :${prop} :${tgt} .`);
    }

    return lines.join('\n');
}