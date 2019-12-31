---
layout: post
title: How to Deploy LWC OSS to Github Pages or any Website
date: '2019-12-27T22:25:00.000-07:00'
categories: [ LWC, Lightning Web Components ]
permalink: /deploy-lwc-oss-to-github-pages.html
description: Deploy Lightning Web Components Open Source (LWC OSS) to Github Pages. Step-by-step demonstration to deploy LWC OSS to Github pages with or without npm in Local machine.
image: assets/images/lwc-oss/lwc-oss.png
toc: true
beforetoc: "Deploy Lightning Web Components Open Source (LWC OSS) to Github Pages. Step-by-step demonstration to deploy LWC OSS to Github pages with or without npm in Local machine."
author: kishore
tags:
- LWC
- create-lwc-app
- my-app
---

Hi Guys, I have done a lot of research and came up with an efficient solution for deploying open-source Lightning Web Components to Github Pages or any website/server of your choice. This tutorial directly refers to deploying LWC open source to Github Pages, but deploying to other sources is almost same as this. I suggest you follow this as I have gone through all the trouble and you don't have to go through all that trouble I have gone through. In this tutorial, I will walk you through deploying LWC OSS to Github Pages.

<div>
<script src="https://server.makestories.io/embedStory?storyId=-LxCK5-CmREi5oPhCJD9"></script>
</div>


## Prerequisites
-   [GitHub](https://github.com/join)  Account.
-   Install  [Git](https://git-scm.com/)  in your machine and  [Set up Git](https://help.github.com/en/articles/set-up-git).

## Basic Requirements 
(Make sure you have Node.js and Npm installed in your machine or able to access online.)
1. Install [Node JS](https://nodejs.org/) in local system or access Node JS online [here](https://codesandbox.io/)
2. Install [npm](https://nodejs.org/) or [yarn](https://yarnpkg.com/) or access online [here](https://codesandbox.io/)

## Procedure
- First create a repository named  `my-app`  using  [`npx create-lwc-app my-app`](https://lwc.dev/)
- We need to install the [GitHub Pages](https://www.npmjs.com/package/gh-pages)  package as a dev-dependency.

```
create package.json
   create .eslintrc.json
   create .eslintignore
   create .prettierignore
   create .prettierrc
   create .gitignore
   create src/client/modules/jsconfig.json
   create jest.config.js
   create lwc-services.config.js
   create README.md
   create src/client/index.html
   create src/client/index.js
   create src/client/modules/my/app/app.css
   create src/client/modules/my/app/app.js
   create src/client/modules/my/app/app.html
   create src/client/modules/my/greeting/greeting.css
   create src/client/modules/my/greeting/greeting.js
   create src/client/modules/my/greeting/greeting.html
   create src/client/modules/my/app/__tests__/app.test.js
   create src/client/modules/my/greeting/__tests__/greeting.test.js
   create src/client/resources/lwc.png
   create src/client/resources/favicon.ico
   create src/server/index.js
   create scripts/express-dev.js
```

`cd my-app`  
`npm install gh-pages --save-dev`

- Add properties to  `package.json`  file.
The first property we need to add at the top level  `homepage`  second we will define this as a string and the value will be  `"http://{username}.github.io/{repo-name}"`  {username} is your GitHub username, and {repo-name} is the name of the GitHub repository you created it will look like this :

`"homepage": "http://kishorebandanadam.github.io/my-app"`

Second in the existing  `scripts`  property we to need to add  `predeploy`  and  `deploy`. 

`"scripts": {  
//...  
"predeploy": "npm run build",  
"deploy": "gh-pages -d dist"  
}`

**package.json**
```
{
    "name": "my-app",
    "description": "kishore test",
    "version": "0.0.0",
    "author": "kishoreBandanadam",
    "bugs": "https://github.com/kishoreBandanadam/my-app/issues",
    "dependencies": {
        "lwc-services": "^1.3.12"
    },
    "devDependencies": {
        "gh-pages": "^2.1.1",
        "husky": "^3.1.0",
        "lint-staged": "^9.5.0",
        "npm-run-all": "^4.1.5"
    },
    "engines": {
        "node": ">=10.0.0"
    },
    "homepage": "https://kishorebandanadam.github.io/my-app/.",
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged"
        }
    },
    "keywords": [
        "lwc"
    ],
    "license": "MIT",
    "lint-staged": {
        "**/*.{css,html,js,json,md,ts,yaml,yml}": [
            "prettier --write"
        ],
        "./src/**/*.js": [
            "eslint"
        ],
        "*": [
            "git add"
        ]
    },
    "nodemonConfig": {
        "watch": [
            "src/server/**/*.js",
            "scripts/express-dev.js"
        ],
        "ext": "js",
        "ignore": [
            "src/**/*.spec.js",
            "src/**/*.test.js"
        ],
        "exec": "node ./scripts/express-dev.js"
    },
    "repository": "kishoreBandanadam/my-app",
    "scripts": {
        "build": "lwc-services build -m production",
        "build:development": "lwc-services build",
        "lint": "eslint ./src/**/*.js",
        "prettier": "prettier --write '**/*.{css,html,js,json,md,ts,yaml,yml}'",
        "prettier:verify": "prettier --list-different '**/*.{css,html,js,json,md,ts,yaml,yml}'",
        "serve": "lwc-services serve",
        "test:unit": "lwc-services test:unit",
        "test:unit:coverage": "lwc-services test:unit --coverage",
        "test:unit:debug": "lwc-services test:unit --debug",
        "test:unit:watch": "lwc-services test:unit --watch",
        "watch": "run-p watch:client watch:server",
        "watch:client": "lwc-services watch",
        "watch:server": "nodemon",
        "predeploy": "npm run build",
        "deploy": "gh-pages -d dist"
    }
}
```

here `dist` is the build that gets created. 

- Create a Github repository and initialize it and add it as a remote in your local git repository.

Now, create a remote GitHub repository with your app name and go back initialize this  
`git init`  
add it as remote  
`git remote add origin git@github.com:kishorebandanadam/my-app.git`

- Now deploy it to GitHub Pages.

just run the following command :
`npm run deploy`

this command will create a branch named `gh-pages` which hosts your app.
Now everything is ready but there are two things you need to check before moving forward, that is whether you are using custom domain or default domain for Github Pages. If you are using custom domain like, [www.salesforcelwc.in](https://www.salesforcelwc.in/) there is nothing you have to do, but if you are using default like, kishorebandanadam.github.io/my-app then there are few tweaks you need to make.

![LWC OSS Github Pages Repository]({{ site.url }}/assets/images/lwc-oss/lwc-oss-github-pages-repo.png)

## Tweaks if using default domain
In the created build open index.html and remove '/' from `src` in script tags
Open the `src` folder and remove `/` before `resources` everywhere it's referenced as shown below.

Before: `<img  src="/resources/lwc.png" />`

After: `<img  src="resources/lwc.png" />`

this has to be done before creating the build, after creating the build there is one more thing you have to do. Open the build which is created in the `dist` folder and open `index.html` and remove `/` in the script tags as shown below.

Before: `<script  type="text/javascript"  src="/0.app.js">`
After: `<script  type="text/javascript"  src="0.app.js">`

This has to be done with all script tags.

That's it. Now click on the published link and experience LWC OSS App LIVE.

![LWC OSS Live App]({{ site.url }}/assets/images/lwc-oss/lwc-oss-live-app.png)

Find Live App Here: [LIVE APP](http://app.salesforcelwc.in/)

Credits to [Ibrahim Ragab](https://dev.to/yuribenjamin) for demonstrating how to deploy React App to Github Pages.

