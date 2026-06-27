// scripts/generate-banner.mjs
// Generates public/brand/banner.png via Satori (JSX → SVG → PNG).
// Proper font rendering — no ImageMagick text fallback.
//
// PER-PROJECT SETUP (do this before running):
//   1. Invoke Rams for a banner spec — font, layout, copy, proportions
//   2. Update the BANNER CONFIG section below to match the spec
//   3. npm install --save-dev @fontsource/<FONTSOURCE_PKG>
//   4. npm run generate-banner
//
// Re-run any time the logomark, name, or tagline changes.

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ── BANNER CONFIG — update per project after Rams spec ──────────────────────

const FONT_FAMILY      = 'Instrument Sans'   // Satori display name (must match @fontsource font)
const FONTSOURCE_PKG   = 'instrument-sans'   // @fontsource/<this> — install before running
const FONT_WEIGHT_NAME = 500                 // weight for product name (Medium = 500)
const FONT_WEIGHT_TAG  = 400                 // weight for tagline (Regular = 400)

const MARK_SIZE  = 260  // px — increase if your logomark PNG has large transparent padding
const NAME_SIZE  = 72   // px
const TAG_SIZE   = 20   // px
const MARK_GAP   = 48   // px gap between mark and text column

// Tagline — design decision, set after Rams spec (not auto-read from site.ts)
const TAGLINE = 'Your tagline here.'

const COLORS = {
  bg:   '#0F0F12',  // match site.bg in site.ts
  name: '#F0EEE8',  // match --color-text in globals.css
  tag:  '#8A8894',  // match --color-muted in globals.css
}

// ────────────────────────────────────────────────────────────────────────────

// Read product name from site.ts
const siteTsPath = path.join(ROOT, 'src', 'config', 'site.ts')
let productName = 'Your Product'
if (fs.existsSync(siteTsPath)) {
  const siteTs = fs.readFileSync(siteTsPath, 'utf8')
  const m = siteTs.match(/name:\s*'([^']+)'/)
  if (m && !m[1].includes('TODO')) productName = m[1]
}

// Read logomark
const logomarkPath = path.join(ROOT, 'public', 'brand', 'logomark.png')
if (!fs.existsSync(logomarkPath)) {
  console.error('ERROR: public/brand/logomark.png not found')
  process.exit(1)
}
const logomarkBase64 = `data:image/png;base64,${fs.readFileSync(logomarkPath).toString('base64')}`

// Load @fontsource WOFF files — Google Fonts always serves WOFF2 which Satori cannot parse
const fontsDir = path.join(ROOT, 'node_modules', '@fontsource', FONTSOURCE_PKG, 'files')
if (!fs.existsSync(fontsDir)) {
  console.error(`ERROR: @fontsource/${FONTSOURCE_PKG} not installed.`)
  console.error(`Run: npm install --save-dev @fontsource/${FONTSOURCE_PKG}`)
  process.exit(1)
}

function loadFont(weight) {
  const file = path.join(fontsDir, `${FONTSOURCE_PKG}-latin-${weight}-normal.woff`)
  if (!fs.existsSync(file)) {
    console.error(`ERROR: Font file not found: ${file}`)
    console.error(`Check available weights in node_modules/@fontsource/${FONTSOURCE_PKG}/files/`)
    process.exit(1)
  }
  return fs.readFileSync(file)
}

console.log(`Generating banner — ${productName}`)
const fontName = loadFont(FONT_WEIGHT_NAME)
const fontTag  = loadFont(FONT_WEIGHT_TAG)

const svg = await satori(
  {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '1280px',
        height: '320px',
        background: COLORS.bg,
        alignItems: 'center',
        paddingLeft: 80,
        paddingRight: 80,
      },
      children: [
        // Mark
        {
          type: 'img',
          props: {
            src: logomarkBase64,
            width: MARK_SIZE,
            height: MARK_SIZE,
            style: { objectFit: 'contain', flexShrink: 0 },
          },
        },
        // Name + tagline
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              marginLeft: MARK_GAP,
              justifyContent: 'center',
              gap: 12,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: FONT_FAMILY,
                    fontWeight: FONT_WEIGHT_NAME,
                    fontSize: NAME_SIZE,
                    color: COLORS.name,
                    lineHeight: 1,
                    letterSpacing: '-1px',
                  },
                  children: productName,
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: FONT_FAMILY,
                    fontWeight: FONT_WEIGHT_TAG,
                    fontSize: TAG_SIZE,
                    color: COLORS.tag,
                    lineHeight: 1.4,
                  },
                  children: TAGLINE,
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    width: 1280,
    height: 320,
    fonts: [
      { name: FONT_FAMILY, data: fontName, weight: FONT_WEIGHT_NAME, style: 'normal' },
      { name: FONT_FAMILY, data: fontTag,  weight: FONT_WEIGHT_TAG,  style: 'normal' },
    ],
  }
)

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } })
const png = resvg.render().asPng()

const outPath = path.join(ROOT, 'public', 'brand', 'banner.png')
fs.writeFileSync(outPath, png)
console.log(`✓  public/brand/banner.png  (${(png.byteLength / 1024).toFixed(0)} KB)`)
