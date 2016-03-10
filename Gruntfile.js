/**
 * Created by Michad on 10/27/2014.
 */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        app_files: {
            dirs: {
                base: '',
                app: 'app',
                common: 'common',
                assets: 'assets',
                styles: 'styles'
            },
            js: [ 'app/**/*.js', '!app/**/*.spec.js', '!app/js/libs/**' ],
            jsunit: [ 'app/**/*.spec.js' ],
            html: [ 'index.html' ],
            less: {
                main: 'app/styles/main.less',
                all: 'app/**/*.less'
            },
            assets: 'app/assets/**'
        },
        concat: {
            jsdist: {
                src: ['app/js/viewer-l10n.js',
                    'app/js/util/startup.js',
                    'app/js/util/templateManager.js',
                    'app/js/util/templateManager.js',
                    'app/js/util/domUtility.js',
                    'app/js/util/delayedTask.js',
                    'app/js/store/store.js',
                    'app/js/store/arrayStore.js',
                    'app/js/store/viewerStore.js',
                    'app/js/controller/downloader.js',
                    'app/js/controller/mainController.js',
                    'app/js/controller/zoomController.js',
                    'app/js/controller/searchController.js',
                    'app/js/views/textLayer.js',
                    'app/js/views/userActionElements.js',
                    'app/js/views/defaultToolbar.js',
                    'app/js/views/pageView.js',
                    'app/js/viewer.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            cssdist: {
                src: [
                    'app/styles/*'
                ],
                dest: 'dist/<%= pkg.name %>.css'
            },
            jsworkerdist: {
                src: [
                    'app/js/download/downloader.js'
                ],
                dest: 'dist/downloader.js'
            }
        },
        watch: {
          files: ['<%= concat.jsdist.src %>'],
          tasks: ['jshint', 'concat']
        },        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        build: {
            src: 'src/<%= pkg.name %>.js',
            dest: 'build/<%= pkg.name %>.min.js'
        },
        bower: {
            install: {
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
                options: {
                    targetDir: 'app/js/libs/bower'
                }
            }
        },
        wiredep: {
            task: {
                src: [
                    'index.html'
                ],
                options: {
                }
            }
        },

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `src/`.
         */
        jshint: {
            src: [
                '<%= app_files.js %>'
            ],
            test: [
                '<%= app_files.jsunit %>'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                node: true,
                laxbreak: true
            },
            globals: {}
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        connect: {
            server: {
              options: {
                hostname: 'localhost',
                port: 9001,
                base: 'test/samples'
              }
            }
          }       

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('e2e-test', ['connect:server', 'karma:unit']);

    // Default task(s).
    grunt.registerTask('default', ['jshint','concat','uglify', 'wiredep']);
};


