import util from 'util'

var clear = '\x1b[0m'

var log = (format, ...args) => {
  console.log(` ${log.color}*${clear} ${format}`, ...args)
}

log.nested = (format, ...args) => {
  console.log(`   ${log.color}-${clear} ${format}`, ...args)
}

log.warn = (format, ...args) => {
  console.warn(` ${log.color}!${clear} ${format}`, ...args)
}

log.important = (format, ...args) => {
  var text = util.format(format, ...args)
  var lines = ''
  for (var i = 0; i < text.length + 7; ++i)
    lines += '*'

  console.log(` ${log.color}*${lines}`)
  console.log(` ${log.color}***${clear} ${text} ${log.color}***`)
  console.log(` ${log.color}*${lines}`)
}

log.color = '\x1b[35m'
export default log
