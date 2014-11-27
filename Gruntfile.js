// Gruntfile for VexTab.
// Mohit Muthanna Cheppudira <mohit@muthanna.com>

module.exports = function(grunt) {
  var L = grunt.log.writeln;
  var BANNER = '/**\n' +
                ' * VexTab <%= pkg.version %> built on <%= grunt.template.today("yyyy-mm-dd") %>.\n' +
                ' * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n' +
                ' *\n' +
                ' * http://www.vexflow.com  http://github.com/0xfe/vextab\n' +
                ' */\n';

  var BUILD_DIR = 'build',
      DOC_DIR = "doc",
      RELEASE_DIR = 'releases',
      TARGET_RAW = BUILD_DIR + '/vextab-debug.js',
      TARGET_MIN = BUILD_DIR + '/vextab-min.js';

  var VEXTAB_SRC = ["src/main.coffee"],
      VEXTAB_OUT = BUILD_DIR + "/vextab-lib.js",

      JISON_SRC = ["src/vextab.jison"],
      JISON_OUT = BUILD_DIR + "/vextab-jison.js",

      TABDIV_SRC = ["src/tabdiv.js"],
      TABDIV_OUT = "build/vextab-div.js",

      BUILD_SOURCES = [JISON_OUT, VEXTAB_OUT, TABDIV_SRC],

      TEST_SRC = ["tests/vextab_tests.coffee"],
      TEST_OUT = BUILD_DIR + "/vextab-tests.js",

      PLAYER_SOURCES = ["src/player.coffee"],
      PLAYER_OUT = BUILD_DIR + "/vextab-player.js",

      CSS = ["vextab.css"];

  var RELEASE_TARGETS = ["vextab-lib.js", "vextab-div.js", "vextab-div.js.map"];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      lib: {
        options: {
          transform: ['coffeeify'],
          browserifyOptions: {
            debug: true,
            standalone: "Vex.Flow"
          }
        },
        files: [
          { src: VEXTAB_SRC, dest: VEXTAB_OUT }
        ]
      },
      tests: {
        options: {
          transform: ['coffeeify'],
          browserifyOptions: {
            debug: true,
            standalone: "VexTabTests"
          }
        },
        files: [
          { src: TEST_SRC, dest: TEST_OUT }
        ]
      },
      tabdiv: {
        options: {
          transform: ['coffeeify'],
          browserifyOptions: {
            debug: true,
            standalone: "Vex.Flow"
          }
        },
        files: [
          { src: TABDIV_SRC, dest: TABDIV_OUT }
        ]
      }
    },
    coffeelint: {
      files: ['src/*.coffee'],
      options: {
        no_trailing_whitespace: { level: 'error' },
        max_line_length: { level: 'ignore' }
      }
    },
    coffee: {
      compile: {
        files: [
          { src: PLAYER_SOURCES, dest: PLAYER_OUT }
        ]
      }
    },
    jison: {
      compile: {
        options: { moduleType: "commonjs" },
        files: [{src: JISON_SRC, dest: JISON_OUT}]
      }
    },
    concat: {
      options: {
        banner: BANNER
      },
      build: {
        src: BUILD_SOURCES,
        dest: TARGET_RAW
      }
    },
    uglify: {
      options: {
        banner: BANNER,
        sourceMap: true
      },
      build: {
        src: TARGET_RAW,
        dest: TARGET_MIN
      }
    },
    qunit: {
      files: ['tests/runtest.html']
    },
    watch: {
      scripts: {
        files: TABDIV_SRC + JISON_SRC,
        tasks: ['default'],
        options: {
          interrupt: true
        }
      }
    },
    copy: {
      release: {
        files: [
          {
            expand: true,
            dest: RELEASE_DIR,
            cwd: BUILD_DIR,
            src: RELEASE_TARGETS
          }
        ]
      },
      css: {
        files: [
          {
            expand: true,
            dest: RELEASE_DIR,
            cwd: DOC_DIR,
            src: CSS
          }
        ]
      }
    },
    gitcommit: {
      releases: {
        options: {
          message: "Committing release binaries for new version: <%= pkg.version %>",
          verbose: true
        },
        files: [
          {
            src: [RELEASE_DIR + "/*.js", RELEASE_DIR + "/*.map", RELEASE_DIR + "/*.css"],
            expand: true
          }
        ]
      }
    },
    bump: {
      options: {
        files: ['package.json'], // Add component.json here
        commitFiles: ['package.json'], // Add component.json here
        updateConfigs: ['pkg'],
        createTag: false,
        push: false
      }
    },
    release: {
      options: {
        bump: false,
        commit: false
      }
    },
    clean: [BUILD_DIR, RELEASE_DIR],
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-jison');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['coffeelint', 'coffee', 'jison', 'concat', 'uglify']);

  grunt.registerTask('build', 'Build library.', function() {
    grunt.task.run('jison');
    grunt.task.run('browserify:lib');
    grunt.task.run('browserify:tabdiv');
  });

  grunt.registerTask('test', 'Run qunit tests.', function() {
    grunt.task.run('browserify:tests');
    grunt.task.run('qunit');
  });

  // Release current build.
  grunt.registerTask('stage', 'Stage current binaries to releases/.', function() {
    grunt.task.run('default');
    grunt.task.run('copy:css');
    grunt.task.run('copy:release');
  });

  // Increment package version and publish to NPM.
  grunt.registerTask('publish', 'Publish VexTab NPM.', function() {
    grunt.task.run('bump');
    grunt.task.run('stage');
    grunt.task.run('test');
    grunt.task.run('gitcommit:releases');
    grunt.task.run('release');
  });
};
