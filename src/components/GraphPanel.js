import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import FilterGraphMode from "./FilterGraphMode";
import NavigationGraphMode from "./NavigationGraphMode";
import SettingsPanel from "./SettingsPanel";
import NodeTooltip from "./NodeTooltip";
import Infobox from "./Infobox";
import { getNodeStyle } from '../nodeStyles';
import { useUI } from '../contexts/UIContext';

const GraphPanel = ({ jsonContent, setJsonContent, elements, setShownElements, shownElements, images = [] }) => {
    const { showFilterGraphMode: showFilter, setShowFilterGraphMode: setShowFilter,
            showGraphNavigation, setShowGraphNavigation } = useUI();
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // State for stats
    const [stats, setStats] = useState({ nodes: 0, edges: 0 });

    // Navigation States
    const [panelNeighbours, setPanelNeighbours] = useState(0);
    const [activeNode, setActiveNode] = useState(null);
    const [navigationVisibleIds, setNavigationVisibleIds] = useState(new Set());
    const [isNavigating, setIsNavigating] = useState(false);

    // State pour le tooltip
    const [tooltip, setTooltip] = useState(null);

    // State pour le noeud sélectionné (infobox éditable)
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    // State pour le menu contextuel (clic droit)
    const [contextMenu, setContextMenu] = useState(null);

    // State pour le type de vue metaCharacter (apparitions ou mentions)
    const [metaCharacterViewMode, setMetaCharacterViewMode] = useState(null); // 'apparitions' ou 'mentions'

    // ----------------------------------------------------------------
    // LOGIC: Calculate Reading Order
    // ----------------------------------------------------------------
    const getReadingOrder = () => {
        if (!jsonContent || !jsonContent.edge) return [];
        const edges = Object.values(jsonContent.edge);
        const readingEdges = edges.filter(e => e.relation === 'hasNextPanel' || e.relation === 'reading_order');
        if (readingEdges.length === 0) return [];

        // Trouver le premier panel (celui qui n'est target d'aucune arête de lecture)
        const targets = new Set(readingEdges.map(e => e.target));
        const startNodeId = readingEdges.find(e => !targets.has(e.source))?.source;
        if (!startNodeId) return [];

        // Construire la liste ordonnée
        const order = [startNodeId];
        let currentId = startNodeId;
        while (true) {
            const nextEdge = readingEdges.find(e => e.source === currentId);
            if (!nextEdge) break;
            order.push(nextEdge.target);
            currentId = nextEdge.target;
        }
        return order;
    };

    const readingOrder = getReadingOrder();
    const currentPanelIndex = activeNode && readingOrder.includes(activeNode)
        ? readingOrder.indexOf(activeNode) + 1
        : null;
    const totalPanels = readingOrder.length;

    // ----------------------------------------------------------------
    // LOGIC: Start Navigation
    // ----------------------------------------------------------------
    const handleStartNavigation = () => {
        if (!jsonContent || !jsonContent.edge) return;
        const edges = Object.values(jsonContent.edge);
        const readingEdges = edges.filter(e => e.relation === 'hasNextPanel' || e.relation === 'reading_order');
        if (readingEdges.length === 0) return;

        const targets = new Set(readingEdges.map(e => e.target));
        const startNodeId = readingEdges.find(e => !targets.has(e.source))?.source;

        if (startNodeId) {
            setActiveNode(startNodeId);
            setIsNavigating(true);
        }
    };

    const handleStopNavigation = () => {
        setIsNavigating(false);
        setActiveNode(null);
        setNavigationVisibleIds(new Set());
        setMetaCharacterViewMode(null);
    };

    const handleNextNode = () => {
        if (!activeNode || !jsonContent || !jsonContent.edge) return;
        const edges = Object.values(jsonContent.edge);
        const nextEdge = edges.find(e =>
            (e.relation === 'hasNextPanel' || e.relation === 'reading_order') && e.source === activeNode
        );
        if (nextEdge) {
            setActiveNode(nextEdge.target);
        }
    };

    const handlePreviousNode = () => {
        if (!activeNode || !jsonContent || !jsonContent.edge) return;
        const edges = Object.values(jsonContent.edge);
        const prevEdge = edges.find(e =>
            (e.relation === 'hasNextPanel' || e.relation === 'reading_order') && e.target === activeNode
        );
        if (prevEdge) {
            setActiveNode(prevEdge.source);
        }
    };

    // Démarrer la navigation sur un noeud spécifique (via clic droit)
    const handleStartNavigationFromNode = (nodeId) => {
        setActiveNode(nodeId);
        setIsNavigating(true);
        setContextMenu(null);
    };

    // Voir les apparitions d'un metaCharacter (characters liés via is_character)
    const handleViewApparitions = (nodeId) => {
        setMetaCharacterViewMode('apparitions');
        setActiveNode(nodeId);
        setIsNavigating(true);
        setContextMenu(null);
    };

    // Voir les mentions d'un metaCharacter (balloons/captions qui le mentionnent)
    const handleViewMentions = (nodeId) => {
        setMetaCharacterViewMode('mentions');
        setActiveNode(nodeId);
        setIsNavigating(true);
        setContextMenu(null);
    };

    // Voir les voisins directs d'un nœud (tous les nœuds connectés)
    const handleViewNeighbors = (nodeId) => {
        setMetaCharacterViewMode('neighbors');
        setActiveNode(nodeId);
        setIsNavigating(true);
        setContextMenu(null);
    };

    // Voir la narration d'une Story (Story → Arc → Event → Segment via hasNarrativeUnit)
    const handleViewNarration = (nodeId) => {
        setMetaCharacterViewMode('narration');
        setActiveNode(nodeId);
        setIsNavigating(true);
        setContextMenu(null);
    };


    // ----------------------------------------------------------------
    // LOGIC: Calculate Neighbors & Context
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!activeNode || !jsonContent) return;

        const edges = Object.values(jsonContent.edge);
        const nodes = jsonContent.node;
        const activeNodeData = nodes[activeNode];

        // CAS SPECIAL : Si le nœud actif est un metaCharacter
        if (activeNodeData?.type === 'metaCharacter') {
            const idsToShow = new Set();
            idsToShow.add(activeNode);

            if (metaCharacterViewMode === 'mentions') {
                // Mode Mentions : Trouver tous les balloons/captions qui mentionnent ce metaCharacter
                edges.forEach(e => {
                    if (e.relation === 'mentions' && e.target === activeNode) {
                        const sourceNode = nodes[e.source];
                        if (sourceNode && (sourceNode.type === 'balloon' || sourceNode.type === 'caption')) {
                            idsToShow.add(e.source);
                        }
                    }
                });
            } else {
                // Mode Apparitions : characters liés via isCharacter (ou is_character, legacy)
                edges.forEach(e => {
                    if (e.relation === 'isCharacter') {
                        if (e.target === activeNode) {
                            idsToShow.add(e.source);
                        }
                        if (e.source === activeNode) {
                            idsToShow.add(e.target);
                        }
                    }
                });
            }

            setNavigationVisibleIds(idsToShow);
            return;
        }

        // CAS SPECIAL : Si le nœud actif est un metaObject
        if (activeNodeData?.type === 'metaObject') {
            const idsToShow = new Set();
            idsToShow.add(activeNode);

            // Mode Apparitions : Trouver uniquement les objects liés via isObject
            edges.forEach(e => {
                if (e.relation === 'isObject' || e.relation === 'is_object') {
                    if (e.target === activeNode) {
                        idsToShow.add(e.source);
                    }
                    if (e.source === activeNode) {
                        idsToShow.add(e.target);
                    }
                }
            });

            setNavigationVisibleIds(idsToShow);
            return;
        }

        // CAS SPECIAL : Mode narration (Story → Arc → Event → Segment via hasNarrativeUnit)
        if (metaCharacterViewMode === 'narration') {
            const idsToShow = new Set();
            const queue = [activeNode];
            idsToShow.add(activeNode);

            while (queue.length > 0) {
                const currentId = queue.shift();
                edges.forEach(e => {
                    if (e.relation === 'hasNarrativeUnit' && e.source === currentId && !idsToShow.has(e.target)) {
                        idsToShow.add(e.target);
                        queue.push(e.target);
                    }
                });
            }

            // Ajouter les TemporalLinks dont un des events est dans la narration
            edges.forEach(e => {
                if ((e.relation === 'hasSourceEvent' || e.relation === 'hasTargetEvent') && idsToShow.has(e.target)) {
                    idsToShow.add(e.source); // le nœud TemporalLink
                    // Ajouter aussi l'autre event relié à ce TemporalLink
                    edges.forEach(e2 => {
                        if ((e2.relation === 'hasSourceEvent' || e2.relation === 'hasTargetEvent') && e2.source === e.source) {
                            idsToShow.add(e2.target);
                        }
                    });
                }
            });

            setNavigationVisibleIds(idsToShow);
            return;
        }

        // CAS SPECIAL : Mode voisins directs (pour n'importe quel nœud)
        if (metaCharacterViewMode === 'neighbors') {
            const idsToShow = new Set();
            idsToShow.add(activeNode);

            // Trouver tous les nœuds directement connectés
            edges.forEach(e => {
                if (e.source === activeNode) {
                    idsToShow.add(e.target);
                }
                if (e.target === activeNode) {
                    idsToShow.add(e.source);
                }
            });

            setNavigationVisibleIds(idsToShow);
            return;
        }

        const getNeighbors = (id) => {
            const n = [];
            edges.forEach(e => {
                if (e.source === id) n.push(e.target);
                if (e.target === id) n.push(e.source);
            });
            return n;
        };

        const idsToShow = new Set();
        idsToShow.add(activeNode);

        const level1 = getNeighbors(activeNode);
        level1.forEach(id => idsToShow.add(id));

        const scenes = [...idsToShow].filter(id => nodes[id]?.type === 'scene');
        scenes.forEach(sceneId => {
            const sceneNeighbors = getNeighbors(sceneId);
            sceneNeighbors.forEach(id => idsToShow.add(id));
        });

        // BFS directionnel (arêtes sortantes uniquement) pour descendre dans la hiérarchie
        // sans remonter dans d'autres branches (évite l'explosion du graphe)
        const expandableTypes = new Set([
            'level', 'character', 'object', 'balloon', 'caption',
            'onomatopoeia', 'extra', 'interaction', 'textLine'
        ]);
        const bfsProcessed = new Set();
        const bfsQueue = [...idsToShow];
        while (bfsQueue.length > 0) {
            const id = bfsQueue.shift();
            if (bfsProcessed.has(id)) continue;
            bfsProcessed.add(id);
            const node = nodes[id];
            if (!node) continue;
            if (expandableTypes.has(node.type)) {
                // Arêtes sortantes uniquement, sauf nextNarrativeTextLine (non utilisé pour découvrir des noeuds)
                edges.forEach(e => {
                    if (e.source !== id) return;
                    if (e.relation === 'nextNarrativeTextLine' || e.relation === 'next_text_line') return;
                    if (!idsToShow.has(e.target)) idsToShow.add(e.target);
                    if (!bfsProcessed.has(e.target)) bfsQueue.push(e.target);
                });
                // Exception : Segment instantiates Level (arête entrante)
                if (node.type === 'level') {
                    edges.forEach(e => {
                        if (e.relation === 'instantiates' && e.target === id) {
                            if (!idsToShow.has(e.source)) idsToShow.add(e.source);
                        }
                    });
                }
            }
        }

        // Remonter jusqu'aux plates et books
        const plates = [...idsToShow].filter(id => nodes[id]?.type === 'plate');
        plates.forEach(plateId => {
            const plateNeighbors = getNeighbors(plateId);
            plateNeighbors.forEach(nid => {
                if (nodes[nid]?.type === 'book') {
                    idsToShow.add(nid);
                }
            });
        });

        // Si un panel est visible, chercher son plate parent et le book associé
        const panels = [...idsToShow].filter(id => nodes[id]?.type === 'panel');
        panels.forEach(panelId => {
            const panelNeighbors = getNeighbors(panelId);
            panelNeighbors.forEach(nid => {
                if (nodes[nid]?.type === 'plate') {
                    idsToShow.add(nid);
                    // Puis remonter au book
                    const plateNeighbors = getNeighbors(nid);
                    plateNeighbors.forEach(bookId => {
                        if (nodes[bookId]?.type === 'book') {
                            idsToShow.add(bookId);
                        }
                    });
                }
            });
        });

        // Remonter à l'evenement et au macroEvent
        const eventSegment = [...idsToShow].filter(id => nodes[id]?.type === 'eventSegment');
        eventSegment.forEach(id => {
            const eventSegmentNeighbors = getNeighbors(id);
            eventSegmentNeighbors.forEach(id => {
                if (nodes[id]?.type === 'event') {
                    idsToShow.add(id);
                    const eventNeighbors = getNeighbors(id);
                    eventNeighbors.forEach(nid => {
                        if (nodes[nid]?.type === 'macroEvent') {
                            idsToShow.add(nid);
                        }
                    })
                }
            })
        })


        setNavigationVisibleIds(idsToShow);

    }, [activeNode, jsonContent, metaCharacterViewMode]);


    // ----------------------------------------------------------------
    // EFFECT 1: Heavy Simulation
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!jsonContent || !jsonContent.node) return;

        // CORRECTION ICI : Sauvegarde des coordonnées JSON avant que D3 ne les écrase
        const nodes = Object.values(jsonContent.node).map(d => ({
            ...d,
            imgX: d.x, // On sauvegarde x (position image)
            imgY: d.y  // On sauvegarde y (position image)
        }));

        const links = Object.values(jsonContent.edge).map(d => ({ ...d }));

        // Pré-calcul pour courber les arêtes multiples entre mêmes nœuds
        const linkGroups = {};
        links.forEach(link => {
            // Clé unique pour chaque paire de nœuds (indépendante de la direction)
            const key = [link.source, link.target].sort().join('|');
            if (!linkGroups[key]) {
                linkGroups[key] = [];
            }
            linkGroups[key].push(link);
        });

        // Attribuer un index et le total à chaque arête
        Object.values(linkGroups).forEach(group => {
            group.forEach((link, i) => {
                link.linkIndex = i;
                link.linkTotal = group.length;
            });
        });

        const width = containerRef.current ? containerRef.current.clientWidth : 800;
        const height = containerRef.current ? containerRef.current.clientHeight : 600;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const defs = svg.append("defs");

        defs.append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 28)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");

        // Animation de clignotement pour le nœud actif
        defs.append("style").text(`
            @keyframes blink {
                0%, 100% { stroke-opacity: 1; stroke-width: 4; }
                50% { stroke-opacity: 0.3; stroke-width: 2; }
            }
            .active-node rect, .active-node circle, .active-node polygon {
                stroke: #3b82f6 !important;
                animation: blink 1s ease-in-out infinite;
            }
        `);

        const g = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.02, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setTooltip(null);
            });
        svg.call(zoom);

        const simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(30))
            .force("link", d3.forceLink(links).id(d => d.id).distance(150));

        const appendNodeShape = (nodeGroup, type) => {
            const { shape, color, stroke, d3Size: s = 20, d3Points } = getNodeStyle(type);
            const apply = el => el.attr('fill', color).attr('stroke', stroke).attr('stroke-width', 2);
            if (d3Points) {
                apply(nodeGroup.append('polygon').attr('points', d3Points));
            } else if (shape === 'rect') {
                apply(nodeGroup.append('rect').attr('width', s * 2).attr('height', s * 2).attr('x', -s).attr('y', -s));
            } else if (shape === 'diamond') {
                apply(nodeGroup.append('polygon').attr('points', `0,-${s} ${s},0 0,${s} -${s},0`));
            } else {
                apply(nodeGroup.append('circle').attr('r', s));
            }
        };

        const getEdgeColor = (relation) => {
            switch(relation) {
                case 'isCharacter':
                case 'is_character': return '#FF00FF';
                case 'isObject':
                case 'is_object': return '#DAA520';
                default: return '#999999';
            }
        };

        // Fonction pour calculer le chemin courbé d'une arête
        const getLinkPath = (d) => {
            const sx = d.source.x;
            const sy = d.source.y;
            const tx = d.target.x;
            const ty = d.target.y;

            // Si une seule arête entre ces deux nœuds, ligne droite
            if (d.linkTotal === 1) {
                return `M${sx},${sy}L${tx},${ty}`;
            }

            // Calcul du décalage pour la courbure
            const dx = tx - sx;
            const dy = ty - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Vecteur perpendiculaire normalisé
            const nx = -dy / dist;
            const ny = dx / dist;

            // Espacement entre les arêtes (en pixels)
            const spacing = 25;
            // Décalage centré: pour n arêtes, les offsets vont de -(n-1)/2 à (n-1)/2
            const offset = (d.linkIndex - (d.linkTotal - 1) / 2) * spacing;

            // Point de contrôle au milieu, décalé perpendiculairement
            const midX = (sx + tx) / 2 + nx * offset;
            const midY = (sy + ty) / 2 + ny * offset;

            // Courbe de Bézier quadratique
            return `M${sx},${sy}Q${midX},${midY} ${tx},${ty}`;
        };

        const linkElements = g.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(links)
            .enter()
            .append("path")
            .attr("stroke", d => getEdgeColor(d.relation))
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("stroke-dasharray", d => {
                const dashedRelations = ['isCharacter', 'is_character', 'is_object', 'isObject', 'next_text_line', 'nextNarrativeTextLine'];
                return dashedRelations.includes(d.relation) ? "5,5" : null;
            });

        const linkLabels = g.append("g")
            .attr("class", "link-labels")
            .selectAll("text")
            .data(links)
            .enter()
            .append("text")
            .text(d => {
                if (d.relation === 'scene_graph_link') return d.name || d.relation;
                if (d.relation === 'emittedBy') return d.relation;
                if (d.relation === 'link_panel_spatial') return d.type || d.relation;
                if (d.relation === 'extra_link') return d.name || d.relation;
                return d.relation;
            })
            .attr("font-size", "10px")
            .attr("fill", "#666")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("display", "none");

        const nodeGroups = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", (event, d) => {
                const x = event.clientX;
                const y = event.clientY;
                let enrichedData = d;
                const allEdges = Object.values(jsonContent.edge);

                // Résolution image (crop) pour tous les noeuds avec borderPoints sans image directe
                if (!d.image && d.borderPoints) {
                    const findImgFromPlate = (plate) => {
                        if (!plate || plate.hasNumber === undefined) return null;
                        return images[plate.hasNumber - 1] || null;
                    };
                    let imgEntry = null;
                    if (d.type === 'panel') {
                        const e = allEdges.find(e => e.relation === 'hasPanel' && e.target === d.id);
                        if (e) imgEntry = findImgFromPlate(jsonContent.node[e.source]);
                    } else {
                        // Contenu → Level → Panel → Plate
                        const toLevel = allEdges.find(e => e.target === d.id &&
                            ['hasCharacter','hasBalloon','hasObject','hasOnomatopoeia','hasCaption'].includes(e.relation));
                        if (toLevel) {
                            const toPanelEdge = allEdges.find(e => e.relation === 'hasLevel' && e.target === toLevel.source);
                            if (toPanelEdge) {
                                const toPlateEdge = allEdges.find(e => e.relation === 'hasPanel' && e.target === toPanelEdge.source);
                                if (toPlateEdge) imgEntry = findImgFromPlate(jsonContent.node[toPlateEdge.source]);
                            }
                        }
                    }
                    if (imgEntry) enrichedData = { ...enrichedData, image: imgEntry.name };
                }

                // Nom du MetaCharacter pour les characters
                if (d.type === 'character') {
                    const isCharEdge = allEdges.find(e => e.relation === 'isCharacter' && e.source === d.id);
                    if (isCharEdge) {
                        const meta = jsonContent.node[isCharEdge.target];
                        if (meta?.name) enrichedData = { ...enrichedData, metaCharacterName: meta.name };
                    }
                }

                setTooltip({ x, y, data: enrichedData });
                d3.select(event.currentTarget).select("rect, circle, polygon").attr("stroke-width", 4);
            })
            .on("mouseout", (event, d) => {
                setTooltip(null);
                d3.select(event.currentTarget).select("rect, circle, polygon").attr("stroke-width", 2);
            })
            .on("click", (event, d) => {
                event.stopPropagation();
                setTooltip(null);
                setSelectedNodeId(prev => prev === d.id ? null : d.id);
            })
            .on("contextmenu", (event, d) => {
                event.preventDefault();
                setTooltip(null);
                setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    nodeId: d.id,
                    nodeType: d.type
                });
            });

        nodeGroups.each(function(d) {
            appendNodeShape(d3.select(this), d.type);
        });

        // Fonction pour calculer la position du label sur une arête courbée
        const getLinkLabelPosition = (d) => {
            const sx = d.source.x;
            const sy = d.source.y;
            const tx = d.target.x;
            const ty = d.target.y;

            if (d.linkTotal === 1) {
                return { x: (sx + tx) / 2, y: (sy + ty) / 2 };
            }

            const dx = tx - sx;
            const dy = ty - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / dist;
            const ny = dx / dist;
            const spacing = 25;
            const offset = (d.linkIndex - (d.linkTotal - 1) / 2) * spacing;

            // Position au milieu de la courbe (point de contrôle)
            return {
                x: (sx + tx) / 2 + nx * offset,
                y: (sy + ty) / 2 + ny * offset
            };
        };

        simulation.on("tick", () => {
            linkElements.attr("d", getLinkPath);
            linkLabels
                .attr("x", d => getLinkLabelPosition(d).x)
                .attr("y", d => getLinkLabelPosition(d).y);
            nodeGroups
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
            setTooltip(null);
        }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => simulation.stop();

    }, [jsonContent]);


    // ----------------------------------------------------------------
    // EFFECT 2: Display Logic
    // ----------------------------------------------------------------
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const nodeGroups = svg.selectAll(".nodes g");
        const linkElements = svg.selectAll(".links path");
        const linkLabels = svg.selectAll(".link-labels text");

        if (nodeGroups.empty()) return;

        if (activeNode) {
            let visibleNodeCount = 0;
            nodeGroups.style("display", function(d) {
                const isVisible = navigationVisibleIds.has(d.id);
                if (isVisible) visibleNodeCount++;
                return isVisible ? null : "none";
            });

            // Appliquer la classe active-node au nœud actif pour le clignotement
            nodeGroups.classed("active-node", d => d.id === activeNode);

            let visibleEdgeCount = 0;
            linkElements.attr("marker-end", "url(#arrow)");
            linkElements.style("display", function(d) {
                const sourceVisible = navigationVisibleIds.has(d.source.id);
                const targetVisible = navigationVisibleIds.has(d.target.id);
                const isVisible = sourceVisible && targetVisible;
                if (isVisible) visibleEdgeCount++;
                return isVisible ? null : "none";
            });
            linkLabels.style("display", function(d) {
                const sourceVisible = navigationVisibleIds.has(d.source.id);
                const targetVisible = navigationVisibleIds.has(d.target.id);
                // On affiche le label SEULEMENT si la navigation est active et les deux nœuds visibles
                return (isNavigating && sourceVisible && targetVisible) ? null : "none";
            });
            setStats({ nodes: visibleNodeCount, edges: visibleEdgeCount });
        } else {
            // Retirer la classe active-node de tous les nœuds
            nodeGroups.classed("active-node", false);

            let visibleNodeCount = 0;
            nodeGroups.style("display", function(d) {
                const isVisible = shownElements.includes(d.type);
                if (isVisible) visibleNodeCount++;
                return isVisible ? null : "none";
            });

            let visibleEdgeCount = 0;
            linkElements.attr("marker-end", null);
            linkElements.style("display", function(d) {
                const sourceVisible = d.source && shownElements.includes(d.source.type);
                const targetVisible = d.target && shownElements.includes(d.target.type);
                const linkType = d.relation || d.type;
                const isLinkTypeControlled = elements.includes(linkType);
                const isLinkTypeChecked = shownElements.includes(linkType);
                const linkVisible = isLinkTypeControlled ? isLinkTypeChecked : true;
                const isVisible = sourceVisible && targetVisible && linkVisible;

                if (isVisible) visibleEdgeCount++;
                return isVisible ? null : "none";
            });
            linkLabels.style("display", "none");
            setStats({ nodes: visibleNodeCount, edges: visibleEdgeCount });
        }

    }, [shownElements, jsonContent, elements, activeNode, navigationVisibleIds, isNavigating]);


    return (
        <>
            <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
                <svg
                    ref={svgRef}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    onClick={() => setSelectedNodeId(null)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        // Si on est en navigation et qu'on clique sur le fond (pas sur un nœud)
                        if (isNavigating && e.target === svgRef.current) {
                            setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                nodeId: null,
                                nodeType: null
                            });
                        }
                    }}
                ></svg>

                {/* --- TOOLTIP --- */}
                <NodeTooltip tooltip={tooltip} images={images} />

                {/* --- INFOBOX (noeud sélectionné au clic) --- */}
                {selectedNodeId && jsonContent?.node?.[selectedNodeId] && (
                    <Infobox
                        selectedElement={jsonContent.node[selectedNodeId]}
                        onDelete={null}
                        onHide={() => setSelectedNodeId(null)}
                        setJsonContent={setJsonContent}
                        jsonContent={jsonContent}
                        onLevelHover={null}
                    />
                )}

                {/* --- MENU CONTEXTUEL (clic droit) --- */}
                {contextMenu && (
                    <>
                        {/* Overlay pour fermer le menu au clic */}
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 9998
                            }}
                            onClick={() => setContextMenu(null)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu(null);
                            }}
                        />
                        <div
                            style={{
                                position: 'fixed',
                                left: contextMenu.x,
                                top: contextMenu.y,
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                zIndex: 9999,
                                minWidth: '180px',
                                overflow: 'hidden'
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {contextMenu.nodeType && (
                                <>
                                    <div style={{
                                        padding: '8px 12px',
                                        borderBottom: '1px solid #e5e7eb',
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        letterSpacing: '0.05em'
                                    }}>
                                        {contextMenu.nodeType}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(contextMenu.nodeId);
                                            setContextMenu(null);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy ID
                                    </button>
                                    <button
                                        onClick={() => handleViewNeighbors(contextMenu.nodeId)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <circle cx="4" cy="6" r="2"></circle>
                                            <circle cx="20" cy="6" r="2"></circle>
                                            <circle cx="4" cy="18" r="2"></circle>
                                            <circle cx="20" cy="18" r="2"></circle>
                                            <line x1="9.5" y1="10" x2="5.5" y2="7"></line>
                                            <line x1="14.5" y1="10" x2="18.5" y2="7"></line>
                                            <line x1="9.5" y1="14" x2="5.5" y2="17"></line>
                                            <line x1="14.5" y1="14" x2="18.5" y2="17"></line>
                                        </svg>
                                        View neighbors
                                    </button>
                                </>
                            )}
                            {contextMenu.nodeType === 'panel' && (
                                <button
                                    onClick={() => handleStartNavigationFromNode(contextMenu.nodeId)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#3b82f6">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Start navigation here
                                </button>
                            )}
                            {contextMenu.nodeType === 'metaCharacter' && !isNavigating && (
                                <>
                                    <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                                    <button
                                        onClick={() => handleViewApparitions(contextMenu.nodeId)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                                            <circle cx="10" cy="10" r="8" fill="#FF0000" stroke="#000000" strokeWidth="1" />
                                        </svg>
                                        View appearances
                                    </button>
                                    <button
                                        onClick={() => handleViewMentions(contextMenu.nodeId)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="16" viewBox="0 0 34 20">
                                            {/* Carré rose (caption) */}
                                            <rect x="1" y="4" width="12" height="12" fill="#ffadf2" stroke="#000000" strokeWidth="1" />
                                            {/* Cercle bleu (balloon) */}
                                            <circle cx="27" cy="10" r="6" fill="#90D5FF" stroke="#000000" strokeWidth="1" />
                                        </svg>
                                        View mentions
                                    </button>
                                </>
                            )}
                            {contextMenu.nodeType === 'story' && !isNavigating && (
                                <>
                                    <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                                    <button
                                        onClick={() => handleViewNarration(contextMenu.nodeId)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                                            <polygon points="10,1 19,10 10,19 1,10" fill="#1A0040" stroke="#9B30FF" strokeWidth="1.5" />
                                            <polygon points="10,4 16,10 10,16 4,10" fill="#3D006E" stroke="#C76BFF" strokeWidth="1" />
                                            <polygon points="10,7 13,10 10,13 7,10" fill="#C76BFF" stroke="#000000" strokeWidth="0.5" />
                                        </svg>
                                        View Narration
                                    </button>
                                </>
                            )}
                            {contextMenu.nodeType === 'metaObject' && !isNavigating && (
                                <>
                                    <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                                    <button
                                        onClick={() => handleViewApparitions(contextMenu.nodeId)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                                            <circle cx="10" cy="10" r="8" fill="#FFBF00" stroke="#000000" strokeWidth="1" />
                                        </svg>
                                        View appearances
                                    </button>
                                </>
                            )}
                            {isNavigating && (
                                <button
                                    onClick={() => {
                                        handleStopNavigation();
                                        setContextMenu(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                    </svg>
                                    Stop navigation
                                </button>
                            )}
                        </div>
                    </>
                )}

<div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    display: 'flex', gap: 12,
                    padding: '6px 14px',
                    background: '#ffe033',
                    border: '3px solid #1a1a2e',
                    borderRadius: '8px',
                    boxShadow: '3px 3px 0px #1a1a2e',
                    fontFamily: "'Bangers', cursive",
                    fontSize: '16px',
                    letterSpacing: '0.06em',
                    color: '#1a1a2e',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}>
                    <span>Nodes: {stats.nodes}</span>
                    <span style={{ borderLeft: '2px solid #1a1a2e', margin: '0 2px' }} />
                    <span>Edges: {stats.edges}</span>
                </div>
            </div>
            <FilterGraphMode
                elements={elements}
                shownElements={shownElements}
                setShownElements={setShownElements}
                jsonContent={jsonContent}
                setJsonContent={setJsonContent}
            />
            <NavigationGraphMode
                panelNeighbours={panelNeighbours}
                setPanelNeighbours={setPanelNeighbours}
                onStartNavigation={handleStartNavigation}
                isNavigating={isNavigating}
                onStopNavigation={handleStopNavigation}
                onNextNode={handleNextNode}
                onPreviousNode={handlePreviousNode}
                currentPanelIndex={currentPanelIndex}
                totalPanels={totalPanels}
            />
            <SettingsPanel />
        </>
    );
};

export default GraphPanel;