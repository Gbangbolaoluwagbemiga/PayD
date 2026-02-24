#!/usr/bin/env node
/**
 * Patches @stellar/design-system build output to fix ESM directory import errors.
 * Cross-platform replacement for macOS-only `sed -i ''` in postinstall.
 */

const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'node_modules', '@stellar', 'design-system', 'build');
const indexPath = path.join(base, 'index.js');

if (!fs.existsSync(indexPath)) {
    console.warn('[patch-design-system] index.js not found, skipping patch.');
    process.exit(0);
}

// Idempotent replacements — won't double-apply if already patched
let content = fs.readFileSync(indexPath, 'utf8');
const original = content;
content = content
    .replace(/export \* from "\.\/components(?!\/index\.js)"/g, 'export * from "./components/index.js"')
    .replace(/export \* from "\.\/icons(?!\.js)"/g, 'export * from "./icons.js"')
    .replace(/export \* from "\.\/logos(?!\.js)"/g, 'export * from "./logos.js"');

if (content !== original) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('[patch-design-system] Patched index.js exports.');
} else {
    console.log('[patch-design-system] index.js already patched, skipping.');
}

// Create stub styles.scss files in each component subdirectory
const componentsDir = path.join(base, 'components');
if (fs.existsSync(componentsDir)) {
    const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const scssPath = path.join(componentsDir, entry.name, 'styles.scss');
            if (!fs.existsSync(scssPath)) {
                fs.writeFileSync(scssPath, '', 'utf8');
            }
        }
    }
}

// Create placeholder arrow.svg for Floater component
const arrowPath = path.join(componentsDir, 'Floater', 'arrow.svg');
if (!fs.existsSync(arrowPath)) {
    fs.mkdirSync(path.dirname(arrowPath), { recursive: true });
    fs.writeFileSync(
        arrowPath,
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path d="M0 0l5 5 5-5z"/></svg>',
        'utf8'
    );
}

console.log('[patch-design-system] Done.');
