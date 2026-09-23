#!/usr/bin/env node
/**
 * 品味记忆库（Taste Vault）的存储与检索。
 *
 *   node scripts/asset_library.js location
 *   node scripts/asset_library.js init   --vault <dir>
 *   node scripts/asset_library.js list   [--vault <dir>] [--source personal|public|all] [--kind K] [--medium M] [--system-type T] [--valence V] [--query "词 词"]
 *   node scripts/asset_library.js show   [--vault <dir>] [--source ...] --id <id> [--revision N]
 *   node scripts/asset_library.js put    --vault <dir> --file <bundle.json>
 *
 * 边界：脚本校验**结构与引用关系**，不判断真实性、审美判断，也不推测用户喜好。
 * 它不抓网页、不调模型、不自动把反应升级为偏好。写入前必须先读（show）。
 *
 * 位置优先级：--vault > MUSE_VAULT_DIR > ~/Documents/Muse。
 * 只读查询不存在的库返回空结果，不创建文件。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, copyFileSync, unlinkSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STORE = 'aesthetic_assets.json';
const KINDS = ['reference', 'reaction', 'system', 'application'];
const STATUS = {
  reference: ['active', 'archived'],
  reaction: ['active', 'archived'],
  application: ['active', 'archived'],
  system: ['draft', 'ready', 'archived'],
};
const MEDIA = ['web', 'text', 'slides', 'image'];

/* ── 参数解析 ─────────────────────────────────────────────────── */
function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    else opts._.push(a);
  }
  return opts;
}
const argv = parseArgs(process.argv.slice(2));
const cmd = argv._[0];
const vaultDir = argv.vault ? resolve(String(argv.vault)) : process.env.MUSE_VAULT_DIR ? resolve(process.env.MUSE_VAULT_DIR) : join(homedir(), 'Documents', 'Muse');

const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

/* ── 读写 ─────────────────────────────────────────────────────── */
function readStore(dir) {
  const p = join(dir, STORE);
  if (!existsSync(p)) return null;
  try {
    const d = JSON.parse(readFileSync(p, 'utf8'));
    if (!Array.isArray(d.entries)) throw new Error('entries 不是数组');
    return d;
  } catch (e) {
    die(`个人库损坏，已停止（保留原文件）：${p}\n  ${e.message}`);
  }
}

function readPublic() {
  const p = join(SKILL_ROOT, 'references/public_cases.json');
  if (!existsSync(p)) return { schema_version: 2, entries: [] };
  return JSON.parse(readFileSync(p, 'utf8'));
}

/** 原子写入：先写临时文件，再 rename；旧文件先备份。 */
function writeStore(dir, data) {
  mkdirSync(dir, { recursive: true });
  const p = join(dir, STORE);
  const tmp = `${p}.tmp-${process.pid}`;
  const lock = `${p}.lock`;
  if (existsSync(lock)) die(`存在锁文件，可能有并发写入，已停止（不自动删除）：${lock}`);
  writeFileSync(lock, String(process.pid));
  try {
    if (existsSync(p)) copyFileSync(p, `${p}.bak`);
    data.updated_at = new Date().toISOString();
    writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
    renameSync(tmp, p);
  } finally {
    if (existsSync(lock)) unlinkSync(lock);
  }
}

/* ── 校验 ─────────────────────────────────────────────────────── */
const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isArr = (v) => Array.isArray(v);

