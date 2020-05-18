const glob = require("glob");
const fs = require("fs");
const path = require('path');

const clc = require('cli-color');
const axios = require('axios').default;

const templatesData = require('../templates-data.js');
const constants = require('../const.js');

var sourceDir = "export";
var publicKey = undefined;
var privateKey = "";

const argv = process.argv.slice(2);

if (argv && argv.length > 0) {
    argv.forEach((argument) => {
        if (argument.indexOf('sourceDir') > -1) {
            sourceDir = argument.split(':')[1];
            return;
        }

        if (argument.indexOf('publicKey') > -1) {
            publicKey = argument.split(':')[1];
            return;
        }

        if (argument.indexOf('privateKey') > -1) {
            privateKey = argument.split(':')[1];
            return;
        }
    });
}

if (!publicKey) {
    return console.error(clc.red('Missing MailJet PublicKey'));
}
if (!privateKey) {
    return console.error(clc.red('Missing MailJet PrivateKey'));
}

var authorizationHeader = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');

const axiosInstance = axios.create({
    baseURL: 'https://api.mailjet.com/v3/REST',
    timeout: 3000,
    headers: { 'authorization': `Basic ${authorizationHeader}` }
});

deleteTemplates().then(() => { pushTemplates() });

function deleteTemplates() {
    return axiosInstance.get('/template')
        .then(response => {
            if (!!response && !!response.data.Data && response.data.Data.length > 0) {
                const templates = response.data.Data.filter(template => template.Author === constants.author && template.OwnerType === "apikey");
                if (templates.length > 0) {
                    var deletePromises = [];
                    templates.forEach(template => {
                        console.log(clc.green(`Deleting ${template.ID} - ${template.Name}...`));
                        deletePromises.push(deleteTemplate(template.ID));
                    });
                    return Promise.all(deletePromises);
                }
            }
        })
        .catch(errorTemplates => {
            console.error(clc.red('Error when getting templates :'));
            console.log(clc.red(errorTemplates));
        });
}

function deleteTemplate(templateID) {
    return axiosInstance.delete(`/template/${templateID}`)
        .then(deleteResponse => {
            console.log(clc.green(`${templateID} : Done!`));
        })
        .catch(deleteError => {
            console.error(clc.red('Error when deleting template :'));
            console.log(clc.red(deleteError));
        });
}

function pushTemplates() {
    glob(`${sourceDir}/*.html`, { mark: true, sync: false }, function (er, matches) {
        if (!!matches && matches.length > 0) {
            matches.forEach((match) => {
                console.log(clc.white(`Deploying ${match}...`));

                const fileName = `${path.basename(match).split('.')[0]}`;
                const htmlContent = fs.readFileSync(match, 'utf8');
                const textContent = fs.readFileSync(`${sourceDir}/${fileName}.txt`, 'utf8');

                var createTemplate = {
                    "Name": fileName,
                    "Author": constants.author,
                    "IsTextPartGenerationEnabled": true,
                    "Purposes": ["transactional"]
                };

                axiosInstance.post('/template', createTemplate)
                    .then(responseTemplate => {
                        var createTemplateDetailContent = {
                            "Headers": {
                                "From": constants.from,
                                "Subject": templatesData[fileName].subject
                            },
                            "Html-part": htmlContent,
                            "Text-Part": textContent
                        };

                        axiosInstance.post(`/template/apikey|${fileName}/detailcontent`, createTemplateDetailContent)
                            .then(responseDetailContent => {
                                console.log(clc.green(` - ${fileName} : Deployed!`));
                            })
                            .catch(errorDetailContent => {
                                console.error(clc.red('Error when pushing detail content :'));
                                console.error(clc.red(errorDetailContent));
                            });
                    })
                    .catch(errorTemplate => {
                        console.error(clc.red('Error when pushing template :'));
                        console.error(clc.red(errorTemplate));
                    });
            });
        }
    });
}