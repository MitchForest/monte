import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();

const DOCS = [
  { file: '.docs/scraping/k-2.md', gradeSpan: 'K-2', sourceId: 'k-2' },
  { file: '.docs/scraping/2-5.md', gradeSpan: '2-5', sourceId: '2-5' },
];

const numberPattern = /(\d{1,3}(?:,\d{3})*|\d+)/;

async function main() {
  const taxonomyConfigPath = path.join(ROOT, 'packages/curriculum-service/content/taxonomy/taxonomy.config.json');
  const taxonomyConfig = JSON.parse(await fs.readFile(taxonomyConfigPath, 'utf8'));
  const taxonomy = prepareTaxonomy(taxonomyConfig);

  const rawItems = [];

  for (const doc of DOCS) {
    const absolute = path.join(ROOT, doc.file);
    const text = await fs.readFile(absolute, 'utf8');
    rawItems.push(...parseDocument({ ...doc, text }));
  }

  const { nodes, relationships } = buildGraph(rawItems, taxonomy);

  const outDir = path.join(ROOT, 'packages/curriculum-service/content/taxonomy');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, 'skills.json'),
    JSON.stringify(nodes, null, 2),
    'utf8',
  );
  await fs.writeFile(
    path.join(outDir, 'relationships.json'),
    JSON.stringify(relationships, null, 2),
    'utf8',
  );

  summarizeGraph(nodes, relationships);
}

function parseDocument({ text, gradeSpan, sourceId }) {
  const lines = text.split(/\r?\n/);
  let currentDomain = '';
  let currentStrand = '';
  let currentCluster = '';
  let currentRit = null;
  let awaitingStrand = false;
  let awaitingCluster = false;
  const items = [];
  let itemCounter = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.replace(/\r/g, '').trim();
    if (!line) {
      continue;
    }

    const nextNonEmpty = (() => {
      for (let lookahead = index + 1; lookahead < lines.length; lookahead += 1) {
        const candidate = lines[lookahead].replace(/\r/g, '').trim();
        if (candidate) return candidate;
      }
      return null;
    })();

    if (nextNonEmpty && nextNonEmpty.startsWith('RIT Score') && !/^\d+\./.test(line)) {
      currentDomain = line;
      currentStrand = '';
      currentCluster = '';
      awaitingStrand = false;
      awaitingCluster = false;
      continue;
    }

    if (line.startsWith('RIT Score')) {
      currentRit = parseRitBand(line.slice('RIT Score:'.length).trim());
      awaitingStrand = true;
      awaitingCluster = false;
      currentStrand = '';
      currentCluster = '';
      continue;
    }

    const itemMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (itemMatch) {
      const [, idx, skillText] = itemMatch;
      itemCounter += 1;
      if (awaitingCluster && !currentCluster) {
        currentCluster = currentStrand || currentDomain;
        awaitingCluster = false;
      }
      items.push({
        id: `${sourceId}-${itemCounter}`,
        order: Number(idx),
        raw: skillText.trim(),
        rawLine: line,
        gradeSpan,
        sourceId,
        domain: currentDomain,
        strand: currentStrand,
        cluster: currentCluster,
        rit: currentRit,
      });
      continue;
    }

    if (!currentRit) {
      currentDomain = line;
      continue;
    }

    if (awaitingStrand) {
      currentStrand = line;
      awaitingStrand = false;
      awaitingCluster = true;
      continue;
    }

    if (awaitingCluster) {
      currentCluster = line;
      awaitingCluster = false;
      continue;
    }

    if (isLikelyStrand(line)) {
      currentStrand = line;
      currentCluster = '';
      awaitingCluster = true;
      continue;
    }

    currentCluster = line;
  }

  return items;
}

function isLikelyStrand(text) {
  const strandKeywords = [
    'Whole',
    'Number',
    'Use Place Value',
    'Represent',
    'Geometry',
    'Measurement',
    'Data',
    'Operations',
    'Algebra',
    'Fractions',
    'Ratios',
    'Expressions',
    'Equations',
    'Numerical',
    'Computations',
    'Number Patterns',
    'Measurement',
    'Understanding',
  ];
  return strandKeywords.some((keyword) => text.startsWith(keyword));
}

function parseRitBand(label) {
  const cleaned = label.replace(/\.$/, '').trim();

  if (/less than/i.test(cleaned)) {
    const match = cleaned.match(numberPattern);
    const limit = match ? parseNumber(match[1]) : null;
    return {
      label: cleaned,
      min: null,
      max: limit,
      minInclusive: false,
      maxInclusive: false,
    };
  }

  if (/\+/i.test(cleaned)) {
    const match = cleaned.match(numberPattern);
    const start = match ? parseNumber(match[1]) : null;
    return {
      label: cleaned,
      min: start,
      max: null,
      minInclusive: true,
      maxInclusive: false,
    };
  }

  const rangeMatch = cleaned.match(/(\d[\d,]*)\s*[–-]\s*(\d[\d,]*)/);
  if (rangeMatch) {
    const [, minRaw, maxRaw] = rangeMatch;
    return {
      label: cleaned,
      min: parseNumber(minRaw),
      max: parseNumber(maxRaw),
      minInclusive: true,
      maxInclusive: true,
    };
  }

  const exactMatch = cleaned.match(numberPattern);
  if (exactMatch) {
    const value = parseNumber(exactMatch[1]);
    return {
      label: cleaned,
      min: value,
      max: value,
      minInclusive: true,
      maxInclusive: true,
    };
  }

  return {
    label: cleaned,
    min: null,
    max: null,
    minInclusive: false,
    maxInclusive: false,
  };
}

