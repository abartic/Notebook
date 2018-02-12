module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        copy: {
            build: {
                files: [{
                        expand: true,
                        cwd: "./public",
                        src: ["**"],
                        dest: "./dist/public"
                    },

                    {
                        expand: true,
                        cwd: "./server/json",
                        src: ["*.json"],
                        dest: "./dist/middletier/json"
                    }
                ],

            }
        },
        ts: {
            app: {
                files: [{
                    src: ["server/\*\*/\*.ts", "!server/.baseDir.ts"],
                    dest: "./dist/middletier"
                }],
                options: {
                    sourceMap: true,
                    rootDir: "server",
                    module: "commonjs",
                    target: "ES6",
                    allowJs: true
                }
            }
        },
        watch: {
            ts: {
                files: ["server/\*\*/\*.ts"],
                tasks: ["ts"]
            },

            // ,
            // views: {
            //     files: ["views/**/*.html"],
            //     tasks: ["copy"]
            // }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-ts");

    grunt.registerTask("mbuild", [
        "copy",
        "ts"

    ]);

};