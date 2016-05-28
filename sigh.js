var glob, pipeline, babel, merge, write, mocha

module.exports = function(pipelines) {
  var babelOpts = {
    presets: ['es2015-loose', 'stage-1'],
    plugins: ['transform-es2015-modules-commonjs'],
  }

  pipelines['source:js'] = [
    glob({ basePath: 'src' }, '*.js'),
    babel(babelOpts),
    write('lib')
  ]

  pipelines['test:js'] = [
    glob({ basePath: 'src/test' }, '*.js'),
    babel(babelOpts),
    write('lib/test')
  ]

  pipelines.alias.build = ['test:js', 'source:js']

  pipelines['tests:run'] = [
    merge(
      { collectInitial: true },
      pipeline('source:js'),
      pipeline('test:js')
    ),
    pipeline({ activate: true }, 'mocha')
  ]

  pipelines.explicit.mocha = [ mocha({ files: 'lib/test/**/*.spec.js' }) ]
}
