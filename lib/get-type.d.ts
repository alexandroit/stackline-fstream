import { Stats } from 'fs'
import fstream = require('../index.js')

declare function getType(stat: fstream.EntryProperties | Stats): fstream.EntryType | null
export = getType
