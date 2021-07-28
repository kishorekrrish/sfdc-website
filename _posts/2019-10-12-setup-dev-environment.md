---
layout: post
title: Set up your Dev Environment for Building Salesforce Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/05/create-your-first-lightning-web.html
no_description: To develop Lightning web components, we have to use any code editor which integrates with Salesforce CLI, Developer console is not yet supported.
image: assets/images/dev-environment.png
toc: true
author: kishore
tags:
- Lightning
---

You can’t develop Lightning web components in the Developer Console. So, to develop Lightning web components, we have to use any code editor. I use VS Code. To deploy and retrieve source code from your Org you need to use Salesforce CLI.

## Install Salesforce CLI
The Salesforce CLI is a powerful command line interface that simplifies development and build automation when working with your Salesforce org.

Install CLI from here: [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli){:rel="nofollow"}{:target="_blank"}

After Installing CLI, 

In **Windows**, To upgrade to the current version open command prompt and run the following code.

>`sfdx update`

Find more sfdx commands here: [sfdx commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_org.htm){:rel="nofollow"}{:target="_blank"}

## Install VS Code:
I use VS code, you can use code editor of your choice.
Install VS code from here: [VS Code](https://code.visualstudio.com/){:rel="nofollow"}{:target="_blank"}

Download Salesforce Extension Pack from VS Code extensions section or download it directly from VS Code market place [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode){:rel="nofollow"}{:target="_blank"}

Congrats! now that you have set up Salesforce CLI and Code Editor successfully. Let's go ahead and setup your Dev Org to start coding.

## Final Touch ups
In your VS code, create a project,

- To create a project, In VS Code press ctrl + Shift + P which open command palette. 
- Type sfdx: Create project with manifest and press enter.
- Give a project Name and press Enter.

## Set up default Org:
In Command palette,

- Type sfdx: set a default org and press enter
- Select sfdx: Authorize an org and press enter
- Select sandbox or production accordingly and press enter
- Enter Org Alias (short name) and press enter
- Salesforce login page is opened in the browser tab, Enter your salesforce credentials and that's it it's done.

Now you are just one step away from creating Lightning Web Component.

## Also Read:
[Create your First Lightning Web Component](/2019/05/create-your-first-lightning-web.html)
[Data Binding in LWC](/2019/05/data-binding-in-lwc.html)

If you enjoyed this blog post, share it with your group!

Do subscribe, for getting latest updates directly in your inbox. 