function parseNumber(raw) {
  if (!raw) return null;
  return Number(raw.replace(/,/g, ''));
}

function buildGraph(items, taxonomy) {
  const nodesMap = new Map();
  const descriptorGroups = new Map();

  for (const item of items) {
    const normalized = normalizeSkill(item);
    const key = normalized.key;

    if (!nodesMap.has(key)) {
      nodesMap.set(key, createNodeSkeleton(normalized));
    }

    const node = nodesMap.get(key);
    augmentNode(node, normalized, item);

    if (!descriptorGroups.has(node.baseDescriptor)) {
      descriptorGroups.set(node.baseDescriptor, new Set());
    }
    descriptorGroups.get(node.baseDescriptor).add(node.id);
  }

  const nodes = Array.from(nodesMap.values()).sort((a, b) => a.id.localeCompare(b.id));

  for (const node of nodes) {
    const unit = classifyUnit(node, taxonomy);
    node.unitId = unit.id;
    node.unitName = unit.name;
  }

  const relationships = buildPrerequisiteEdges(nodes, descriptorGroups, taxonomy);

  for (const node of nodes) {
    node.gradeSpans = Array.from(node.gradeSpans).sort();
    node.domains = Array.from(node.domains).sort();
    node.strands = Array.from(node.strands).sort();
    node.clusters = Array.from(node.clusters).sort();
    node.ritBands.sort((a, b) => (a.min ?? 0) - (b.min ?? 0));
    node.sources.sort((a, b) => a.ritLabel.localeCompare(b.ritLabel));
    delete node.baseDescriptor;
    delete node.sourceKeys;
    delete node.minSourceOrder;
  }

  return { nodes, relationships };
}

function normalizeSkill(item) {
  const raw = item.raw;
  const [descPart] = raw.split(/\s+[-–]\s+/);
  const desc = descPart ? descPart.trim() : raw.trim();
  const { verb, focus } = splitVerbAndFocus(desc);
  const baseDescriptor = desc.toLowerCase();

  const range = extractRange(raw);
  const representations = inferRepresentations(raw);
  const contexts = inferContexts(raw);
  const operation = inferOperation(verb, raw);

  const slugParts = [verb, ...focus.split(/\s+/).filter(Boolean)];
  if (range && range.max != null) {
    slugParts.push(`to-${range.max}`);
  }
  const slugBase = slugify(slugParts.join(' ')) || slugify(desc);
  const key = `${slugBase}${range && range.min != null ? `-${range.min}` : ''}`;

  return {
    key,
    verb,
    focus,
    baseDescriptor,
    range,
    representations,
    contexts,
    operation,
    slugBase,
  };
}

function createNodeSkeleton(normalized) {
  const id = `skill.${normalized.key}`;
  return {
    id,
    title: buildTitle(normalized),
    description: buildDescription(normalized),
    verb: normalized.verb,
    focus: normalized.focus,
    range: normalized.range,
    representations: normalized.representations,
    contexts: normalized.contexts,
    operation: normalized.operation,
    gradeSpans: new Set(),
    domains: new Set(),
    strands: new Set(),
    clusters: new Set(),
    ritBands: [],
    ritAnchor: null,
    ritStretch: null,
    baseDescriptor: normalized.baseDescriptor,
    sourceKeys: new Set(),
    sources: [],
    samples: [],
    minSourceOrder: Infinity,
  };
}

function augmentNode(node, normalized, item) {
  node.gradeSpans.add(item.gradeSpan);
  if (item.domain) node.domains.add(item.domain);
  if (item.strand) node.strands.add(item.strand);
  if (item.cluster) node.clusters.add(item.cluster);

  const ritRecord = {
    label: item.rit?.label ?? 'Unspecified',
    min: item.rit?.min ?? null,
    max: item.rit?.max ?? null,
    minInclusive: item.rit?.minInclusive ?? false,
    maxInclusive: item.rit?.maxInclusive ?? false,
    sourceId: item.sourceId,
  };

  if (!node.ritBands.some((band) => band.label === ritRecord.label && band.sourceId === ritRecord.sourceId)) {
    node.ritBands.push(ritRecord);
  }

  node.ritAnchor = computeAnchor(node.ritBands);
  node.ritStretch = computeStretch(node.ritBands);

  const sourceKey = `${item.sourceId}::${ritRecord.label}`;
  if (!node.sourceKeys.has(sourceKey)) {
    node.sourceKeys.add(sourceKey);
    node.sources.push({
      sourceId: item.sourceId,
      gradeSpan: item.gradeSpan,
      ritLabel: ritRecord.label,
    });
  }

  if (node.samples.length < 3) {
    node.samples.push(item.raw);
  }

  if (Number.isFinite(item.order)) {
    node.minSourceOrder = Math.min(node.minSourceOrder, item.order);
  }
}

