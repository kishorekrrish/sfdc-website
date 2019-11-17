---
layout: post
title: Create your First Lightning Web Component
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/05/create-your-first-lightning-web.html
description: Create your First Lightning Web Component In VS Code, press Ctrl + Shift + P in windows or Cmd + Shift + P in mac which opens command palette. Type this command sfdx Create Lightning Web Component and press enter. Enter file name (myFirstLwc) and press enter Select default directory and press enter Now give some time while LWC file is created.
image: assets/images/first-lwc.png
author: kishore
tags:
- Lightning
---
## In Short
Lightning Web Components is a new programming model for building Lightning components in Salesforce. It leverages the web standards, it can co-exist and inter-operate with Aura programming model.

Now as you have set up your development environment for building Lightning Web Components, lets get started and build a basic web component.

If you have not set up development environment, read this article on how to [Set up your Dev Environment for Building Salesforce Lightning Web Components](/2019/05/set-up-your-dev-environment-for.html).  

If you are new to Lightning Web Components, read this article on [Get started with Salesforce lightning web components](/2019/05/get-started-with-salesforce-lightning.html).

## Create Lightning Web Component
In VS Code, press Ctrl + Shift + P in windows or Cmd + Shift + P in mac which opens command palette. 

- Type this command sfdx: Create Lightning Web Component and press enter.
- Enter file name (myFirstLwc) and press enter
- Select default directory and press enter
- Now give some time while LWC file is created.

The create file is visible in the explorer to the left in VS Code in this path.

> force-app --> main --> default --> lwc

In lwc folder you can see __myFirstLwc__ created, myFirstLwc contains three files in it by default.

- myFirstLwc.html
- myFirstLwc.js
- myFirstLwc.js-meta.xml

In Addition you can add the following files,

- myFirstLwc.css
- myFirstLwc.svg
- shared_code.js
- moreSharedCode.js
- \__tests__  [myComponent.test.js]

**myFirstLwc.html** contains component mark up
**myFirstLwc.js** contains java script (client side controller)
**myFirstLwc.js-meta.xml** is a configuration file containing metadata values.

Naming convention is very important, component name must start with lower-case letter

I got to know this last, but naming convention is important. So be informed.

As we got some knowledge regarding LWC files, let's create one.

We will build a basic Lightning Web Component to create a record using Lightning Design Service (LDS).

**myFirstLwc.html**
```html
<template>
    <lightning-card title="My first Lightning Web Component">
        <div class="slds-p-around_small">
            <lightning-record-edit-form object-api-name="Account" onsuccess={handleSuccess}>
                <lightning-input-field field-name="Id" value={accountId}></lightning-input-field>
                <lightning-input-field field-name="Name"></lightning-input-field>
                <lightning-input-field field-name="Industry"></lightning-input-field>
                <lightning-input-field field-name="Phone"></lightning-input-field><br></br>
                    <lightning-button
                        class="slds-m-top_small"
                        type="submit"
                        label="Create new">
                    </lightning-button>
            </lightning-record-edit-form>
        </div>
    </lightning-card>
</template>
```
<br>
**myFirstLwc.js**
```js
import { LightningElement,track } from 'lwc';


export default class MyFirstLwc extends LightningElement {
    @track accountId;
    handleSuccess(event) {
        this.accountId = event.detail.id;
    }
}
```
<br>
**myFirstLwc.js-meta.xml**
```html
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata" fqn="myFirstLwc">
    <apiVersion>45.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
    </targets>   
</LightningComponentBundle>
```
<br>
Congrats! You have created your Lightning Web Component. In coming chapters let us go in detail about each and every concept.

## Also Read:
- [Data Binding in LWC](/2019/05/data-binding-in-lwc.html)
- [Publish–Subscribe Pattern in Lightning Web Components (pubsub)](/2019/04/publishsubscribe-pattern-in-lightning.html)
- [How to integrate Salesforce with Zomato using Lightning Web Components](/2019/04/how-to-integrate-salesforce-with-zomato.html)
- [Salesforce Lightning Web components, Editable List](/2019/04/blog-post.html)

If you enjoyed this blog post, share it with your group!
Do subscribe, for getting latest updates directly in your inbox.