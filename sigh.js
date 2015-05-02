var glob, pipeline, babel, debounce, write, mocha

module.exports = function(pipelines) {
  pipelines['source:js'] = [
    glob({ basePath: 'src' }, '*.js'),
    babel({ modules: 'common' }),
    write('lib')
  ]

  pipelines['test:js'] = [
    glob({ basePath: 'src/test' }, '*.js'),
    babel({ modules: 'common' }),
    write('lib/test')
  ]

  pipelines.alias.build = ['test:js', 'source:js']

  pipelines['tests:run'] = [
    pipeline('source:js', 'test:js'),
    debounce(700),
    pipeline({ activate: true }, 'mocha')
  ]

  pipelines.explicit.mocha = [ mocha({ files: 'lib/test/**/*.spec.js' }) ]
}
