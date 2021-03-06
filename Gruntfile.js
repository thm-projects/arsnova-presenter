/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	require("time-grunt")(grunt);

	var
		/* The NPM package file is used for version info */
		pkg = require("./package.json"),

		/* The final output directory. */
		outdir = "build/",

		/* A temporary directory used by amdserialize to output the processed
		 * modules. */
		tmpdir = outdir + "tmp/",

		/* Client library dir */
		depdir = "bower_components/",

		versionFilePath = tmpdir + "version/",

		/* Files matching the following patterns will be checked by JSHint and JSCS
		 */
		lintJs = [
			"*.js",
			"src/**/*.js",
			"tests/**/*.js"
		]
	;

	grunt.initConfig({
		dojo: {
			options: {
				dojo: tmpdir + "builddeps/dojo/dojo.js",
				package: ".",
				releaseDir: tmpdir
			},
			prod: {
				options: {
					profile: "build.prod.profile.js"
				}
			},
			dev: {
				options: {
					profile: "build.dev.profile.js"
				}
			}
		},

		clean: {
			build: [outdir],
			tmp: [tmpdir]
		},

		copy: {
			dojoreport: {
				expand: true,
				cwd: tmpdir,
				src: "build-report.txt",
				dest: outdir
			},
			resources: {
				expand: true,
				cwd: tmpdir + "arsnova-presenter",
				src: ["resources/images/**"],
				dest: outdir
			},
			builtnls: {
				expand: true,
				cwd: tmpdir + "arsnova-presenter",
				src: ["nls/**"],
				dest: outdir
			}
		},

		symlink: {
			dojo: {
				files: [
					{
						src: depdir + "dojo",
						dest: tmpdir + "builddeps/dojo"
					},
					{
						src: "node_modules/dojo-util",
						dest: tmpdir + "builddeps/util"
					}
				]
			},
			lib: {
				expand: true,
				cwd: depdir + "MathJax",
				src: ["MathJax.js", "config/Safe.js", "config/TeX-AMS_HTML.js", "extensions", "fonts/HTML-CSS/TeX/*", "!fonts/HTML-CSS/TeX/png", "images", "jax/element", "jax/input/TeX", "jax/output/HTML-CSS", "jax/output/NativeMML", "jax/output/SVG/*", "!jax/output/SVG/fonts", "jax/output/SVG/fonts/TeX", "localization/de", "localization/en"],
				dest: outdir + "lib/mathjax"
			},
			prodlib: {
				files: [{
					src: depdir + "dojo/resources",
					dest: outdir + "lib/dojo/resources"
				}, {
					expand: true,
					cwd: depdir,
					src: "dijit/themes/claro/**/*.png",
					dest: outdir + "lib"
				}]
			},
			devlib: {
				files: [{
					expand: true,
					cwd: depdir,
					src: ["*", "!MathJax", "!qrcode-generator", "!socket.io-client"],
					dest: outdir + "lib"
				}, {
					src: "src",
					dest: outdir + "lib/arsnova-presenter"
				}]
			},
			page: {
				expand: true,
				cwd: "src",
				src: ["index.html", "resources/images"],
				dest: tmpdir + "arsnova-presenter"
			}
		},

		/* Config to allow uglify to generate the layer. */
		uglify: {
			options: {
				/* jshint ignore: start */
				compress: {
					drop_console: true
				},
				/* jshint ignore: end */
				sourceMap: true,
				sourceMapIncludeSources: true
			},
			dojo: {
				src: [tmpdir + "arsnova-presenter/config.js", tmpdir + "arsnova-presenter/presenter.js", tmpdir + "arsnova-presenter/bootstrap.js"],
				dest: outdir + "presenter.js"
			},
			lib: {
				files: [{
					src: depdir + "socket.io-client/socket.io.js",
					dest: outdir + "lib/socket.io-client/socket.io.js"
				}, {
					src: depdir + "qrcode-generator/js/qrcode.js",
					dest: outdir + "lib/qrcode-generator/qrcode.js"
				}]
			}
		},

		less: {
			dist: {
				options: {
					cleancss: true
				},
				src: "src/less/loader.less",
				dest: tmpdir + "arsnova-presenter/resources/css/loader.css"
			},
			dijittheme: {
				options: {
					rootpath: "../../lib/dijit/themes/claro/"
				},
				src: [depdir + "dijit/themes/claro/{Common,Dialog,Menu}.less"],
				dest: tmpdir + "arsnova-presenter/resources/css/claro.css"
			},
			dijitthemeform: {
				options: {
					rootpath: "../../lib/dijit/themes/claro/form/"
				},
				src: [depdir + "dijit/themes/claro/form/{Common,Button,Checkbox,RadioButton,Select}.less"],
				dest: tmpdir + "arsnova-presenter/resources/css/claro-form.css"
			},
			dijitthemelayout: {
				options: {
					rootpath: "../../lib/dijit/themes/claro/layout/"
				},
				src: [depdir + "dijit/themes/claro/layout/{TabContainer,ContentPane,BorderContainer}.less"],
				dest: tmpdir + "arsnova-presenter/resources/css/claro-layout.css"
			}
		},

		cssmin: {
			dist: {
				src: [depdir + "dijit/themes/dijit.css", tmpdir + "arsnova-presenter/resources/css/{claro,claro-form,claro-layout,presenter}.css"],
				dest: outdir + "resources/css/presenter.css"
			}
		},

		inline: {
			options: {
				inlineTagAttributes: "data-inline"
			},
			dist: {
				src: tmpdir + "arsnova-presenter/index.html",
				dest: outdir + "index.html"
			}
		},

		jshint: {
			src: lintJs,
			options: {
				jshintrc: ".jshintrc"
			}
		},

		jscs: {
			src: lintJs,
			options: {
				config: ".jscs.json"
			}
		},

		shell: {
			bowerdeps: {
				command: [
					"bower install",
					"bower update"
				].join(";")
			}
		},

		war: {
			dist: {
				/* jshint ignore: start */
				options: {
					war_dist_folder: outdir,
					war_name: "arsnova-presenter",
					webxml_display_name: "ARSnova Presenter"
				},
				/* jshint ignore: end */
				expand: true,
				cwd: outdir,
				src: ["**", "!**/*.map", "!build-report.txt", "!tmp/**"],
				dest: outdir
			}
		},

		connect: {
			server: {
				options: {
					base: outdir,
					hostname: "localhost",
					port: 8081,
					useAvailablePort: true,
					open: true,
					middleware: function (connect, options) {
						var proxy = require("grunt-connect-proxy/lib/utils").proxyRequest;

						return [
							["/", function (req, res, next) {
								if ("/" === req.url) {
									res.writeHead(301, {Location: "/presenter"});
									res.end();
								} else {
									/* Let the proxy middleware handle this request */
									next();
								}
							}],
							/* Serve static files */
							["/presenter", connect.static(options.base[0])],
							/* Proxy for backend API */
							proxy
						];
					}
				},
				proxies: [
					{
						context: ["/", "/api", "/arsnova-config"],
						host: "localhost",
						port: 8080,
						xforward: true
					}
				]
			}
		},

		watch: {
			buildConfig: {
				files: ["Gruntfile.js", "bower.json", "build.dev.profile.js"],
				tasks: ["clean", "build:dojo:dev"]
			},
			js: {
				files: [lintJs, ".jshintrc", ".jscs.json", "!*.js"],
				tasks: ["newer:jshint", "newer:jscs"]
			},
			less: {
				files: ["src/less/*"],
				tasks: ["less", "cssmin", "inline"]
			}
		}
	});

	grunt.registerTask("build", function (target, env) {
		if (!target) {
			target = "dojo";
		}
		if (-1 === ["prod", "dev"].indexOf(env)) {
			env = "prod";
		}

		var taskList;
		switch (target) {
		case "dojo":
			taskList = ["symlink:dojo", "dojo:" + env, "uglify:dojo", "copy:dojoreport", "copy:resources"];
			if ("dev" === env) {
				taskList.push("symlink:devlib");
			} else {
				taskList.push("symlink:prodlib", "copy:builtnls");
			}

			break;
		default:
			grunt.log.writeln("Please use one of the following tasks to build ARSnova Presenter:");
			grunt.log.writeln("* build:dojo         This build includes the Dojo loader [default]");

			return;
		}
		grunt.task.run(["newer:jshint", "newer:jscs", "shell:bowerdeps", "genversionfile", "uglify:lib", "symlink:lib"]);
		grunt.task.run(taskList);
		grunt.task.run("less", "cssmin", "inline");
	});

	grunt.registerTask("genversionfile", function () {
		var
			done = this.async(),
			generate = function (dirty) {
				grunt.util.spawn({
					cmd: "git",
					args: ["log", "-n", "1", "--pretty=format:%h"]
				}, function (error, result, code) {
					var version = {
						version: pkg.version,
						commitId: result.stdout,
						dirty: dirty,
						buildTime: (new Date()).toISOString(),
						buildNumber: 0
					};
					grunt.file.write(versionFilePath + "version.js", "define(" + JSON.stringify(version) + ");\n");
					done(true);
				});
			}
		;
		grunt.util.spawn({
			cmd: "git",
			args: ["status", "--porcelain"]
		}, function (error, result, code) {
			var dirty = false;
			result.stdout.split("\n").forEach(function (line) {
				if (!/^$|^\?\?/.test(line)) {
					dirty = true;

					return;
				}
			});
			generate(dirty);
		});
	});

	grunt.loadNpmTasks("grunt-connect-proxy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-symlink");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-dojo");
	grunt.loadNpmTasks("grunt-inline");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-shell");
	grunt.loadNpmTasks("grunt-war");

	grunt.registerTask("default", [
		"clean",
		"build",
		"clean:tmp"
	]);
	grunt.registerTask("package", [
		"default",
		"war"
	]);
	grunt.registerTask("run", [
		"clean",
		"build:dojo:dev",
		"configureProxies:server",
		"connect",
		"watch",
		"clean:tmp"
	]);
};
