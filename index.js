#!/usr/bin/env node

var program = require('commander');
var async = require('async');
var fs = require("fs");

program
      .usage('[options] file1 file2 [file3 ...]')
      .description("Concatenate two asciinema casts.\n  Metadata for result will be taken from first file.")
      .option('-o, --output <path>', 'write to path instead of stdout')
      .option('-k, --keepLast', 'Dont remove last line of each cast.')
.parse(process.argv);


if (program.args.length < 2) {
    console.log("Give two or more files to concatenate\n")
    console.log(program.help());
    process.exit(1);
} else {
    var calls = [];

    /* Closure for file path to be read */
    var readClosure = function(path) {
        return function (callback) {
            fs.readFile(path, (err, data) => {
                if (err)
                    return callback(err);

                try {
                    data = JSON.parse(data);
                } catch (err) {
                    err.file = path;
                    return callback(err);
                };

                return callback(null, data);
            });
        }
    };

    /* Generate calls for async.parallel */
    for (var i = 0; i < program.args.length; ++i) {
        calls.push(readClosure(program.args[i]));
    }

    /* Parse files */
    async.parallel(calls, function(err, casts) {
        /* Handle reading and parsing errors */
        if (err) {
            if (err.code == "ENOENT") {
                console.log("Error: File " + err.path + " does not exist.");
            } else if (err instanceof SyntaxError) {
                console.log("Syntax error parsing " + err.file + ":");
                console.log(err.message);
                process.exit(1);
            } else {
                console.log(err.message);
            }
            process.exit(1);
        }

        /* All files read and parsed, create result */
        result = casts[0];

        var totalDuration = casts[0].duration;
        var streams = ['stdout', 'stderr'];

        for (var c = 1; c < casts.length; ++c) {
            var cast = casts[c];
            totalDuration = totalDuration + cast.duration;
            for (var s = 0; s < streams.length; ++s) {
                var stream = streams[s];
                if (typeof cast[stream] !== "undefined") {
                    if (!program.keepLast) {
                        result[stream].splice(-1,1)
                    }
                    for (var i = 0; i < cast[stream].length; ++i) {
                        var key = cast[stream][i];
                        result[stream].push(key);
                    }
                }
            }
        }
        result.duration = totalDuration;

        /* Remove very last line of all streams */
        if (!program.keepLast) {
            for (var s = 0; s < streams.length; ++s) {
                var stream = streams[s];
                if (typeof result[stream] !== "undefined") {
                    result[stream].splice(-1, 1)
                }
            }
        }

        /* Output result */
        var json = JSON.stringify(result, null, 4);
        if (typeof program.output === "undefined")
            console.log(json);
        else {
            fs.writeFileSync(program.output, json);
        }

        // Victory!
        process.exit(0);
    });
}
