import fstream = require('./index.js')

export default fstream
export const Abstract: typeof fstream.Abstract
export const Reader: typeof fstream.Reader
export const Writer: typeof fstream.Writer
export const File: typeof fstream.File
export const Dir: typeof fstream.Dir
export const Link: typeof fstream.Link
export const Proxy: typeof fstream.Proxy
export const DirReader: typeof fstream.DirReader
export const FileReader: typeof fstream.FileReader
export const LinkReader: typeof fstream.LinkReader
export const ProxyReader: typeof fstream.ProxyReader
export const DirWriter: typeof fstream.DirWriter
export const FileWriter: typeof fstream.FileWriter
export const LinkWriter: typeof fstream.LinkWriter
export const ProxyWriter: typeof fstream.ProxyWriter
export const collect: typeof fstream.collect

export type EntryType = fstream.EntryType
export type EntryFilter = fstream.EntryFilter
export type EntrySort = fstream.EntrySort
export type EntryProperties = fstream.EntryProperties
export type ReaderOptions = fstream.ReaderOptions
export type WriterOptions = fstream.WriterOptions
export type AbstractStream = fstream.Abstract
export type ReaderStream = fstream.Reader
export type WriterStream = fstream.Writer
export type DirReaderStream = fstream.DirReader
export type FileReaderStream = fstream.FileReader
export type LinkReaderStream = fstream.LinkReader
export type ProxyReaderStream = fstream.ProxyReader
export type DirWriterStream = fstream.DirWriter
export type FileWriterStream = fstream.FileWriter
export type LinkWriterStream = fstream.LinkWriter
export type ProxyWriterStream = fstream.ProxyWriter