function buildTitle(normalized) {
  const focusText = normalized.focus ? ` ${capitalize(normalized.focus)}` : '';
  if (normalized.range && normalized.range.max != null) {
    const span = normalized.range.min != null && normalized.range.min !== 0
      ? `${normalized.range.min}–${normalized.range.max}`
      : `to ${normalized.range.max}`;
    return `${capitalize(normalized.verb)}${focusText} (${span})`.trim();
  }
  return `${capitalize(normalized.verb)}${focusText}`.trim();
}

function buildDescription(normalized) {
  const focusText = normalized.focus ? ` ${normalized.focus}` : '';
  if (normalized.range && normalized.range.max != null) {
    const rangeText = normalized.range.min != null && normalized.range.min !== 0
      ? `${normalized.range.min}–${normalized.range.max}`
      : `up to ${normalized.range.max}`;
    return `${capitalize(normalized.verb)}${focusText} with numbers ${rangeText}`.trim();
  }
  return `${capitalize(normalized.verb)}${focusText}`.trim();
}

function buildPrerequisiteEdges(nodes, descriptorGroups, taxonomy) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = [];
  const seenEdges = new Set();
  const signatureCache = new Map();

  const getSignature = (node) => {
    if (!signatureCache.has(node.id)) {
      signatureCache.set(node.id, difficultySignature(node));
    }
    return signatureCache.get(node.id);
  };

  const shouldLink = (fromNode, toNode, options = {}) => {
    const { allowEquivalent = false } = options;
    const fromSignature = getSignature(fromNode);
    const toSignature = getSignature(toNode);
    const sameUnit = fromNode.unitId === toNode.unitId;
    const shareCluster = intersects(fromNode.clusters, toNode.clusters);
    const shareStrand = intersects(fromNode.strands, toNode.strands);
    const shareGrouping = shareCluster || shareStrand;

    if (fromSignature.score > toSignature.score) return false;

    if (fromSignature.score === toSignature.score) {
      if (fromSignature.stretch > toSignature.stretch) return false;

      if (fromSignature.stretch === toSignature.stretch) {
        const tieAllowed = allowEquivalent && (shareGrouping || !sameUnit);
        const orderAhead = (fromSignature.order < toSignature.order)
          || (tieAllowed && fromSignature.order === toSignature.order);
        if (!orderAhead) return false;

        const sameDescriptor = fromNode.baseDescriptor && toNode.baseDescriptor
          ? fromNode.baseDescriptor === toNode.baseDescriptor
          : false;

        if (!allowEquivalent && !sameDescriptor) {
          if (!sameUnit || !shareGrouping) {
            return false;
          }
        }

        if (allowEquivalent && sameUnit && !sameDescriptor && !shareGrouping) {
          return false;
        }
      }
    }

    return true;
  };

  const addEdge = (fromNode, toNode, rationale, type = 'prerequisite', options = {}) => {
    if (!fromNode || !toNode) return false;
    if (fromNode.id === toNode.id) return false;
    if (!shouldLink(fromNode, toNode, options)) return false;

    const edgeId = `${type}-${fromNode.id}-${toNode.id}`;
    if (seenEdges.has(edgeId)) return false;
    edges.push({
      id: edgeId,
      type,
      from: fromNode.id,
      to: toNode.id,
      rationale,
    });
    seenEdges.add(edgeId);
    return true;
  };

  for (const [descriptor, idSet] of descriptorGroups) {
    if (idSet.size < 2) continue;
    const groupNodes = Array.from(idSet)
      .map((id) => nodeById.get(id))
      .filter(Boolean)
      .sort(compareByDifficulty);

    for (let i = 1; i < groupNodes.length; i += 1) {
      const target = groupNodes[i];
      for (let j = i - 1; j >= 0; j -= 1) {
        const candidate = groupNodes[j];
        if (addEdge(candidate, target, `Progression within "${descriptor}"`)) {
          break;
        }
      }
    }
  }

  const clusterGroups = new Map();
  for (const node of nodes) {
    for (const cluster of node.clusters) {
      const key = cluster.toLowerCase();
      if (!clusterGroups.has(key)) clusterGroups.set(key, []);
      clusterGroups.get(key).push(node);
    }
  }

  for (const [cluster, group] of clusterGroups) {
    if (group.length < 2) continue;
    group.sort(compareByDifficulty);
    for (let i = 1; i < group.length; i += 1) {
      const target = group[i];
      for (let j = i - 1; j >= 0; j -= 1) {
        if (addEdge(group[j], target, `Cluster progression: ${cluster}`, 'prerequisite', { allowEquivalent: true })) {
          break;
        }
      }
    }
  }

  const unitGroups = new Map();
  for (const node of nodes) {
    if (!unitGroups.has(node.unitId)) unitGroups.set(node.unitId, []);
    unitGroups.get(node.unitId).push(node);
  }

  for (const [unitId, group] of unitGroups) {
    group.sort(compareByDifficulty);
    for (let i = 1; i < group.length; i += 1) {
      const target = group[i];
      for (let j = i - 1; j >= 0; j -= 1) {
        if (addEdge(group[j], target, `Unit sequencing: ${unitId}`, 'prerequisite', { allowEquivalent: true })) {
          break;
        }
      }
    }
  }

  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  for (const [unitId, group] of unitGroups) {
    group.sort(compareByDifficulty);
    for (let i = 1; i < group.length; i += 1) {
      const current = group[i];
      if ((indegree.get(current.id) ?? 0) > 0) continue;
      for (let j = i - 1; j >= 0; j -= 1) {
        const predecessor = group[j];
        if (addEdge(predecessor, current, `Unit backfill: ${unitId}`, 'prerequisite', { allowEquivalent: true })) {
          indegree.set(current.id, (indegree.get(current.id) ?? 0) + 1);
          break;
        }
      }
    }
  }

  const roots = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0);
  const sortedNodes = [...nodes].sort(compareByDifficulty);
  const rootsPerUnit = new Map();
  for (const root of roots) {
    rootsPerUnit.set(root.unitId, (rootsPerUnit.get(root.unitId) ?? 0) + 1);
  }

  for (const root of roots) {
    if ((rootsPerUnit.get(root.unitId) ?? 0) <= 1) {
      continue;
    }
    const signature = getSignature(root);
    const rigour = nodeRigour(root);
    if (rigour <= 160) continue;
    if (!root.operation || root.operation === 'general') continue;

    const allowedSourceUnits = UNIT_BRIDGE_SOURCES.get(root.unitId) ?? [];

  const candidates = sortedNodes
    .filter((candidate) => candidate.id !== root.id)
    .filter((candidate) => {
      if (!shouldLink(candidate, root, { allowEquivalent: true })) return false;

      const candidateRigour = nodeRigour(candidate);
      if (!Number.isFinite(candidateRigour) || candidateRigour >= rigour) return false;

      const operationsCompatible = operationsAlign(root.operation, candidate.operation);
      const sharedContext = (candidate.contexts ?? []).some((ctx) => (root.contexts ?? []).includes(ctx));
      const unitCompatible = allowedSourceUnits.includes(candidate.unitId);

        if (operationsCompatible || sharedContext || unitCompatible) {
          return true;
        }

        const candidateDescriptors = new Set([
          candidate.baseDescriptor,
          ...(candidate.clusters ?? []),
          ...(candidate.strands ?? []),
        ].filter(Boolean).map(normalizeDescriptor));

        const rootDescriptors = [
          root.baseDescriptor,
          ...(root.clusters ?? []),
          ...(root.strands ?? []),
        ].filter(Boolean).map(normalizeDescriptor);

        return rootDescriptors.some((descriptor) => candidateDescriptors.has(descriptor));
      })
      .sort((a, b) => compareByDifficulty(b, a));

    for (const candidate of candidates) {
      if (addEdge(candidate, root, `Cross-unit bridge: ${root.operation}`, 'prerequisite', { allowEquivalent: true })) {
        indegree.set(root.id, (indegree.get(root.id) ?? 0) + 1);
        break;
      }
    }
  }

  function intersects(collectionA = [], collectionB = []) {
    if (!collectionA || !collectionB) return false;
    const listA = Array.isArray(collectionA) ? collectionA : Array.from(collectionA);
    const listB = Array.isArray(collectionB) ? collectionB : Array.from(collectionB);
    if (!listA.length || !listB.length) return false;
    const setB = new Set(listB);
    return listA.some((item) => setB.has(item));
  }

  const entryByUnit = new Map();
  for (const node of nodes) {
    const current = entryByUnit.get(node.unitId);
    if (!current || compareByDifficulty(node, current) < 0) {
      entryByUnit.set(node.unitId, node);
    }
  }

  const filteredEdges = edges.filter((edge) => {
    const toNode = nodeById.get(edge.to);
    const fromNode = nodeById.get(edge.from);
    if (!toNode || !fromNode) return false;
    const entry = entryByUnit.get(toNode.unitId);
    if (entry && entry.id === toNode.id && fromNode.unitId !== toNode.unitId) {
      return false;
    }
    return true;
  });

  return filteredEdges.sort((a, b) => a.id.localeCompare(b.id));
}