function validateEntry(entry, store, index, { checkRevision = true } = {}) {
  const errs = [];
  const at = `entries[${index}]`;
  const { id, kind, data, expected_revision } = entry;

  if (!isStr(id) || !/^[a-z0-9_-]{1,80}$/.test(id)) errs.push(`${at}.id 必须是 1–80 位小写字母／数字／连字符／下划线`);
  if (!KINDS.includes(kind)) errs.push(`${at}.kind 必须是 ${KINDS.join(' / ')}`);
  if (checkRevision && typeof expected_revision !== 'number') errs.push(`${at}.expected_revision 必填（新建为 0）`);
  if (!data || typeof data !== 'object') return [...errs, `${at}.data 必填`];

  const known = {
    reference: ['title', 'tags', 'status', 'source', 'observations', 'limits'],
    reaction: ['title', 'tags', 'status', 'subject', 'target', 'context', 'occurred_at', 'user_quote', 'valence', 'strength', 'felt_effect', 'reason', 'scope', 'contradictions'],
    system: ['title', 'tags', 'status', 'system_type', 'media', 'scope', 'intent', 'principles', 'limits'],
    application: ['title', 'tags', 'status', 'system_id', 'system_revision', 'artifact', 'context', 'adaptations', 'outcome', 'feedback_source'],
  }[kind] || [];
  for (const k of Object.keys(data)) {
    if (!known.includes(k)) errs.push(`${at}.data.${k} 不是 ${kind} 支持的字段（不允许自造状态字段）`);
  }

  if (!isStr(data.title)) errs.push(`${at}.data.title 非空必填`);
  if (!isArr(data.tags)) errs.push(`${at}.data.tags 必须是字符串数组`);
  if (!STATUS[kind]?.includes(data.status)) errs.push(`${at}.data.status 对 ${kind} 只能是 ${STATUS[kind]?.join(' / ')}`);

  const findEntry = (theId) => store.entries.find((e) => e.id === theId);
  const findEntryRevision = (theId, rev) => {
    const e = store.entries.find((item) => item.id === theId);
    if (!e) return null;
    if (rev === undefined || e.revision === rev) return e;
    if (e.history) {
      const h = e.history.find((item) => item.revision === rev);
      if (h) return { ...e, revision: h.revision, data: h.data };
    }
    return null;
  };

  if (kind === 'reference') {
    const s = data.source || {};
    if (!['website', 'image', 'article', 'mixed'].includes(s.kind)) errs.push(`${at}.data.source.kind 必须是 website/image/article/mixed`);
    if (!isStr(s.locator)) errs.push(`${at}.data.source.locator 非空必填`);
    if (!isStr(s.coverage)) errs.push(`${at}.data.source.coverage 必填`);
    if (!isArr(data.observations)) errs.push(`${at}.data.observations 必须是数组`);
    else if (s.coverage === 'unavailable' && data.observations.length) errs.push(`${at}：coverage=unavailable 时 observations 必须为空`);
    else {
      for (const o of data.observations) if (!isStr(o.id) || !isStr(o.locator) || !isStr(o.observation)) errs.push(`${at}.data.observations 每项需 id / locator / observation`);
    }
  }

  if (kind === 'reaction') {
    const sub = data.subject || {};
    if (sub.kind === 'reference' || sub.kind === 'application') {
      const ref = findEntry(sub.asset_id);
      if (!ref) errs.push(`${at}.data.subject.asset_id 指向不存在的资产 ${sub.asset_id}`);
      else {
        const rev = findEntryRevision(sub.asset_id, sub.asset_revision);
        if (!rev) errs.push(`${at}.data.subject.asset_revision=${sub.asset_revision} 与实际版本不符`);
      }
    } else if (sub.kind === 'artifact') {
      if (!isStr(sub.locator)) errs.push(`${at}.data.subject.locator（artifact）非空必填`);
    } else errs.push(`${at}.data.subject.kind 必须是 reference / application / artifact`);

    if (!isStr(data.target?.locator)) errs.push(`${at}.data.target.locator 必填（无法定位时写 unknown）`);
    if (!MEDIA.includes(data.context?.medium)) errs.push(`${at}.data.context.medium 必须是 ${MEDIA.join('/')}`);
    if (!isStr(data.occurred_at)) errs.push(`${at}.data.occurred_at 必填（无法确定写 unknown）`);
    if (!isStr(data.user_quote)) errs.push(`${at}.data.user_quote 必填，不能用 AI 总结替换用户原话`);
    if (!['liked', 'disliked', 'mixed', 'neutral', 'unknown'].includes(data.valence)) errs.push(`${at}.data.valence 取值非法`);
    if (!['low', 'medium', 'high', 'unknown'].includes(data.strength)) errs.push(`${at}.data.strength 取值非法`);
    if (!isArr(data.felt_effect)) errs.push(`${at}.data.felt_effect 必须是数组（没有就空数组）`);
    if (!['user_stated', 'ai_inferred', 'co_formed', 'unknown'].includes(data.reason?.status)) errs.push(`${at}.data.reason.status 取值非法`);
    if (!isStr(data.scope)) errs.push(`${at}.data.scope 非空必填`);
    if (!isArr(data.contradictions)) errs.push(`${at}.data.contradictions 必须是数组`);
    else for (const c of data.contradictions) {
      if (c.reaction_id === id) errs.push(`${at}：contradictions 不能指向自身`);
      const other = findEntry(c.reaction_id);
      if (!other) errs.push(`${at}：contradictions 指向不存在的 reaction ${c.reaction_id}`);
      else {
        const rev = findEntryRevision(c.reaction_id, c.reaction_revision);
        if (!rev) errs.push(`${at}：contradictions.reaction_revision 与 ${c.reaction_id} 实际版本不符`);
      }
    }
  }

  if (kind === 'system') {
    if (data.system_type !== undefined && !['aesthetic', 'author_voice'].includes(data.system_type)) errs.push(`${at}.data.system_type 只能是 aesthetic / author_voice`);
    if (!isArr(data.media) || !data.media.length || data.media.some((m) => !MEDIA.includes(m))) errs.push(`${at}.data.media 必须是非空且取值合法的数组`);
    if (data.system_type === 'author_voice' && isArr(data.media) && !data.media.includes('text')) errs.push(`${at}：author_voice 的 media 必须包含 text`);
    if (!isStr(data.scope) || !isStr(data.intent)) errs.push(`${at}.data.scope 与 intent 非空必填`);
    if (!isArr(data.principles) || !data.principles.length) errs.push(`${at}.data.principles 非空必填`);
    else for (const p of data.principles) {
      for (const f of ['name', 'rule', 'rationale', 'applies_when', 'avoid_when']) if (!isStr(p[f])) errs.push(`${at}.data.principles[].${f} 非空必填`);
      if (!['supported', 'provisional'].includes(p.confidence)) errs.push(`${at}.data.principles[].confidence 必须是 supported / provisional`);
      if (!isArr(p.evidence) || !p.evidence.length) errs.push(`${at}.data.principles[].evidence 非空必填`);
      else for (const ev of p.evidence) {
        if (ev.kind === 'reference_observation') {
          const r = findEntry(ev.reference_id);
          if (!r) errs.push(`${at}：evidence 指向不存在的 reference ${ev.reference_id}`);
          else {
            const rev = findEntryRevision(ev.reference_id, ev.reference_revision);
            if (!rev) {
              errs.push(`${at}：evidence.reference_revision 与 ${ev.reference_id} 实际版本不符`);
            } else if (!rev.data.observations?.some((o) => o.id === ev.observation_id)) {
              errs.push(`${at}：evidence.observation_id=${ev.observation_id} 在 ${ev.reference_id} 中不存在`);
            }
          }
        } else if (ev.kind === 'reaction') {
          const r = findEntry(ev.reaction_id);
          if (!r) errs.push(`${at}：evidence 指向不存在的 reaction ${ev.reaction_id}`);
          else {
            const rev = findEntryRevision(ev.reaction_id, ev.reaction_revision);
            if (!rev) errs.push(`${at}：evidence.reference_revision 与 ${ev.reaction_id} 实际版本不符`);
          }
        } else errs.push(`${at}：evidence.kind 必须是 reference_observation / reaction`);
      }
    }
    if (data.status === 'ready' && !(isArr(data.principles) && data.principles.length)) errs.push(`${at}：status=ready 必须有原则`);
  }

  if (kind === 'application') {
    const sys = findEntry(data.system_id);
    if (!sys) errs.push(`${at}.data.system_id 指向不存在的 system ${data.system_id}`);
    else {
      if (sys.kind !== 'system') errs.push(`${at}.data.system_id 指向的资产类型为 ${sys.kind}，不是 system`);
      const rev = findEntryRevision(data.system_id, data.system_revision);
      if (!rev) errs.push(`${at}.data.system_revision 与 ${data.system_id} 实际版本不符`);
    }
    if (!isStr(data.artifact)) errs.push(`${at}.data.artifact 非空必填`);
    if (!isStr(data.feedback_source)) errs.push(`${at}.data.feedback_source 必填（无用户反馈时也要写明）`);
  }

  return errs;
}

