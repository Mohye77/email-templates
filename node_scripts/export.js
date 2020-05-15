const glob = require("glob");
const fs = require("fs");
const path = require('path');

const mjml = require("mjml");
const clc = require('cli-color');

const pattern = "*.mjml";
var exportDir = "export";

const argv = process.argv.slice(2);

if (argv && argv.length > 0) {
    argv.forEach((argument) => {
        if (argument.indexOf('exportDir') > -1) {
            exportDir = argument.split(':')[1];
        }
    });
}

console.log(clc.yellow(`Exporting html to ${exportDir}...`));

glob(pattern, { mark: true, sync: false }, function (er, matches) {
    if (!!matches && matches.length > 0) {
        matches.forEach((match) => {
            console.log(clc.white(`Opening ${match}...`));
            const mjmlContent = fs.readFileSync(match, 'utf8');
            const htmlContent = mjml(mjmlContent, {
                beautify: true,
                minify: true,
                keepComments: false,
                minifyOptions:
                {
                    minifyCSS: true,
                    removeEmptyAttributes: true,
                    collapseWhitespace: true
                }
            });

            if (!!htmlContent.errors && htmlContent.errors.length > 0) {
                return console.error(clc.red(htmlContent.errors));
            }

            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir);
            }

            fs.writeFile(`${exportDir}/${path.basename(match)}.html`, htmlContent.html, function (err) {
                if (err) {
                    return console.error(`- ${match} : ${clc.red('err!')}`);
                }
                console.log(`- ${match} : ${clc.green('done!')}`);
            });
        });
    }
});