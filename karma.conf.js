module.exports = function (config) {
  config.set({
    basePath: '.',
    browsers: ['PhantomJS'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.spec.js'
    ],
    port: 8080,
    captureTimeout: 100000,
    frameworks: ['mocha', 'should'],
    client: {
      mocha: {
      }
    },
    singleRun: true,
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      'test/**/*.spec.js': ['webpack'],
      'app/**/*.js': ['webpack', 'coverage']
    },
    webpack: {
      resolve: {
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['node_modules', 'app', 'static', 'test']
      },
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          },
          {
            test: /\.scss/,
            loaders: ['style-loader', 'css-loader', 'sass-loader'],
            exclude: '/node_modules/'
          },
          {
            test: /\.(png|gif|jpe?g|svg)$/i,
            loader: 'file-loader?name=static/images/[name].[ext]',
            exclude: '/node_modules/'
          },
          {
            test: /\.json$/,
            loaders: ['json-loader']
          }
        ],
        postLoaders: [{
          test: /\.(js|jsx)$/, exclude: /(node_modules|test|app\/socket)/,
          loader: 'isparta'
        }]
      }
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'text', subdir: 'report-text' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    }
  });
};