function operationsAlign(primary, other) {
  if (!primary || !other) return false;
  if (primary === other) return true;

  const companions = OPERATION_COMPANIONS.get(primary);
  if (companions && companions.has(other)) return true;

  const reverse = OPERATION_COMPANIONS.get(other);
  if (reverse && reverse.has(primary)) return true;

  return false;
}

function normalizeDescriptor(value) {
  return String(value).toLowerCase();
}

function difficultyScore(node) {
  if (node.ritAnchor != null) {
    return node.ritAnchor;
  }
  if (node.ritStretch != null) {
    return node.ritStretch;
  }
  if (node.range && node.range.max != null) {
    return node.range.max;
  }
  if (node.range && node.range.min != null) {
    return node.range.min;
  }
  return 9999;
}

function difficultySignature(node) {
  const anchor = node.ritAnchor != null ? node.ritAnchor : null;
  const stretch = node.ritStretch != null
    ? node.ritStretch
    : (node.range && node.range.max != null ? node.range.max : anchor ?? 9999);
  const rangeMax = node.range && node.range.max != null ? node.range.max : stretch;
  const rangeMin = node.range && node.range.min != null ? node.range.min : anchor ?? rangeMax;
  const order = Number.isFinite(node.minSourceOrder) ? node.minSourceOrder : Infinity;

  return {
    anchor: anchor ?? rangeMin ?? 9999,
    stretch,
    rangeMax,
    rangeMin,
    score: anchor ?? stretch ?? rangeMax ?? 9999,
    order,
  };
}

