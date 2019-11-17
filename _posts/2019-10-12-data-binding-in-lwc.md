---
layout: post
title: Data Binding in LWC
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/05/data-binding-in-lwc.html
description: Data Binding in LWC | How to Bind Properties in Template with Properties in Java Script It is important to understand how java script properties can be accessed in template. To access any java script property in template surround that property with curly braces.@track property = '';in javascript {property} in template with no spacesIf a property is changed in template it doesn't automatically update in java script. For the java script property to update we need to create a onchange() event in template and handle it and change the value of property in java script.
image: assets/images/data-binding/data-binding-head.png
author: kishore
tags:
- Lightning
---
How to Bind Properties in Template with Properties in Java Script
It is important to understand how javascript properties can be accessed in the template. To access any javascript property in template, surround that property with curly braces.

`@track property = '';`           // in javascript

`{property}`              // in template with no spaces

If a property is changed in template it doesn't automatically update in javascript. For the javascript property to update we need to create an onchange() event in the template, handle it and change the value of property in javascript.

![Data Binding in LWC](/assets/images/data-binding/data-binding.png)

**binding.html**
```html
<template>
    <lightning-card title="Data Binding">
        <div class="slds-p-around_small">
            <lightning-input label="Enter a value" value={property} onchange={handleChange}></lightning-input>
            <br></br>
            {property}
        </div>
    </lightning-card>
</template>
```
<br>
**binding.js**
```js
import { LightningElement, track } from 'lwc';

export default class Binding extends LightningElement {

    @track property = '';

    handleChange(event) {
        this.property = event.target.value;
    }
}
```
<br>
## Using Getters in place of Expressions
To compute a value for a property, use a JavaScript getter. For example, to convert the name to all uppercase letters, use a getter function in the JavaScript class.

Getters are much more powerful than expressions because they’re JavaScript functions. Getters also enable unit testing, which reduces bugs and increases the fun.

Define a getter that computes the value in your JavaScript class.

`get propertyName() { }`

Access the getter from the template.

`{propertyName}`

![Data Binding in LWC](/assets/images/data-binding/getters-in-lwc.png)

**getterFunction.html**
```html
<template>
    <lightning-card title="Using Getters">
        <div class="slds-p-around_small">
            <lightning-input label="Enter a value" value={property} onchange={handleChange}></lightning-input>
            <br></br>
            {upperClass}
        </div>
    </lightning-card>
</template>
```
<br>
**getterFunction.js**
```js
import { LightningElement, track } from 'lwc';

export default class getterFunction extends LightningElement {

    @track property = '';

    handleChange(event) {
        this.property = event.target.value;
    }

    get upperClass() {
        return this.property.toUpperCase();
    }
}
```
<br>
Here instead of using property directly, we are using javascript getter function.

## Also Read:
[Get started with Salesforce lightning web components](/2019/05/get-started-with-salesforce-lightning.html)

[Set up your Dev Environment for Building Salesforce Lightning Web Components](/2019/05/set-up-your-dev-environment-for.html)

[Create your First Lightning Web Component](/2019/05/create-your-first-lightning-web.html)

[Salesforce Lightning Web components | Editable List](/2019/04/blog-post.html)

If you enjoyed this article, share it with your group!

Subscribe to get the latest updates directly in your inbox.



<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>