#!/usr/bin/env node
// Optimize the founder headshot for the web + Google Images.
//
//   node scripts/optimize-founder-photo.mjs "Mohammad Sohag Ceo and founder.png"
//
// Source is a 1024x1024 PNG with a generator watermark in the bottom-right
// corner (the sparkle sits around x/y 950-1024). Cropping to the top-left
// 940x940 square drops that corner entirely while keeping the subject framed.
// Output: an 900x900 progressive JPEG, sized for the profile card at 2x.
import sharp from 'sharp'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync } from 'fs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = process.argv[2] || 'Mohammad Sohag Ceo and founder.png'
const out = join(root, 'public/team/mohammad-sohag-ceo-founder.jpg')
// Same bytes at the legacy path, so an already-indexed image URL shows the
// new photo instead of a stale one — Google re-crawls both and picks one.
const legacy = join(root, 'public/team/mohammad-sohag.jpg')

const CROP = { left: 0, top: 0, width: 940, height: 940 }

const info = await sharp(join(root, src))
  .extract(CROP)
  .resize(900, 900, { fit: 'cover' })
  .jpeg({ quality: 88, progressive: true, mozjpeg: true })
  .toFile(out)

copyFileSync(out, legacy)
console.log(`wrote ${out}`)
console.log(`wrote ${legacy} (legacy path, same bytes)`)
console.log(`${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`)