function nodeRigour(node) {
  const values = [];
  const score = difficultyScore(node);
  if (Number.isFinite(score)) values.push(score);
  if (node.ritAnchor != null) values.push(node.ritAnchor);
  if (node.ritStretch != null) values.push(node.ritStretch);
  if (values.length === 0) return -Infinity;
  return Math.max(...values);
}

function compareByDifficulty(a, b) {
  const sigA = difficultySignature(a);
  const sigB = difficultySignature(b);

  if (sigA.anchor !== sigB.anchor) return sigA.anchor - sigB.anchor;
  if (sigA.stretch !== sigB.stretch) return sigA.stretch - sigB.stretch;
  if (sigA.rangeMax !== sigB.rangeMax) return sigA.rangeMax - sigB.rangeMax;
  if (sigA.rangeMin !== sigB.rangeMin) return sigA.rangeMin - sigB.rangeMin;
  if (sigA.order !== sigB.order) return sigA.order - sigB.order;
  return a.id.localeCompare(b.id);
}

function prepareTaxonomy(config) {
  const rules = (config.units ?? [])
    .map((rule) => ({
      ...rule,
      matchers: (rule.keywords ?? []).map((keyword) => new RegExp(escapeRegex(keyword), 'i')),
    }))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return {
    rules,
    defaultUnit: config.defaultUnit ?? { id: 'numbers-place-value', name: 'Numbers and Place Value' },
  };
}