/* ── 命令 ─────────────────────────────────────────────────────── */

if (!cmd || cmd === 'help') {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^\/\*\*?/, '').trim());
  process.exit(0);
}

if (cmd === 'location') {
  console.log(`Muse 品味库位置：${vaultDir}`);
  console.log(existsSync(join(vaultDir, STORE)) ? '状态：已存在' : '状态：尚未初始化（只读查询会返回空结果，不会创建）');
  console.log(`来源：${argv.vault ? '--vault 参数' : process.env.MUSE_VAULT_DIR ? 'MUSE_VAULT_DIR' : '默认位置'}`);
  process.exit(0);
}

if (cmd === 'init') {
  if (!argv.vault) die('init 必须显式给出 --vault <dir>，避免在未授权的位置建库');
  const existing = readStore(vaultDir);
  if (existing) {
    console.log(`库已存在，未改动：${join(vaultDir, STORE)}（${existing.entries.length} 个条目）`);
    process.exit(0);
  }
  mkdirSync(vaultDir, { recursive: true });
  for (const [f, body] of [
    ['personal_dna.yaml', "version: '2.0.0'\nlast_updated: null\npreferences: []\nrejected_cases: []\n"],
    ['personal_taboos.yaml', "version: '2.0.0'\nlast_updated: null\ntaboos: []\n"],
  ]) {
    const p = join(vaultDir, f);
    if (!existsSync(p)) writeFileSync(p, body);
  }
  writeStore(vaultDir, { schema_version: 2, updated_at: null, entries: [] });
  console.log(`✓ 已初始化品味库：${vaultDir}`);
  process.exit(0);
}

