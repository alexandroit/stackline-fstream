import path from 'node:path'
import { Reader } from '@stackline/fstream'

const target = path.resolve(process.argv[2] || '.')
const reader = Reader({ path: target, sort: 'alpha' })

reader.on('ready', () => {
  console.log(`${reader.type}\t${reader.path}`)
})

reader.on('child', (entry) => {
  console.log(`${entry.type}\t${path.relative(target, entry.path)}`)
})

reader.on('warn', (warning) => {
  console.error(`warning: ${warning.message}`)
})

reader.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
