---
layout: post
title: Conditional Rendering and Iteration in Salesforce Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/05/conditional-rendering-and-iteration-lwc.html
no_description: To render a DOM element in a template only when certain conditions are met, we use conditional rendering in Salesforce lightning. In Lightning Web Components we use if:true,if:false.
image: assets/images/render-lists-conditionally.png
author: kishore
tags:
- Lightning
---

To render a DOM element in a template only when certain conditions are met, we use conditional rendering. To achieve this in Salesforce Lightning Web Components we need to use `if:true / if:false` in the nested `<template>` tag that encloses the element.

## Render elements only when condition evaluates to true (POSITIVE SCENARIO)
The <div> element and its contents are only created and rendered if the value of the `if:true` expression evaluates to true. If the value of the `if:true` expression changes and evaluates to false, all the components inside the `<template if:true= {}>` tag are destroyed. The components are created again if the `if:true` expression changes again and evaluates to true.

## Render elements only when condition evaluates to false (NEGATIVE SCENARIO)
This is similar to aura:set, The `<div>` element and its contents are only created and rendered if the value of the `if:false` expression evaluates to false. If the value of the `if:false` expression changes and evaluates to true, all the components inside the `<template if:false= {}>` tag are destroyed. The components are created again if the if:false expression changes again and evaluates to false.

Let's take an example to understand this,

**Example:** Create a lightning web component which displays contents in a div tag only when `flag` property equals to true.

`@track flag = false;`

![Conditional Rendering and Iteration in Salesforce Lightning Web Components](/assets/images/conditional-graphic.gif)

**conditionalRendering.html**
```html
<template>
    <lightning-card title="Conditional Rendering">
        <div class="slds-p-around_small">
            <lightning-input type="checkbox" label="Check" checked={flag} onchange={handleChange}></lightning-input>
            <br></br>
            <template if:true={flag}>
                <div class="slds-p-around_small">
                    Congrats! you have learnt how conditional rendering works in LWC
                </div>
            </template>
        </div>
    </lightning-card>
</template>
```
<br>
**conditionalRendering.js**
```js
import { LightningElement, track } from 'lwc';

export default class ConditionalRendering extends LightningElement {
    @track flag = false;

    handleChange(event) {
        this.flag = event.target.checked;
    }
}
```
<br>
## Render Lists
To render a list of items, we need to iterate over a list. To iterate over a list we use for:each  or  iterator:iteratorName in a nested `<template>` tag that encloses the HTML elements you want to repeat.

The iterator has first and last properties that let you apply special behaviors to the first and last items in an array.

Regardless of which directive you use, you must use a key directive to assign a unique ID to each item. When a list changes, the framework uses the key to rerender only the item that changed. [Learn more from LWC developer guide.](https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.create_lists){:rel="nofollow"}{:target="_blank"}

![Conditional Rendering and Iteration in Salesforce Lightning Web Components](/assets/images/renderlist.png)

**renderList.html**
```html
<template>
    <lightning-card title="Render Lists">
        <div class="slds-p-around_small">
            <template for:each={records.data} for:item="rec">
                <div class="slds-p-left_small lgc-bg" key={rec.Id}>
                    {rec.Name}
                </div>
            </template>
        </div>
    </lightning-card>
</template>
```
<br>
**renderList.js**
```js
import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/accList.getAccounts';

export default class ConditionalRendering extends LightningElement {
    @wire(getAccounts) records;
    
}
```
<br>
## Also Read:
- [Publish–Subscribe Pattern in Lightning Web Components (pubsub)](/2019/04/publishsubscribe-pattern-in-lightning.html)
- [How to Create a Record in Salesforce Lightning Web Components using Apex](/2019/04/publishsubscribe-pattern-in-lightning.html)


If you enjoyed this article, share it with your group!

Do subscribe, for getting latest updates directly in your inbox.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>