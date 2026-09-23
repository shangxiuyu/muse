import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { samples, escapeHtml } from '../web/lib/data.js';
import { createSample, sampleCard, sampleCover, sampleProjectKey } from '../web/lib/gallery.js';
import { museSamples } from '../web/lib/samples/muse-generated.js';
import { uiHtml } from '../web/lib/artifacts.js';
import { importProject } from '../server/validation.mjs';
import { buildSourceFiles } from '../web/lib/source-export.js';

const sha256 = text => createHash('sha256').update(text).digest('hex');
const evidenceFile = (id, name) => new URL(`../output/gallery-muse/${id}/${name}`, import.meta.url);
const externalResource = /(?:src|href)\s*=\s*["'](?:https?:)?\/\/|@import|url\(\s*["']?(?:https?:)?\/\//i;

test('all twelve built-in samples come from completed Muse runs with matching source evidence', async () => {
  assert.equal(samples.length, 12);
  assert.equal(new Set(samples.map(sample => sample.id)).size, 12);
  assert.deepEqual(Object.keys(museSamples).sort(), samples.map(sample => sample.id).sort());
  assert.deepEqual(Object.fromEntries(['ui', 'ppt', 'text', 'image'].map(type => [type, samples.filter(sample => sample.type === type).length])), { ui: 6, ppt: 2, text: 2, image: 2 });
  for (const sample of samples) {
    const { artifact, provenance } = museSamples[sample.id];
    const originalRaw = await readFile(evidenceFile(sample.id, 'artifact.json'), 'utf8');
    const originalProvenance = JSON.parse(await readFile(evidenceFile(sample.id, 'provenance.json'), 'utf8'));
    const finalRaw = provenance.review ? await readFile(evidenceFile(sample.id, 'reviewed-artifact.json'), 'utf8') : originalRaw;
    assert.equal(provenance.artifactSha256, sha256(finalRaw), sample.id);
    assert.equal(sha256(JSON.stringify(artifact)), sha256(JSON.stringify(JSON.parse(finalRaw))), `${sample.id}: catalog must contain the actual delivered artifact`);
    assert.equal(provenance.originalArtifactSha256 || provenance.artifactSha256, sha256(originalRaw), sample.id);
    assert.equal(originalProvenance.artifactSha256, sha256(originalRaw), sample.id);
    assert.equal(artifact.type, sample.type);
    assert.equal(provenance.engine, 'Muse Studio / Pi');
    assert.equal(provenance.skillVersion, '6.0.0');
    assert.equal(provenance.model, originalProvenance.model);
    assert.equal(provenance.generatedAt, originalProvenance.generatedAt);
    assert.deepEqual(provenance.referencesRequested, originalProvenance.referencesRequested);
    assert.deepEqual(provenance.toolSteps, originalProvenance.toolSteps);
    assert.ok(provenance.referencesRequested.includes('references/acceptance_protocol.md'), sample.id);
    for (const tool of ['get_task_context', 'read_muse_reference', 'submit_artifact', 'inspect_artifact']) {
      assert.ok(provenance.toolSteps.some(step => step.tool === tool && step.success), `${sample.id}: ${tool}`);
    }
    if (provenance.review) {
      const review = JSON.parse(await readFile(evidenceFile(sample.id, 'review.json'), 'utf8'));
      assert.deepEqual(provenance.review, review);
      assert.equal(review.originalArtifactSha256, sha256(originalRaw));
      assert.equal(review.artifactSha256, sha256(finalRaw));
      assert.ok(review.changes.length > 0);
    }
  }
});

test('Muse samples survive workspace import and export with complete source and creative direction', () => {
  for (const sample of samples) {
    const original = createSample(sample.id);
    const project = importProject({ id: randomUUID(), sampleId: sampleProjectKey(sample.id), type: sample.type, title: sample.title, versions: [original], messages: [{ role: 'assistant', text: '已打开样板', version: 0 }] });
    const artifact = project.versions[0];
    assert.equal(artifact.demo, true, sample.id);
    assert.equal(project.sampleId, sampleProjectKey(sample.id));
    assert.notEqual(project.sampleId, sample.id, 'legacy example copies retain their own identity');
    assert.notEqual(project.sampleId, `curated-v1:${sample.id}`, 'handwritten sample copies retain their own identity');
    assert.equal(artifact.direction, original.direction, sample.id);
    assert.ok(original.direction.includes(museSamples[sample.id].artifact.direction), sample.id);
    const files = buildSourceFiles(artifact);
    const manifest = JSON.parse(files['manifest.json']);
    assert.ok(files[manifest.entry], sample.id);
    assert.ok(files['design-system/README.md'].includes(original.direction), sample.id);
    if (sample.type === 'ui') {
      assert.equal(files['index.html'], uiHtml(original));
      assert.equal(files['source/index.html'], original.html);
      assert.equal(files['source/styles.css'], original.css);
      assert.equal(files['source/script.js'], original.js);
      assert.ok(original.css.trim(), `${sample.id}: actual modular styles must be present`);
      assert.ok(original.js.trim(), `${sample.id}: actual interactions must be present`);
    }
    if (sample.type === 'image') assert.equal(files['image.svg'], original.svg);
    if (sample.type === 'text') assert.equal(files['content.md'], original.text);
    if (sample.type === 'ppt') {
      assert.equal(original.slides.length, 6, sample.id);
      assert.deepEqual(JSON.parse(files['source/slides.json']), original.slides);
      original.slides.forEach((slide, i) => {
        assert.ok(files[`source/slides/${String(i + 1).padStart(2, '0')}.html`].includes(slide.html));
        assert.ok(slide.note.trim());
        assert.ok(files['speaker-notes.md'].includes(slide.note));
      });
    }
  }
});

test('sample copies never mutate the built-in artifacts or their generation evidence', () => {
  for (const sample of samples) {
    const first = createSample(sample.id), second = createSample(sample.id);
    const pristine = structuredClone(museSamples[sample.id]);
    first.title = '用户自己的修改';
    first.verification.format = false;
    first.sampleProvenance.referencesRequested.push('用户自己的规范');
    first.sampleProvenance.toolSteps[0].success = false;
    if (first.slides) first.slides[0].title = '用户自己的幻灯片';
    assert.notDeepEqual(first, second);
    assert.deepEqual(createSample(sample.id), second);
    assert.deepEqual(museSamples[sample.id], pristine);
    assert.equal(second.demo, true);
    assert.deepEqual(second.sampleProvenance, { sampleId: sample.id, ...pristine.provenance });
  }
  assert.throws(() => createSample('missing'), /不可用/);
});

test('static covers render actual styles and copy without scripts or external dependencies', async () => {
  for (const sample of samples) {
    const card = sampleCard(sample);
    assert.doesNotMatch(card, /<iframe\b/i, sample.id);
    assert.ok(card.includes(`/assets/gallery/${sample.id}.png?v=${museSamples[sample.id].provenance.artifactSha256.slice(0, 12)}`), sample.id);
    const png = await readFile(new URL(`../web/assets/gallery/${sample.id}.png`, import.meta.url));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', sample.id);
    assert.equal(png.readUInt32BE(16), 1200, `${sample.id}: cover width`);
    assert.equal(png.readUInt32BE(20), 750, `${sample.id}: cover height`);
    const cover = sampleCover(sample.id);
    assert.match(cover, /Content-Security-Policy/);
    assert.match(cover, /script-src 'none'/);
    assert.doesNotMatch(cover, /<script\b/i, sample.id);
    assert.doesNotMatch(cover, externalResource, sample.id);
    const artifact = createSample(sample.id);
    const source = [artifact.html, artifact.css, artifact.js, artifact.svg, ...(artifact.slides || []).map(slide => slide.html)].filter(Boolean).join('\n');
    assert.doesNotMatch(source, externalResource, sample.id);
    if (sample.type === 'ui') {
      assert.ok(cover.includes(artifact.css.replace(/<\/style/gi, '<\\/style')), `${sample.id}: cover retains the real stylesheet`);
      assert.doesNotMatch(cover, /<link\b[^>]*\brel\s*=\s*["']?stylesheet\b/i, sample.id);
    }
    if (sample.type === 'ppt') assert.ok(cover.includes(artifact.slides[0].html), sample.id);
    if (sample.type === 'image') assert.ok(cover.includes(artifact.svg), sample.id);
    if (sample.type === 'text') {
      const firstParagraph = artifact.text.split(/^##\s+.+$/m)[1].trim().split(/\n\s*\n/)[0];
      assert.ok(cover.includes(escapeHtml(firstParagraph)), `${sample.id}: cover excerpt must come from the delivered copy`);
    }
  }
});
