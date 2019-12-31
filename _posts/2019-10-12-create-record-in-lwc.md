---
layout: post
title: How to Create a Record in Salesforce using Lightning Web Components and Apex
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Apex ]
permalink: /2019/04/how-to-create-record-in-lightning-web.html
description: Create a record in Salesforce Lightning using Lightning Web Components aka LWC and Apex.
image: assets/images/create-rec-lwc/create-rec-lwc.png
toc: true
author: kishore
tags:
- Lightning
---

We are going to see how to create a record in Salesforce with Lightning Web Components aka LWC and Apex. In LWC documentation, there were two examples shown for creating a record in LWC.

- Using UiRecordApi
- LDS

These two are the recommended ways. These two methods work fine with one record.

But what if there is a requirement where you need to insert more than one record on button press. In this kind of situations this method may come handy

![How to Create a Record in Lightning Web Components using Apex](/assets/images/create-rec-lwc/create-rec-lwc-gif.gif)

**CreateRecordDiff.html**
```html
<template>
        <lightning-card title="Record with Field Integrity" icon-name="standard:account">
                <div class="slds-p-around_x-small">
                    <lightning-input label="Name" value={rec.Name} onchange={handleNameChange}></lightning-input>
                    <lightning-input label="Industry" value={rec.Industry} onchange={handleIndChange}></lightning-input>
                    <lightning-input type="Phone" label="Phone" value={rec.Phone} onchange={handlePhnChange}></lightning-input><br/>
                    <lightning-button label="Save" onclick={handleClick}></lightning-button>
                </div>
            </lightning-card>
</template>
```
<br>
This **createRecordDiff.html** is a basic form with inputs  with change handlers and a button with onclick handler.

**CreateRecordDiff.js**
```js
/* eslint-disable no-console */
import { LightningElement, track} from 'lwc';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import createAccount from '@salesforce/apex/createAcc.createAccount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateRecordWithFieldIntigrity extends LightningElement {

    @track name = NAME_FIELD;
    @track industry = INDUSTRY_FIELD;
    @track phone = PHONE_FIELD;
    rec = {
        Name : this.name,
        Industry : this.industry,
        Phone : this.phone
    }

    handleNameChange(event) {
        this.rec.Name = event.target.value;
        console.log("name1", this.rec.Name);
    }
    
    handleIndChange(event) {
        this.rec.Industry = event.target.value;
        console.log("Industry", this.rec.Industry);
    }
    
    handlePhnChange(event) {
        this.rec.Phone = event.target.value;
        console.log("Phone", this.rec.Phone);
    }

    handleClick() {
        createAccount({ acc : this.rec })
            .then(result => {
                this.message = result;
                this.error = undefined;
                if(this.message !== undefined) {
                    this.rec.Name = '';
                    this.rec.Industry = '';
                    this.rec.Phone = '';
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Account created',
                            variant: 'success',
                        }),
                    );
                }
                
                console.log(JSON.stringify(result));
                console.log("result", this.message);
            })
            .catch(error => {
                this.message = undefined;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
                console.log("error", JSON.stringify(this.error));
            });
    }
}
```
<br>
On button click the entered info is passed as parameter to createAccount in createAcc.cls class.

```js
public class createAcc {
 
    @AuraEnabled
    public static Account createAccount(Account acc) {
        system.debug('acc'+acc);
        insert acc;
        return acc;
    }
}
```
<br>
In this way you can insert record into salesforce using LWC and Apex.

Hope this post helped you gain some knowledge, If you like the please don't step back to like my page and leave your feedback, It will motivate me to make more posts.

Subscribe to receive the latest updates directly in your inbox.