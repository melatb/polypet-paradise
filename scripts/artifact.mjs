// Turns dist-single/index.html into a page body for the Claude artifact preview
// (the artifact host supplies its own <html>/<head>/<body> wrapper).
import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('dist-single/index.html', 'utf8')
s = s.replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '').replace(/<\/?head>/gi, '').replace(/<\/?body>/gi, '')
  .replace(/<meta [^>]*>/gi, '').replace(/<link rel="icon"[^>]*>/gi, '')
writeFileSync('dist-single/artifact.html', s.trim() + '\n')
console.log('wrote dist-single/artifact.html', (s.length / 1024).toFixed(0) + ' KB')
