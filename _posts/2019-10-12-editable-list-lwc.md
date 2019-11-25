---
layout: post
title: Salesforce Lightning Web components | Editable List
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Apex ]
permalink: /2019/04/blog-post.html
description: Lightning web components are custom HTML elements built using HTML and modern JavaScript. We are going to see how a editable can be built using lightning web components.
image: assets/images/lwc-list.png
toc: true
author: kishore
tags:
- Lightning
---

We are going to see how an editable list can be built using lightning web components.

We are all aware of the newly introduced Lightning Web Components by Salesforce. Now we can build Lightning components using two programming models, 

- Lightning Web Components (New model) 
- Aura Components (Original model)

Lightning web components are custom HTML elements built using HTML and modern JavaScript. With newly introduced tech comes new challenges. We are going to overcome those challenges and develop a component.

Before doing anything lets discuss why we need a custom data table? Salesforce already provided a standard data table. Do we really need a custom table? Let's answer all these questions. Because if there exists a pre-built component there is no meaning in building another one with our effort.

Yes, Salesforce provides us a base component called lightning:dataTable, which just takes a couple of parameters and that's it, it takes care of everything. If you are trying to just display some data it is more than enough. If you want to make it editable for up to some extent it is okay, but if your table consists of any reference fields, picklists, checkbox, and radio buttons then comes the actual problem. All these field types are not supported by default in the standard data table and even you cannot manually incorporate them.

Hence, we come with the Idea of Custom Data Table. Here we as a developer has full control over what we build and can add any field type. We can even incorporate inline edit rather than using a modal to input data.

Everything has its own advantages and disadvantages. Like, standard data table uses optimized cache whereas our custom data table doesn't unless you hardcore apex and js developer.

## Scenario:
To display a list of accounts in the form of a table, with fields like Name, Industry, and Phone. Create a button Icon at the end of each row, which on click opens a pop up with that particular record data pre-loaded, and given an option to update that record.


## Controllers Used
AccountsList.cls

## Components Used:
I have used only one component.

AccountListEdit:
AccountListEdit.html 
AccountListEdit.js

**AccountsList.cls**
```js
public class accList {

    @AuraEnabled(cacheable = true)
    public static List getAccounts() {
        return [Select Id, Name, Industry, Phone from Account Limit 10];
    }
}
```
<br>
In this above apex class, we created getAccounts() method, which returns the list of accounts. Please notice that before the getAccounts() method, in addition to @AuraEnabled annotation, we have also used (cacheable = true), this is because in our AccountListEdit.js file we used @wire service to get the Account List. Don't worry much about this for now. We will learn about @wire service in upcoming posts.

**AccountListEdit.js**
```js
/* eslint-disable no-console */
import { LightningElement, wire, track, api } from 'lwc';
import getAccounts from '@salesforce/apex/accList.getAccounts';
import { refreshApex } from '@salesforce/apex';

export default class AccountListEdit extends LightningElement {
    @wire(getAccounts) Accounts;
    @track open = false;
    @api rec2Id;

    renderedCallback() {
        console.log("Accounts:::", this.Accounts);
        //console.log("Accounts:::", JSON.stringify(this.Accounts));
    }

    handleClick(event) {
        console.log("In HandleClick");
        const recId = event.target.name;
        this.rec2Id = event.currentTarget.name;
        console.log("Selected Account Id:::", recId);
        console.log("Selected Account Id rec2Id :::", this.rec2Id);
        this.open = true;
    }

    closeModal() {
        console.log("In closeModal");
        this.open = false;
    }

    reloadList() {
        return refreshApex(this.Accounts);
    }
}
```
<br>
In the AccountListEdit.js controller, as we are using @wire service, the Accounts list returned from AccountList.cls is assigned to a parameter named Accounts which is decorated by @wire. This Accounts (object) parameter consists of  the following shape,

- data (any type ex: record, list, etc)
- error (error if any error occurs or undefined)

**AccountListEdit.html**
```html
<template>
<lightning-card title="Accounts List" icon-name="standard:account">
    <div class="slds-p-around_x-small">
        <table class="slds-table slds-table_cell-buffer slds-table_bordered">
            <thead>
                <tr class="slds-line-height_reset">
                    <th class="" scope="col">
                        <div class="slds-truncate" title="Account Name">Account Name</div>
                    </th>
                    <th class="" scope="col">
                        <div class="slds-truncate" title="Industry">Industry</div>
                    </th>
                    <th class="" scope="col">
                        <div class="slds-truncate" title="Phone">Phone</div>
                    </th>
                    <th class="" scope="col">
                        <div class="slds-truncate" title="Edit">Action</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <template for:each={Accounts.data} for:item="acc"> 
                    <tr key={acc.Id} class="slds-hint-parent">
                        <td data-label="Prospecting">
                            <div class="slds-truncate" title="Account Name">{acc.Name}</div>
                        </td>
                        <td data-label="Confidence">
                            <div class="slds-truncate" title="Industry">{acc.Industry}</div>
                        </td>
                        <td data-label="Confidence">
                            <div class="slds-truncate" title="Phone">{acc.Phone}</div>
                        </td>
                        <td data-label="Confidence">
                            <div class="slds-truncate" title="Edit">
                                <a name={acc.Id} onclick={handleClick}>
                                    <lightning-icon icon-name="action:edit" size="x-small"></lightning-icon>
                                </a>
                            </div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</lightning-card>
<template if:true={open}>
    <div class="demo-only" style="height: 640px;">
        <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open">
        <div class="slds-modal__container">
            <header class="slds-modal__header">
                <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">
                    <lightning-icon icon-name="utility:close" title="close" size="small" onclick={closeModal} variant="inverse"></lightning-icon>
                </button>
                <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Modal Header</h2>
            </header>
            <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                    <c-update-rec record-id={rec2Id} oncreate={reloadList}></c-update-rec>
            </div>
            <!--<footer class="slds-modal__footer">
            <button class="slds-button slds-button_neutral">Cancel</button>
            <button class="slds-button slds-button_brand">Save</button>
            </footer>-->
        </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open"></div>
    </div>
</template>
</template>
```
<br>
To iterate over a list in LWC  use,

`<template for:each= {Accounts.data} for:item="acc"> </template>`
tag.

## Optimized code
Iterate over a list only if it has data or else aborts. For example
```html
<template if:true = {Accounts.data}>

    <template for:each= {Accounts.data} for:item="acc"> </template>

 </template>
```
<br>
Here, Accounts javascript property which is decorated with @wire generates an object with properties {data, error} data and error, which returns data on success and error if it encounters any failure. So as a best practice by wrapping for:each template with the conditional template so that the code doesn't break when it encounters an error, and show an understandable error message instead of component error which makes the user frustrated and worried. 

I hope you got some understanding. If you like it, please share it and don't forget to leave your feedback below, which helps me improve.

If you have further queries please ask me in the comment box below. I will get back to you with an appropriate solution. 