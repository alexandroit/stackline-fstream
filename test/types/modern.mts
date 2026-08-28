import fstream, {
  Reader,
  Writer,
  collect,
  type EntryType,
  type ReaderOptions,
  type ReaderStream,
  type WriterOptions,
  type WriterStream
} from '@stackline/fstream'
import DeepReader from '@stackline/fstream/lib/reader'
import DeepReaderJs from '@stackline/fstream/lib/reader.js'
import DeepWriter from '@stackline/fstream/lib/writer'

const readerOptions: ReaderOptions = { path: '/tmp/input', sort: 'alpha' }
const writerOptions: WriterOptions = { path: '/tmp/output', type: 'File' }
const reader: ReaderStream = new Reader(readerOptions)
const writer: WriterStream = new Writer(writerOptions)
const type: EntryType = 'Directory'

collect(reader)
DeepReader('/tmp/input')
new DeepReaderJs('/tmp/input')
DeepWriter('/tmp/output')

const sameDefault: typeof fstream = fstream
void sameDefault
void writer
void type

// @ts-expect-error New implementation helpers are deliberately private.
const privateHelper = await import('@stackline/fstream/lib/mkdir')
void privateHelper

// @ts-expect-error EntryType rejects unknown filesystem kinds.
const invalidType: EntryType = 'Unknown'
void invalidType
