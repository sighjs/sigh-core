import { readFileSync } from 'fs'
import { join as pathJoin } from 'path'
import { apply as sourceMapApply, generateIdentitySourceMap } from './sourceMap'
import _ from 'lodash'

var sourceMapRegex = /^\/[\/*]# sourceMappingURL=.*(\*\/)?/

/**
 * Event passed through pipeline (which can be modified, concatenated, witheld etc. by any
 * pipeline operation), containing the following parameters:
 *   type: add/remove/change: Represents how the file has changed since it was last seen, the first event will always be an array containing an "add" of all files in the project.
 *   sourceData: data of first source-producing operation.
 *   sourcePath: path of first file producing operation.
 *   sourceMap: Represents the source map from the output of the latest transformation to the original source.
 *   data: current data in event (possibly transformed one or more times).
 *   createTime: Date resource was created by initial operation.
 */
export default class {
  constructor(fields) {
    this.type = fields.type
    this.initPhase = fields.initPhase
    this.sourcePath = this.path = fields.path

    this.opTreeIndex = fields.opTreeIndex
    this._basePath = fields.basePath

    // setting the data here can also add a source map
    if (this.type === 'remove')
      return

    this.createTime = fields.createTime

    this.data = fields.data !== undefined ? fields.data : readFileSync(this.path).toString()
    this.sourceData = this.data

    if (fields.sourceMap)
      this.applySourceMap(fields.sourceMap)
  }

  // does this need to be a property?
  get projectPath() {
    if (! this._basePath)
      return this.path

    return this.path.indexOf(this._basePath) === 0 ?
      this.path.substr(this._basePath.length + 1) : this.path
  }

  set projectPath(value) {
    this.path = this._basePath ? pathJoin(this._basePath, value) : value
  }

  get basePath() { return this._basePath }

  set basePath(value) {
    var { projectPath } = this
    this._basePath = value
    this.path = pathJoin(value, projectPath)
  }

  // Set data stripping off source map comment if it exists.
  set data(value) {
    // TODO: consider applying source map (parsed via URI/file load)?
    // TODO: skip back another if empty line?
    var lastLineIdx = value.lastIndexOf('\n')
    if (lastLineIdx !== -1) {
      var lastLine = value.substr(lastLineIdx + 1)
      if (sourceMapRegex.test(lastLine))
        value = value.substr(0, lastLineIdx)
    }

    this._data = value
  }

  get data() { return this._data }

  /**
   * @return {Number} The number of lines in the data
   */
  get lineCount() {
    // TODO: be more efficient
    return this.data.split('\n').length
  }

  get fileType() {
    return this.path.substring(this.path.lastIndexOf('.') + 1)
  }

  changeFileSuffix(targetSuffix) {
    this.path = this.path.substring(0, this.path.lastIndexOf('.')) + '.' + targetSuffix
  }

  get sourceMap() {
    if (! this._sourceMap) {
      this._sourceMap = generateIdentitySourceMap(this.fileType, this.sourcePath, this.data)

      if (this._sourceMap) {
        this._hasIdentitySourceMap = true
        this._sourceMap.sourcesContent = [ this.sourceData ]
      }
    }

    return this._sourceMap
  }

  /**
   * Overwrites source map without application, only use when you know this is
   * done externally.
   */
  set sourceMap(content) {
    if (this._hasIdentitySourceMap)
      delete this._hasIdentitySourceMap

    // TODO: ensure .file === this.path
    this._sourceMap = content
  }

  applySourceMap(sourceMap) {
    if (this._hasIdentitySourceMap) {
      this._sourceMap = null
      delete this._hasIdentitySourceMap
    }

    var { _sourceMap } = this
    if (! _sourceMap)
      this._sourceMap = _.cloneDeep(sourceMap)
    else
      this._sourceMap = sourceMapApply(_sourceMap, sourceMap)

    if (! this._sourceMap.sources)
      this._sourceMap.sources = [this.sourcePath]
  }

  get supportsSourceMap() {
    var { fileType } = this
    return fileType === 'js' || fileType === 'css'
  }
}
