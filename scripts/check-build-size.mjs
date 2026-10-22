import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const assetDirectory = new URL('../dist/assets/', import.meta.url)
const limits = {
  '.css': 100 * 1024,
  '.js': 400 * 1024,
}

const files = await readdir(assetDirectory)
const totals = { '.css': 0, '.js': 0 }

for (const file of files) {
  const extension = file.endsWith('.css')
    ? '.css'
    : file.endsWith('.js')
      ? '.js'
      : undefined

  if (extension) {
    totals[extension] += (await stat(join(assetDirectory.pathname, file))).size
  }
}

let failed = false
for (const extension of ['.js', '.css']) {
  const sizeInKilobytes = (totals[extension] / 1024).toFixed(1)
  const limitInKilobytes = limits[extension] / 1024
  console.log(
    `${extension.slice(1).toUpperCase()} assets: ${sizeInKilobytes} KB / ${limitInKilobytes} KB limit`,
  )
  failed ||= totals[extension] > limits[extension]
}

if (failed) {
  console.error('Production assets exceed the configured size budget.')
  process.exitCode = 1
}
