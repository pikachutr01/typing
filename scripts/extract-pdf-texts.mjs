import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const projectRoot = process.cwd()
const sourceDir = path.join(projectRoot, 'UygulamaliSinavMetinleri')
const outputFile = path.join(projectRoot, 'src', 'data', 'texts.ts')

function getNumberFromFileName(fileName) {
  const match = fileName.match(/\d+/)

  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}

function toTitle(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName))
  const number = getNumberFromFileName(baseName)

  return Number.isFinite(number) ? `Metin ${number}` : baseName
}

function toId(fileName) {
  const number = getNumberFromFileName(fileName)

  return Number.isFinite(number)
    ? `uygulamali-sinav-metin-${number}`
    : path
        .basename(fileName, path.extname(fileName))
        .toLocaleLowerCase('tr-TR')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '')
}

function cleanExtractedText(value) {
  return value
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/2025 YILI ZABIT KATİBİ UYGULAMALI SINAV METİNLERİ/giu, '')
    .replace(/metin\s+\d+\s+--\s+\d+\s+of\s+\d+\s+--/giu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wrapText(value, maxLineLength = 96) {
  const words = value.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length > maxLineLength && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = nextLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.join('\n')
}

function escapeTemplateLiteral(value) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

async function extractPdfText(filePath) {
  const data = await readFile(filePath)
  const parser = new PDFParse({ data })

  try {
    const result = await parser.getText()

    return cleanExtractedText(result.text)
  } finally {
    await parser.destroy()
  }
}

function renderTextsFile(items) {
  const renderedItems = items
    .map(
      (item) => `  {
    id: '${item.id}',
    title: '${item.title}',
    category: 'Uygulamalı Sınav Metinleri',
    difficulty: 'medium',
    content: normalizeStoredText(\`
${escapeTemplateLiteral(wrapText(item.content))}
\`),
  },`,
    )
    .join('\n')

  return `import type { TypingText } from '../types/typing'

function normalizeStoredText(value: string) {
  return value.replace(/\\s+/g, ' ').trim()
}

export const typingTexts: TypingText[] = [
${renderedItems}
]
`
}

const pdfFiles = (await readdir(sourceDir))
  .filter((fileName) => fileName.toLocaleLowerCase('tr-TR').endsWith('.pdf'))
  .sort((left, right) => getNumberFromFileName(left) - getNumberFromFileName(right))

if (pdfFiles.length === 0) {
  throw new Error(`No PDF files found in ${sourceDir}`)
}

const items = []

for (const fileName of pdfFiles) {
  const filePath = path.join(sourceDir, fileName)
  const content = await extractPdfText(filePath)

  if (!content) {
    throw new Error(`Could not extract text from ${fileName}`)
  }

  items.push({
    id: toId(fileName),
    title: toTitle(fileName),
    content,
  })
}

await writeFile(outputFile, renderTextsFile(items), 'utf8')

console.log(`Extracted ${items.length} PDF texts into ${path.relative(projectRoot, outputFile)}`)