const source = argv.source || 'personal';
if (!['personal', 'public', 'all'].includes(source)) die('--source 只能是 personal / public / all');

function loadScoped() {
  const out = [];
  if (source === 'personal' || source === 'all') {
    const s = readStore(vaultDir);
    if (s) for (const e of s.entries) out.push({ ...e, source: 'personal' });
  }
  if (source === 'public' || source === 'all') {
    for (const e of readPublic().entries) out.push({ ...e, source: 'public' });
  }
  return out;
}

if (cmd === 'list') {
  let items = loadScoped();
  if (argv.kind) items = items.filter((e) => e.kind === argv.kind);
  if (argv.medium) {
    items = items.filter((e) =>
      e.kind === 'system' ? e.data.media?.includes(argv.medium) : e.kind === 'reaction' ? e.data.context?.medium === argv.medium : false
    );
  }
  if (argv['system-type']) items = items.filter((e) => e.kind === 'system' && (e.data.system_type || 'aesthetic') === argv['system-type']);
  if (argv.valence) items = items.filter((e) => e.kind === 'reaction' && e.data.valence === argv.valence);
  if (argv.query) {
    const terms = String(argv.query).split(/\s+/).filter(Boolean);
    items = items.filter((e) => {
      const hay = [e.id, JSON.stringify(e.data)].join(' ');
      return terms.every((t) => hay.includes(t));
    });
  }
  if (!argv.archived) items = items.filter((e) => e.data.status !== 'archived');

  if (!items.length) {
    console.log(`没有匹配的条目（source=${source}）。这是字面筛选的结果，不等于库里没有适用的资产——请减少筛选条件再看。`);
    process.exit(0);
  }
  console.log(`${items.length} 个条目（source=${source}，字面筛选，非语义搜索）：\n`);
  for (const e of items) {
    console.log(`  [${e.source}/${e.kind}] ${e.id}@${e.revision}  ${e.data.title}`);
    console.log(`      status=${e.data.status} tags=${(e.data.tags || []).join(',') || '-'}`);
  }
  process.exit(0);
}

