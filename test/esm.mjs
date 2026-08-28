import assert from 'node:assert/strict'
import fstream, {
  Abstract,
  Reader,
  Writer,
  File,
  Dir,
  Link,
  Proxy,
  DirReader,
  FileReader,
  LinkReader,
  ProxyReader,
  DirWriter,
  FileWriter,
  LinkWriter,
  ProxyWriter,
  collect
} from '../index.mjs'
import DeepReader from '../esm/lib/reader.mjs'
import DeepWriter from '../esm/lib/writer.mjs'
import DeepCollect from '../esm/lib/collect.mjs'

assert.deepEqual(Object.keys(fstream), [
  'Abstract', 'Reader', 'Writer', 'File', 'Dir', 'Link', 'Proxy',
  'DirReader', 'FileReader', 'LinkReader', 'ProxyReader',
  'DirWriter', 'FileWriter', 'LinkWriter', 'ProxyWriter', 'collect'
])
assert.equal(Abstract, fstream.Abstract)
assert.equal(Reader, fstream.Reader)
assert.equal(Writer, fstream.Writer)
assert.equal(File, fstream.File)
assert.equal(Dir, fstream.Dir)
assert.equal(Link, fstream.Link)
assert.equal(Proxy, fstream.Proxy)
assert.equal(DirReader, fstream.DirReader)
assert.equal(FileReader, fstream.FileReader)
assert.equal(LinkReader, fstream.LinkReader)
assert.equal(ProxyReader, fstream.ProxyReader)
assert.equal(DirWriter, fstream.DirWriter)
assert.equal(FileWriter, fstream.FileWriter)
assert.equal(LinkWriter, fstream.LinkWriter)
assert.equal(ProxyWriter, fstream.ProxyWriter)
assert.equal(collect, fstream.collect)
assert.equal(DeepReader, Reader)
assert.equal(DeepWriter, Writer)
assert.equal(DeepCollect, collect)

console.log('ESM namespace, identity, and deep facades passed.')
