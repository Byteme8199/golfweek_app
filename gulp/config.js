var dest = "./build";
var src = './src';

module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + "/**",
      // Exclude Map files
      "!" + dest + "/**.map"
    ]
  },
  less: {
    // just include top level file which has
    // pointers to other files (I think)
    src: src + "/styles/**/*.less",
    dest: dest + '/styles',
    settings: {
      // paths to search for @import directives
      paths: [src + '/less']

    }
  },
  images: {
    src: src + "/img/**",
    dest: dest + "/img"
  },
  markup: {
    // setup jade functions here
    index: {
      src: src + "/index.jade",
      dest: dest
    },
    views: {
      src: src + "/views/*.jade",
      dest: dest + '/views'
    },
    settings: {
      // change this to false for minification
      pretty: true
    }
  },
  browserify: {
    // Enable source maps
    debug: true,
    // Additional file extentions to make optional
    extensions: ['.js'],
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: './src/scripts/app.js',
      dest: dest + '/scripts',
      outputName: 'app.js'
    }]
  }
};