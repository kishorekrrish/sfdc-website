---
layout: post
title: Get Server Data using Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/06/get-data-in-lwc.html
description: Server data can be fetched from Salesforce using 3 ways. Lightning Data Service, Wire Service and Simple Apex.
image: assets/images/server-data/get-server-data.png
author: kishore
tags:
- Lightning
---
There are mainly two ways to get data using Lightning Web Components.
- Base Components which uses LDS
- Wire Service

For the very maximum try to get data or create records using lightning base components. If you think the requirement cannot be achieved by using Base Components, or if you think more customization is needed, then use other means. LDS is built on top of UI API.

Using base components that uses LDS is one of the easiest ways to get/create records as it doesn't require Apex. Moreover, it respects CRUD access, handles sharing rules and field-level security which very much lacks in Lightning unless you implement it by your own. This means users who have CRUD access and FLS visibility only can see the records. It improves the performance and UI consistency and moreover, Salesforce highly recommends LDS before choosing other options. Records loaded in Lightning Data Service are cached and shared across components. Optimizes server calls by bulkifying and deduping requests.

* Do not remove this line (it will not be displayed)
{:toc}

![Get Server Data using Lightning Web Components](/assets/images/server-data/record-view-form.png)

Let's get a record using base components that use LDS.

**usingLDS.html**
```html
<template>
    <lightning-card title="Record Form" icon-name="standard:account">
        <div class="slds-p-around_x-small">
            <lightning-record-view-form record-id={recordId}
                                        object-api-name={objectApiName}>
                <div class="slds-box">
                    <lightning-output-field field-name="Name">
                    </lightning-output-field>
                    <lightning-output-field field-name="Industry">
                    </lightning-output-field>
                    <lightning-output-field field-name="Phone">
                    </lightning-output-field>
                </div>
            </lightning-record-view-form>
        </div>
    </lightning-card>    
</template>
```
<br>
**usingLDS.js**
```js
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class UsingLDS extends LightningElement {

    @api recordId;
    @api objectApiName;

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Account created",
            message: "Record ID: "+ event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
    }
}
```
<br>
## Wire Service
Wire Service is built on top of the Lightning Data Service. You can get the record, field value and even lists in wire service. We can assign reactive variables to wire service to fetch new data whenever data changes. For fetching records using wire service doesn't require apex similar to LDS as wire service is built on top of LDS by uiRecordApi or uiListApi. We can even use wire service with apex, by annotating the apex method with (cacheable=true).

It takes the following parameters

|  Parameter  |  Description  |
|-----|----|
|  recordId  |  The ID of the record to retrieve. | 
|  fields  |  Object-qualified field API names to retrieve. If a field isn’t accessible to the context user, it causes an error. If fields are specified, don't specify layout types. |
|  layoutTypes  |  Layouts defining the fields to retrieve. If specified, don't specify fields. |
|  modes  | Layout modes defining the fields to retrieve. |
|  optionalFields  |  Object-qualified field API names to retrieve. If an optional field isn’t accessible to the context user, it isn’t included in the response, but it doesn’t cause an error. |

![Get Server Data using Lightning Web Components](/assets/images/server-data/wire-service.png)

**usingWireService.html**
```html
<template>
    <lightning-card title="Wire Service" icon-name="standard:account">
        <div class="slds-p-around_x-small">
            <div class="slds-box">
                <lightning-layout>
                    <lightning-layout-item size="4" padding="around-small">
                        <div class="slds-form-element__label">Account Name</div><br/>
                        <lightning-formatted-text value={name} ></lightning-formatted-text><br/>
                        <div class="slds-form-element__label">Industry</div><br/>
                        <lightning-formatted-text value={industry} ></lightning-formatted-text><br/>
                        <div class="slds-form-element__label">Phone</div><br/>
                        <lightning-formatted-phone value={phone}></lightning-formatted-phone><br/>
                    </lightning-layout-item>
                </lightning-layout>
            </div>
        </div>
    </lightning-card>   
</template>
```
<br>
**usingWireService.js**
```js
/* eslint-disable no-console */
import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Account.Name',
    'Account.Industry',
    'Account.Phone',
];
export default class UsingWireService extends LightningElement {

    @api recordId;
    @track account;
    @track name;
    @track industry;
    @track phone;

    @wire(getRecord,  { recordId: '$recordId', fields: FIELDS}) 
    wiredRecord({ error, data }) {
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading account',
                    message,
                    variant: 'error',
                }),
            );
        } else if (data) {
            this.account = data;
            this.name = this.account.fields.Name.value;
            this.industry = this.account.fields.Industry.value;
            this.phone = this.account.fields.Phone.value;
        }
    }    
}
```
<br>
Wire service is not limited, we can assign to property or function. In the above example, we used a function. We will see more about wire service in the next post.

If you enjoyed this article, share it with your group!

Subscribe to get the latest updates directly in your inbox.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>