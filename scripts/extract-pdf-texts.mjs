import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const projectRoot = process.cwd()

// Config for extraction
const targetFolders = [
  { dir: 'SinavMetinleri_2022', categoryId: 3, categoryName: '2022 Zabıt Katipliği Metinleri', year: 2022 }
]
const outputFile = path.join(projectRoot, 'insert_texts.sql')

function getNumberFromFileName(fileName) {
  const match = fileName.match(/\d+/)
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}

function cleanExtractedText(value, year) {
  let cleaned = value
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/metin\s+\d+\s+--\s+\d+\s+of\s+\d+\s+--/giu, '')
    .replace(/\s+/g, ' ')
    .trim()
    
  if (year === 2025) {
    cleaned = cleaned.replace(/2025 YILI ZABIT KATİBİ UYGULAMALI SINAV METİNLERİ/giu, '')
  } else if (year === 2022) {
    cleaned = cleaned.replace(/2022 YILI ZABIT KÂTİBİ UYGULAMALI SINAV METİNLERİ/giu, '')
                     .replace(/2022 YILI ZABIT KATİBİ UYGULAMALI SINAV METİNLERİ/giu, '')
  }
  return cleaned.trim()
}

async function extractPdfText(filePath, year) {
  const data = await readFile(filePath)
  const parser = new PDFParse({ data })
  try {
    const result = await parser.getText()
    return cleanExtractedText(result.text, year)
  } finally {
    await parser.destroy()
  }
}

async function run() {
  let sql = "SET NAMES utf8mb4;\n\n"
  
  for (const folder of targetFolders) {
    const sourceDir = path.join(projectRoot, folder.dir)
    let pdfFiles = []
    try {
      pdfFiles = await readdir(sourceDir)
    } catch(err) {
      console.warn(`Folder ${folder.dir} not found, skipping...`)
      continue
    }

    pdfFiles = pdfFiles.filter((fileName) => fileName.toLocaleLowerCase('tr-TR').endsWith('.pdf'))
                       .sort((left, right) => getNumberFromFileName(left) - getNumberFromFileName(right))

    const items = []
    for (const fileName of pdfFiles) {
      const filePath = path.join(sourceDir, fileName)
      const content = await extractPdfText(filePath, folder.year)
      if (!content) {
        console.warn(`Could not extract text from ${fileName}`)
        continue
      }
      items.push({
        title: `Metin ${getNumberFromFileName(fileName)}`,
        content: content.replace(/'/g, "''")
      })
    }
    
    if (items.length > 0) {
      sql += `INSERT INTO \`categories\` (\`id\`, \`name\`) VALUES (${folder.categoryId}, '${folder.categoryName}') ON DUPLICATE KEY UPDATE \`name\`=\`name\`;\n\n`
      sql += "INSERT INTO `texts` (`category_id`, `title`, `content`) VALUES\n"
      const values = items.map(item => `(${folder.categoryId}, '${item.title}', '${item.content}')`)
      sql += values.join(',\n') + ';\n\n'
      console.log(`Prepared SQL for ${items.length} texts from ${folder.dir}`)
    }
  }

  await writeFile(outputFile, sql, 'utf8')
  console.log(`Generated SQL file at ${outputFile}`)
}

run().catch(console.error)
