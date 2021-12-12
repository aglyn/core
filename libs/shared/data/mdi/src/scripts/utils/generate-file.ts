/**
 * @license
 * Copyright 2021 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs')
const dirname = require('path').dirname
const {convertIdToModuleName} = require('../../lib/utils/convert-id-to-module-name')


type FileOptionsJson = {
  type: 'json',
  data: Record<any, any>
  minify?: boolean
}
type FileOptionsExportDefault = {
  type: 'module',
  data: Record<any, any> | Record<any, any>[]
}
type FileOptionsExportName = {
  type: 'named',
  data: Record<any, any>[]
}

type FileUnionOptions =
  | FileOptionsJson
  | FileOptionsExportDefault
  | FileOptionsExportName

type FileOptions = FileUnionOptions & {
  file: string,
  dir?: string
}

function writeFile(dir, fileName, contents) {
  const outFile = `${dir}${fileName}`
  fs.mkdir(dirname(outFile), {recursive: true}, function(err) {
    if (err) {
      console.error('Error creating directory for file', fileName, `(${outFile})`, err)
    }
    else {
      fs.writeFile(outFile, contents, (err) => {
        if (err) {
          console.error('Error generating file', fileName, `(${outFile})`, err)
        }
        else {
          console.log('\u2714 Generated file', fileName, `(${outFile})`)
        }
      })
    }
  })

}

function generateJsonFile(opts: FileOptions & FileOptionsJson) {
  const data = Array.isArray(opts.data) ? {data: opts.data} : opts.data
  const contents = JSON.stringify(data, null, opts.minify ? null : 2)
  const filename = `${opts.file}${opts.minify ? '.min' : ''}.json`
  writeFile(opts.dir, filename, contents)
}

function generateExportDefaultFile(opts: FileOptions & FileOptionsExportDefault) {
  const filename = `${opts.file}.ts`
  const data = JSON.stringify(opts.data, null, 2)
  const contents = `export default ${data}`
  writeFile(opts.dir, filename, contents)
}

function generateExportNamedFile(opts: FileOptions & FileOptionsExportName) {
  const filename = `${opts.file}.ts`
  const contents = opts.data.map((icon) => {
    const data = JSON.stringify(icon, null, 2)
    return `export const ${convertIdToModuleName(icon.id)} = ${data}`
  }).join('\r\n')
  writeFile(opts.dir, filename, contents)
}

module.exports = function generateFile(opts: FileOptions): void {
  try {
    switch (opts.type) {
      case 'json':
        generateJsonFile(opts)
        break
      case 'module':
        generateExportDefaultFile(opts)
        break
      case 'named':
        generateExportNamedFile(opts)
        break
    }
  }
  catch (e) {
    console.error(e)
  }
}
