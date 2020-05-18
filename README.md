# Introduction 
This repository contains all email templates.
They are written with [mjml](https://mjml.io). 
MJML is a markup language designed to reduce the pain of coding a responsive email. 

# Getting Started
IF you use VS Code, you can add this [plugin](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml) to generate html, have live-preview etc.

To initiate project, you must have node installed.

In the root folder run the command : 
`npm install`


# Build and Test
To run an export run the command: 
`npm run mjml-export exportDir:export`
To deploy templates on MailJet, run the command: 
`npm run mjml-deploy sourceDir:export publicKey:{publicKey} privateKey:{privateKey}`

# Template Usage
To use your templates you can use the generated ID or the internal name 
Example : 

`POST https://api.mailjet.com/v3/send`
`HEADERS : { 'Authorization': 'Basic Base64Encode(publickey:privatekey)}`
`BODY : {    "FromEmail": "noreply@cellenza.com",    "FromName": "Le blog Cellenza",    "Mj-TemplateID": "email-blog", "Subject": "Un nouvel article a été publié",    "Mj-TemplateLanguage": true,    "Recipients": [        {            "Email": "user@domain.com"        }    ]}`
