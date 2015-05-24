import util from 'util'

var color = '\x1b[35m'
var clear = '\x1b[0m'

var log = (format, ...args) => {
  console.log(` ${color}*${clear} ${format}`, ...args)
}

log.nested = (format, ...args) => {
  console.log(`   ${color}-${clear} ${format}`, ...args)
}

log.warn = (format, ...args) => {
  console.warn(` ${color}!${clear} ${format}`, ...args)
}

log.important = (format, ...args) => {
  var text = util.format(format, ...args)
  var lines = ''
  for (var i = 0; i < text.length + 7; ++i)
    lines += '*'

  console.log(` ${color}*${lines}`)
  console.log(` ${color}***${clear} ${text} ${color}***`)
  console.log(` ${color}*${lines}`)
}

export default log
