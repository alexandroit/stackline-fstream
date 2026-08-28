import fstream = require('../..')
import Reader = require('../../lib/reader')
import DirReader = require('../../lib/dir-reader')

const options: fstream.ReaderOptions = {
  path: '/tmp/example',
  follow: true,
  sort: 'alpha'
}
const called: fstream.Reader = fstream.Reader(options)
const constructed: fstream.Reader = new fstream.Reader('/tmp/example')
const deepCalled: fstream.Reader = Reader('/tmp/example')
const typedDirectory: fstream.DirReader = new DirReader({
  path: '/tmp/example',
  type: 'Directory',
  Directory: true
})

called.pause()
constructed.resume()
deepCalled.abort()
typedDirectory.getChildProps()

// @ts-expect-error Reader options require a path.
const missingPath: fstream.ReaderOptions = { follow: true }
void missingPath