if (cmd === 'show') {
  if (!isStr(argv.id)) die('show 需要 --id <id>');
  const items = loadScoped().filter((e) => e.id === argv.id);
  if (!items.length) die(`找不到 ${argv.id}（source=${source}）`);
  if (items.length > 1) die(`${argv.id} 在 personal 与 public 中重名，请用 --source 指定`);
  const e = items[0];
  const revision = argv.revision ? Number(argv.revision) : e.revision;
  // 当前版本的数据在 data；更早的版本在 history，历史只增不删
  const record = revision === e.revision ? e : (e.history || []).find((h) => h.revision === revision);
  if (!record) die(`${argv.id} 没有 revision ${revision}（可用历史：${[e.revision, ...(e.history || []).map((h) => h.revision)].sort((a, b) => a - b).join(', ')}）`);
  console.log(JSON.stringify({ id: e.id, kind: e.kind, revision, source: e.source, data: record.data }, null, 2));
  process.exit(0);
}

if (cmd === 'put') {
  if (!argv.file) die('put 需要 --file <bundle.json>');
  if (source !== 'personal') die('put 只写个人库，不接受 --source');
  let bundle;
  try {
    bundle = JSON.parse(readFileSync(argv.file, 'utf8'));
  } catch (e) {
    die(`无法解析 ${argv.file}：${e.message}`);
  }
  if (!isArr(bundle.entries)) die('bundle 顶层必须是 {"entries": [...]}');

  const store = readStore(vaultDir) || { schema_version: 2, updated_at: null, entries: [] };

  // 先整体校验，再原子写入：避免「反应存了但对象缺失」
  const staged = store.entries.map((e) => ({ ...e }));
  const errs = [];
  const written = [];
  const unchanged = [];

  bundle.entries.forEach((incoming, i) => {
    for (const k of Object.keys(incoming)) if (!['id', 'kind', 'expected_revision', 'data'].includes(k)) errs.push(`entries[${i}].${k} 不是支持的字段`);
    const cur = staged.find((e) => e.id === incoming.id);
    const currentRev = cur ? cur.revision : 0;

    // 内容完全相同 → 无变更，静默跳过（即使 expected_revision 是旧值）
    if (cur && JSON.stringify(cur.data) === JSON.stringify(incoming.data)) {
      unchanged.push(incoming.id);
      return;
    }
    // 内容不同却用了过期版本 → 阻断，要求先 show 再合并
    if (incoming.expected_revision !== currentRev) {
      errs.push(`entries[${i}] (${incoming.id})：expected_revision=${incoming.expected_revision} 与当前版本 ${currentRev} 不符。请先 show 再合并，不要盲目重试`);
      return;
    }

    const candidate = {
      id: incoming.id,
      kind: incoming.kind,
      revision: currentRev + 1,
      data: incoming.data,
      updated_at: new Date().toISOString(),
      history: cur ? [...(cur.history || []), { revision: cur.revision, data: cur.data, updated_at: cur.updated_at }] : [],
    };
    // 版本检查已在上方完成，这里只做结构与引用校验
    errs.push(...validateEntry(candidate, { entries: [...staged.filter((e) => e.id !== incoming.id), candidate] }, i, { checkRevision: false }).map((m) => `${incoming.id}: ${m}`));
    const idx = staged.findIndex((e) => e.id === incoming.id);
    if (idx >= 0) staged[idx] = candidate;
    else staged.push(candidate);
    written.push({ id: incoming.id, revision: candidate.revision });
  });

  if (errs.length) {
    console.error('✗ 校验失败，未写入任何内容：');
    for (const e of errs) console.error(`  · ${e}`);
    process.exit(1);
  }

  for (const id of unchanged) console.log(`· ${id} 内容未变，跳过`);
  if (!written.length) {
    console.log('没有产生新版本，库未改动。');
    process.exit(0);
  }

  writeStore(vaultDir, { schema_version: 2, updated_at: store.updated_at, entries: staged });
  console.log(`✓ 已写入 ${written.length} 个条目到 ${join(vaultDir, STORE)}（旧文件备份为 .bak）`);
  for (const w of written) console.log(`  · ${w.id} → revision ${w.revision}`);
  console.log('\n注意：脚本只校验结构与引用关系，不代表真实性、审美判断或用户授权已经确认。');
  process.exit(0);
}

die(`未知命令：${cmd}`);
