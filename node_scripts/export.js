const glob = require("glob");
const fs = require("fs");
const path = require('path');

const mjml = require("mjml");
const clc = require('cli-color');

const sourceDir = "templates";
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

glob(`${sourceDir}/*.mjml`, { mark: true, sync: false }, function (globError, matches) {
    if (!!matches && matches.length > 0) {
        matches.forEach(match => {
            console.log(clc.white(`Opening ${match}...`));

            const fileName = `${path.basename(match).split('.')[0]}`;

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
                htmlContent.errors.forEach(error => {
                    console.error(clc.red(`${error.formattedMessage}`));
                });
                return;
            }

            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir);
            }

            fs.writeFile(`${exportDir}/${fileName}.html`, htmlContent.html, err => {
                if (err) {
                    return console.error(`- ${match} : ${clc.red(err.message)}`);
                }
                console.log(`- ${match} : ${clc.green('done!')}`);
            });

            fs.copyFile(`${sourceDir}/${fileName}.txt`, `${exportDir}/${fileName}.txt`, err => {
                if (err) {
                    console.error(`- ${match} : ${clc.red(err.message)}`);
                }
            });
        });
    }
});