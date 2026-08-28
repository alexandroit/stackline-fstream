import fstream = require('@stackline/fstream')
import Reader = require('@stackline/fstream/lib/reader.js')
import Writer = require('@stackline/fstream/lib/writer')

const reader: fstream.Reader = new fstream.Reader('/tmp/input')
const deepReader: fstream.Reader = Reader({ path: '/tmp/input' })
const writer: fstream.Writer = new fstream.Writer('/tmp/output')
const deepWriter: fstream.Writer = Writer({ path: '/tmp/output' })

reader.pipe(writer)
deepReader.pipe(deepWriter)

// @ts-expect-error New implementation helpers are deliberately private.
import PrivateTraversal = require('@stackline/fstream/lib/traversal')
void PrivateTraversal

// @ts-expect-error write accepts byte data, not objects.
writer.write({ invalid: true })