function classifyUnit(node, taxonomy) {
  const coreParts = [
    node.title,
    node.description,
    node.focus,
    ...(node.samples ?? []),
  ].filter(Boolean);

  const contextSet = new Set(node.contexts ?? []);
  const clusterText = (node.clusters ? Array.from(node.clusters) : [])
    .join(' ')
    .toLowerCase();
  const coreTextPreview = coreParts.join(' ').toLowerCase();
  const metadataParts = [
    ...(node.clusters ? Array.from(node.clusters) : []),
    ...(node.strands ? Array.from(node.strands) : []),
    ...(node.domains ? Array.from(node.domains) : []),
  ].filter(Boolean);
  const metadataTextPreview = metadataParts.join(' ').toLowerCase();

  const measurementRule = findRuleById(taxonomy, 'measurement-data');
  if (measurementRule) {
    const hasDataDomain = metadataParts.some((part) => /Data|Organizing, Displaying, and Interpreting Data/i.test(part));
    const hasTimeSignal = contextSet.has('time')
      || /\btime\b|\bclock\b|minute|hour/.test(clusterText)
      || /\btime\b|\bclock\b|minute|hour/.test(coreTextPreview);
    const hasMoneySignal = contextSet.has('money')
      || /\bmoney\b|\bcoins?\b|\bbills?\b|\bdollars?\b/.test(clusterText)
      || /\bmoney\b|\bcoins?\b|\bbills?\b|\bdollars?\b/.test(coreTextPreview);
    const hasMeasurementText = /measurement|perimeter|area|volume|length|weight|mass|capacity|time|clock/.test(clusterText)
      || /measurement|perimeter|area|volume|length|weight|mass|capacity|time|clock/.test(coreTextPreview);
    const hasDataSignal = hasDataDomain && (
      /classify|sort|graph|table|plot|data|frequency|pictograph|line plot|bar graph/.test(coreTextPreview)
        || /classify|sort|graph|table|plot|data|frequency|pictograph|line plot|bar graph/.test(clusterText)
        || /organizing|interpreting data|data analysis/.test(metadataTextPreview)
    );
    if (hasTimeSignal || hasMoneySignal || contextSet.has('measurement') || hasDataSignal || hasMeasurementText) {
      return { id: measurementRule.id, name: measurementRule.name };
    }
  }

  const geometryRule = findRuleById(taxonomy, 'geometry');
  const hasGeometryDomain = metadataParts.some((part) => /Geometry/i.test(part));
  const hasGeometrySignal = /shape|polygon|angle|line|ray|segment|symmetry|coordinate plane/.test(coreTextPreview)
    || /shape|polygon|angle|line|ray|segment|symmetry|coordinate plane/.test(clusterText);
  if (geometryRule && hasGeometrySignal) {
    return { id: geometryRule.id, name: geometryRule.name };
  }

  const combinedText = [coreTextPreview, clusterText, metadataTextPreview]
    .filter(Boolean)
    .join(' ');

  const gradeSpanList = Array.isArray(node.gradeSpans)
    ? node.gradeSpans
    : Array.from(node.gradeSpans ?? []);

  if (/\beven\s+or\s+odd\b/.test(combinedText)) {
    const numberSenseRule = findRuleById(taxonomy, 'number-sense');
    if (numberSenseRule) {
      return { id: numberSenseRule.id, name: numberSenseRule.name };
    }
  }

  const hasCountingCue = /\bcount\b|\btally\b|\bskip-count\b/.test(combinedText);
  if (hasCountingCue) {
    const hasFractionFocus = /\bfraction/.test(coreTextPreview);
    const numberSenseRule = findRuleById(taxonomy, 'number-sense');
    const numbersRule = findRuleById(taxonomy, 'numbers-place-value');
    if (!hasFractionFocus && numbersRule) {
      if (gradeSpanList.includes('K-2')) {
        return { id: numbersRule.id, name: numbersRule.name };
      }
      if (numberSenseRule) {
        return { id: numberSenseRule.id, name: numberSenseRule.name };
      }
    }
    if (hasFractionFocus && numbersRule && gradeSpanList.includes('K-2')) {
      return { id: numbersRule.id, name: numbersRule.name };
    }
  }

  const integerRule = findRuleById(taxonomy, 'integers');
  if (integerRule && /\binteger/.test(combinedText)) {
    return { id: integerRule.id, name: integerRule.name };
  }

  const additionRule = findRuleById(taxonomy, 'addition');
  if (additionRule && /fact families|mixed operations/.test(clusterText)) {
    return { id: additionRule.id, name: additionRule.name };
  }

  const ratiosRule = findRuleById(taxonomy, 'ratios-proportional');
  if (ratiosRule && /\bproportion|\bratio(?!nal)|\brates?|unit rate/.test(clusterText + coreTextPreview)) {
    return { id: ratiosRule.id, name: ratiosRule.name };
  }

  const fractionsRule = findRuleById(taxonomy, 'fractions-decimals');
  const fractionSignal = /\bfraction|\bdecimal|\bpercent|\bnumerator|\bdenominator|\bmixed number|\bhundredth|\btenth/.test(coreTextPreview)
    || /\bfraction|\bdecimal|\bpercent|\bnumerator|\bdenominator|\bmixed number|\bhundredth|\btenth/.test(clusterText);
  if (fractionsRule && fractionSignal) {
    return { id: fractionsRule.id, name: fractionsRule.name };
  }

  const operationUnitHints = new Map([
    ['addition', 'addition'],
    ['subtraction', 'subtraction'],
    ['multiplication', 'multiplication'],
    ['division', 'division'],
    ['fraction', 'fractions-decimals'],
    ['measurement', 'measurement-data'],
    ['data', 'measurement-data'],
    ['place-value', 'numbers-place-value'],
    ['counting', gradeSpanList.includes('K-2') ? 'numbers-place-value' : 'number-sense'],
    ['rounding', 'number-sense'],
  ]);

  const operationUnitId = operationUnitHints.get(node.operation);
  if (operationUnitId) {
    const operationRule = findRuleById(taxonomy, operationUnitId);
    if (operationRule) {
      return { id: operationRule.id, name: operationRule.name };
    }
  }

  const coreText = coreParts.join(' ').toLowerCase();
  const metadataText = metadataTextPreview;

  let bestMatch = null;

  for (const rule of taxonomy.rules) {
    let coreMatches = 0;
    let metadataMatches = 0;

    for (const matcher of rule.matchers) {
      if (matcher.test(coreText)) {
        coreMatches += 1;
      }
      if (matcher.test(metadataText)) {
        metadataMatches += 1;
      }
    }

    if (coreMatches === 0 && rule.id === 'fractions-decimals') {
      continue;
    }

    const score = (coreMatches * 3) + metadataMatches;
    if (score === 0) {
      continue;
    }

    const candidate = {
      rule,
      score,
      coreMatches,
      metadataMatches,
      priority: rule.priority ?? 0,
    };

    if (
      !bestMatch
      || candidate.score > bestMatch.score
      || (candidate.score === bestMatch.score && candidate.coreMatches > bestMatch.coreMatches)
      || (candidate.score === bestMatch.score && candidate.coreMatches === bestMatch.coreMatches && candidate.priority > bestMatch.priority)
    ) {
      bestMatch = candidate;
    }
  }

  if (bestMatch) {
    return { id: bestMatch.rule.id, name: bestMatch.rule.name };
  }

  return taxonomy.defaultUnit;
}

function findRuleById(taxonomy, id) {
  return taxonomy.rules.find((rule) => rule.id === id)
    || (taxonomy.defaultUnit && taxonomy.defaultUnit.id === id ? taxonomy.defaultUnit : null);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function summarizeGraph(nodes, relationships) {
  console.log(`Generated ${nodes.length} skill nodes and ${relationships.length} relationships.`);

  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of relationships) {
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const roots = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0);
  const rootsByUnit = roots.reduce((acc, node) => {
    if (!acc[node.unitName]) acc[node.unitName] = [];
    acc[node.unitName].push(node);
    return acc;
  }, {});

  console.log('Root skills per unit:');
  for (const [unitName, unitRoots] of Object.entries(rootsByUnit)) {
    const sample = unitRoots
      .slice(0, 3)
      .map((node) => `${node.title} (RIT ${node.ritAnchor ?? 'N/A'})`)
      .join('; ');
    console.log(`  • ${unitName}: ${unitRoots.length} root(s) — ${sample}`);
  }
}

