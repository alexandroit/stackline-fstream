/// <reference types="node" />

import { Stats } from 'fs'
import { Stream } from 'stream'

declare namespace fstream {
  type EntryType =
    | 'Directory'
    | 'File'
    | 'SymbolicLink'
    | 'Link'
    | 'BlockDevice'
    | 'CharacterDevice'
    | 'FIFO'
    | 'Socket'

  type EntryFilter = (this: Reader | Writer, entry: Reader | Writer, stat?: Stats) => boolean
  type EntrySort = (this: Reader, left: string, right: string) => number

  interface EntryProperties {
    path: string
    type?: EntryType | ReaderConstructor<Reader>
    Directory?: boolean
    File?: boolean
    SymbolicLink?: boolean
    Link?: boolean
    BlockDevice?: boolean
    CharacterDevice?: boolean
    FIFO?: boolean
    Socket?: boolean
    isDirectory?: boolean | (() => boolean)
    isFile?: boolean | (() => boolean)
    isSymbolicLink?: boolean | (() => boolean)
    isBlockDevice?: boolean | (() => boolean)
    isCharacterDevice?: boolean | (() => boolean)
    isFIFO?: boolean | (() => boolean)
    isSocket?: boolean | (() => boolean)
    basename?: string
    dirname?: string
    linkpath?: string
    depth?: number
    size?: number
    mode?: number | string
    uid?: number
    gid?: number
    atime?: Date | number | string
    mtime?: Date | number | string
    dev?: number
    ino?: number
    nlink?: number
    blksize?: number
    flags?: string
    follow?: boolean
    hardlinks?: boolean
    clobber?: boolean
    sort?: 'alpha' | EntrySort
    filter?: EntryFilter
    parent?: Reader | Writer | null
    root?: Reader | Writer | null
    [key: string]: unknown
  }

  type ReaderOptions = EntryProperties
  type WriterOptions = EntryProperties

  class Abstract extends Stream {
    ready?: boolean
    path: string
    _path: string
    type: EntryType | null
    linkpath?: string | null
    abort(): void
    destroy(): void
    warn(message: string | Error, code?: string | null): void
    info(message: string, code?: string): void
    error(message: string | Error, code?: string | null, throwError?: boolean): void
  }

  interface Reader extends Abstract {
    readable: true
    writable: false
    ready: boolean
    props: EntryProperties
    parent: Reader | null
    root: Reader
    depth: number
    basename: string
    dirname: string
    size?: number
    filter: EntryFilter | null
    pause(who?: Reader): void | false
    resume(who?: Reader): void | false
    pipe<T>(destination: T, options?: { end?: boolean }): T
  }

  interface DirReader extends Reader {
    entries: string[] | null
    sort?: EntrySort
    disown(entry: Reader): void
    getChildProps(stat?: Stats): ReaderOptions
    emitEntry(entry: Reader): void
  }

  interface FileReader extends Reader {}
  interface LinkReader extends Reader {}
  interface ProxyReader extends Reader {}
  interface SocketReader extends Reader {}

  interface Writer extends Abstract {
    readable: false
    writable: true
    ready: boolean
    props: EntryProperties
    parent: Writer | null
    root: Writer
    depth: number
    basename: string
    dirname: string
    size?: number
    clobber: boolean
    filter: EntryFilter | null
    write(chunk: string | Buffer): boolean
    end(chunk?: string | Buffer): boolean | void | NodeJS.WritableStream
    add(entry: Reader): boolean | void
  }

  interface DirWriter extends Writer {}
  interface FileWriter extends Writer {}
  interface LinkWriter extends Writer {}
  interface ProxyWriter extends Writer {}

  interface ReaderConstructor<T extends Reader> {
    new (properties: ReaderOptions, currentStat?: Stats): T
  }

  interface ReaderFactory {
    (pathOrProperties: string | ReaderOptions, currentStat?: Stats): Reader
    new (pathOrProperties: string | ReaderOptions, currentStat?: Stats): Reader
    Dir: ReaderConstructor<DirReader>
    File: ReaderConstructor<FileReader>
    Link: ReaderConstructor<LinkReader>
    Proxy: ReaderConstructor<ProxyReader>
    hardLinks: Record<string, string>
  }

  interface WriterConstructor<T extends Writer> {
    new (properties: WriterOptions, currentStat?: Stats): T
  }

  interface WriterFactory {
    (pathOrProperties: string | WriterOptions, currentStat?: Stats): Writer
    new (pathOrProperties: string | WriterOptions, currentStat?: Stats): Writer
    Dir: WriterConstructor<DirWriter>
    File: WriterConstructor<FileWriter>
    Link: WriterConstructor<LinkWriter>
    Proxy: WriterConstructor<ProxyWriter>
    dirmode: number
    filemode: number
  }

  interface ReaderWriterGroup<R extends Reader, W extends Writer> {
    Reader: ReaderConstructor<R>
    Writer: WriterConstructor<W>
  }

  interface FStreamNamespace {
    Abstract: typeof Abstract
    Reader: ReaderFactory
    Writer: WriterFactory
    File: ReaderWriterGroup<FileReader, FileWriter>
    Dir: ReaderWriterGroup<DirReader, DirWriter>
    Link: ReaderWriterGroup<LinkReader, LinkWriter>
    Proxy: ReaderWriterGroup<ProxyReader, ProxyWriter>
    DirReader: ReaderConstructor<DirReader>
    FileReader: ReaderConstructor<FileReader>
    LinkReader: ReaderConstructor<LinkReader>
    ProxyReader: ReaderConstructor<ProxyReader>
    DirWriter: WriterConstructor<DirWriter>
    FileWriter: WriterConstructor<FileWriter>
    LinkWriter: WriterConstructor<LinkWriter>
    ProxyWriter: WriterConstructor<ProxyWriter>
    collect(stream: Reader | NodeJS.ReadableStream): void
  }

  const Reader: ReaderFactory
  const Writer: WriterFactory
  const File: ReaderWriterGroup<FileReader, FileWriter>
  const Dir: ReaderWriterGroup<DirReader, DirWriter>
  const Link: ReaderWriterGroup<LinkReader, LinkWriter>
  const Proxy: ReaderWriterGroup<ProxyReader, ProxyWriter>
  const DirReader: ReaderConstructor<DirReader>
  const FileReader: ReaderConstructor<FileReader>
  const LinkReader: ReaderConstructor<LinkReader>
  const ProxyReader: ReaderConstructor<ProxyReader>
  const DirWriter: WriterConstructor<DirWriter>
  const FileWriter: WriterConstructor<FileWriter>
  const LinkWriter: WriterConstructor<LinkWriter>
  const ProxyWriter: WriterConstructor<ProxyWriter>
  function collect(stream: Reader | NodeJS.ReadableStream): void
}

// A required never argument makes the namespace value non-callable in useful
// TypeScript programs while enabling declaration merging for CommonJS users.
declare function fstream(unusable: never): never

export = fstream