function computeAnchor(bands) {
  let minValue = Infinity;
  for (const band of bands) {
    const candidate = effectiveLowerBound(band);
    if (candidate != null && candidate < minValue) {
      minValue = candidate;
    }
  }
  if (minValue === Infinity) return null;
  return minValue;
}

function computeStretch(bands) {
  let maxValue = -Infinity;
  for (const band of bands) {
    const candidate = effectiveUpperBound(band);
    if (candidate != null && candidate > maxValue) {
      maxValue = candidate;
    }
  }
  if (maxValue === -Infinity) return null;
  return maxValue;
}

function effectiveLowerBound(band) {
  if (band.min != null) {
    const base = band.min + (band.minInclusive ? 0 : 1);
    return Number.isFinite(base) ? Math.max(base, 0) : null;
  }
  if (band.max != null) {
    const base = band.max - (band.maxInclusive ? 0 : 1);
    return Number.isFinite(base) ? Math.max(base, 0) : null;
  }
  return null;
}

function effectiveUpperBound(band) {
  if (band.max != null) {
    const base = band.max - (band.maxInclusive ? 0 : 1);
    return Number.isFinite(base) ? Math.max(base, 0) : null;
  }
  if (band.min != null) {
    const base = band.min + (band.minInclusive ? 0 : 1);
    return Number.isFinite(base) ? Math.max(base, 0) : null;
  }
  return null;
}

function splitVerbAndFocus(desc) {
  const trimmed = desc.trim();
  if (!trimmed) {
    return { verb: 'practice', focus: '' };
  }

  const match = trimmed.match(/^[^\s]+/);
  const leadingToken = match ? match[0] : '';
  const remaining = trimmed.slice(leadingToken.length).trim();
  const { verb, recognized } = normalizeVerb(leadingToken);
  const focus = recognized ? remaining : trimmed;
  return { verb, focus };
}

const KNOWN_VERBS = new Set([
  'add',
  'balance',
  'build',
  'classify',
  'compose',
  'convert',
  'count',
  'decompose',
  'divide',
  'evaluate',
  'fill',
  'graph',
  'identify',
  'locate',
  'make',
  'measure',
  'model',
  'multiply',
  'order',
  'read',
  'regroup',
  'round',
  'solve',
  'spell',
  'subtract',
  'use',
  'write',
  'compare',
  'explore',
  'analyze',
  'interpret',
  'organize',
  'recognize',
  'select',
  'underline',
  'generate',
  'estimate',
  'categorize',
]);

const OPERATION_COMPANIONS = new Map([
  ['division', new Set(['multiplication', 'comparison'])],
  ['multiplication', new Set(['addition', 'comparison', 'counting'])],
  ['fraction', new Set(['addition', 'subtraction', 'comparison'])],
  ['place-value', new Set(['comparison', 'counting'])],
  ['rounding', new Set(['place-value', 'comparison'])],
]);

const UNIT_BRIDGE_SOURCES = new Map([
  ['fractions-decimals', ['numbers-place-value', 'addition', 'number-sense']],
  ['multiplication', ['addition', 'number-sense']],
  ['division', ['multiplication', 'number-sense']],
  ['integers', ['fractions-decimals', 'number-sense', 'numbers-place-value']],
  ['expressions-equations', ['multiplication', 'addition', 'number-sense']],
]);

function normalizeVerb(token) {
  const cleaned = token.replace(/[^a-z]/gi, '').toLowerCase();
  if (!cleaned) return { verb: 'practice', recognized: false };

  const map = new Map([
    ['addition', 'add'],
    ['add', 'add'],
    ['subtract', 'subtract'],
    ['subtraction', 'subtract'],
    ['compare', 'compare'],
    ['count', 'count'],
    ['counting', 'count'],
    ['build', 'build'],
    ['compose', 'compose'],
    ['decompose', 'decompose'],
    ['identify', 'identify'],
    ['write', 'write'],
    ['writing', 'write'],
    ['spell', 'spell'],
    ['place', 'analyze'],
    ['regroup', 'regroup'],
    ['round', 'round'],
    ['skipcount', 'count'],
    ['skip', 'count'],
    ['multiplication', 'multiply'],
    ['multiply', 'multiply'],
    ['division', 'divide'],
    ['divide', 'divide'],
    ['make', 'make'],
    ['locate', 'locate'],
    ['graph', 'graph'],
    ['convert', 'convert'],
    ['evaluate', 'evaluate'],
    ['order', 'order'],
    ['put', 'order'],
    ['use', 'use'],
    ['measure', 'measure'],
    ['solve', 'solve'],
    ['balance', 'balance'],
    ['fill', 'fill'],
    ['classify', 'classify'],
    ['recognize', 'recognize'],
    ['estimate', 'estimate'],
    ['organize', 'organize'],
    ['understand', 'understand'],
    ['interpret', 'interpret'],
    ['analyze', 'analyze'],
    ['categorize', 'categorize'],
    ['read', 'read'],
    ['model', 'model'],
    ['underline', 'underline'],
    ['generate', 'generate'],
  ]);

  if (map.has(cleaned)) {
    return { verb: map.get(cleaned), recognized: true };
  }

  if (KNOWN_VERBS.has(cleaned)) {
    return { verb: cleaned, recognized: true };
  }

  if (cleaned.length <= 2) {
    return { verb: 'classify', recognized: false };
  }

  return { verb: 'explore', recognized: false };
}

function extractRange(text) {
  const range = { min: null, max: null, minInclusive: true, maxInclusive: true };
  const upToMatch = text.match(/up to (\d[\d,]*)/i);
  if (upToMatch) {
    range.max = parseNumber(upToMatch[1]);
    return range;
  }

  const betweenMatch = text.match(/(\d[\d,]*)\s*(?:to|-|–)\s*(\d[\d,]*)/i);
  if (betweenMatch) {
    range.min = parseNumber(betweenMatch[1]);
    range.max = parseNumber(betweenMatch[2]);
    return range;
  }

  const equalsMatch = text.match(/(?:sums|numbers|digits|values)\s+(?:up to|to)\s+(\d[\d,]*)/i);
  if (equalsMatch) {
    range.max = parseNumber(equalsMatch[1]);
    return range;
  }

  const sumsMatch = text.match(/sums? up to (\d[\d,]*)/i);
  if (sumsMatch) {
    range.max = parseNumber(sumsMatch[1]);
    return range;
  }

  const placeValueMatch = text.match(/up to (\d[\d,]*)(?:\s|$)/i);
  if (placeValueMatch) {
    range.max = parseNumber(placeValueMatch[1]);
    return range;
  }

  return null;
}

function inferRepresentations(text) {
  const representations = new Set();
  const lowered = text.toLowerCase();

  addIf(/ten[-\s]?frames?/, 'ten-frame');
  addIf(/number line|number-line/, 'number-line');
  addIf(/hundred chart/, 'hundred-chart');
  addIf(/cubes?|blocks?|rods|flats|base ten/, 'base-ten-blocks');
  addIf(/pictures?|dots|objects|shapes|stickers|rings|sets?/, 'objects');
  addIf(/words?|spell|spelling|word names|names of numbers/, 'number-words');
  addIf(/symbols?|symbol/, 'symbols');
  addIf(/equations?/, 'equations');
  addIf(/money|coins?|dollars?/, 'money');
  addIf(/clock|time/, 'time');
  addIf(/fraction bars?|area models?|fraction/, 'fraction-model');
  addIf(/graphs?|charts?|tables?/, 'data-display');
  addIf(/picture graphs?|bar graphs?|line plots?/, 'data-graph');
  addIf(/array|groups?/, 'arrays');

  if (/without objects|count forward|count backward|skip-count|mental/.test(lowered)) {
    representations.add('abstract-numerals');
  }

  if (representations.size === 0) {
    representations.add('unspecified');
  }

  return Array.from(representations).sort();

  function addIf(pattern, rep) {
    if (pattern.test(lowered)) representations.add(rep);
  }
}

function inferContexts(text) {
  const contexts = new Set();
  const lowered = text.toLowerCase();
  if (lowered.includes('word problem')) contexts.add('word-problem');
  if (lowered.includes('money') || lowered.includes('coins') || lowered.includes('dollars')) contexts.add('money');
  if (lowered.includes('recipes')) contexts.add('food');
  if (lowered.includes('time') || lowered.includes('clock')) contexts.add('time');
  if (lowered.includes('measure')) contexts.add('measurement');
  return Array.from(contexts).sort();
}

function inferOperation(verb, text) {
  const lowered = `${verb} ${text}`.toLowerCase();
  if (lowered.includes('add') || lowered.includes('sum')) return 'addition';
  if (lowered.includes('subtract') || lowered.includes('difference') || lowered.includes('take away')) return 'subtraction';
  const hasTimeContext = /\btime\b|\bclock\b|\bminute\b|\bhour\b/.test(lowered);
  const hasMultiplicationCue = /\bmultiply\b|\bmultiplication\b|\bproduct\b|\barray\b/.test(lowered)
    || (/\btimes\b/.test(lowered) && !hasTimeContext);
  if (hasMultiplicationCue) return 'multiplication';
  if (lowered.includes('divide') || lowered.includes('quotient') || /\bdivision\b/.test(lowered)) return 'division';
  if (lowered.includes('fraction')) return 'fraction';
  if (lowered.includes('count')) return 'counting';
  if (lowered.includes('compare')) return 'comparison';
  if (lowered.includes('round')) return 'rounding';
  if (lowered.includes('measure')) return 'measurement';
  if (lowered.includes('graph')) return 'data';
  if (lowered.includes('place value')) return 'place-value';
  return 'general';
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
