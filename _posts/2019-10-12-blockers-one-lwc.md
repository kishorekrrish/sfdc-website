---
layout: post
title: Blockers You will come across while dealing with Lists in LWC
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Lightning ]
permalink: /2019/09/blockers-in-lwc-list.html
description: Blockers You will come across while dealing with Lists in LWC
Previously we have seen how data binding acts as a blocker and how to overcome that in LWC. In this article, we will understand how data binding acts as a blocker when dealing with lists in LWC.
In Salesforce we often deal with a list of records.
image: assets/images/Blockers1-lwc.png
author: kishore
tags:
- Lightning
---
Previously we have seen how data binding acts as a blocker and how to overcome that in LWC. In this article, we will understand how data binding acts as a blocker when dealing with lists in LWC.

In Salesforce we often deal with a list of records, may it be related list and whatnot. We will compare and understand data binding in the case of lists in AURA and LWC.

Let's take a simple example to understand this,

## AURA
```html
<aura:attribute name="records" type="Object[]"/>

<aura:handler name="init" value="{!this}" action="{!c.doinit}"/>

<aura:iteration items="{!v.records}" var="rec" indexVar="index">
 <lightning:layout>
  <lightning:layoutItem size="1" padding="around-small" flexibility="auto, no-grow">
   <lightning:input label="name" value="{!rec.Name}" variant="label-hidden"/>
  </lightning:layoutItem>
  <lightning:layoutItem size="1" padding="around-small" flexibility="auto, no-grow">
   <lightning:input label="Industry" value="{!rec.Industry}" variant="label-hidden"/>
  </lightning:layoutItem>
 </lightning:layout>

        <lightning:button label="Save" onclick="{!c.save}" variant="brand"/>
</aura:iteration>
```
<br>
```js
doinit : function(component, event, helper) {
 
 var action = component.get("c.getAccounts");
 //Here getAccounts method returns List of account records with Name and Industry fields
 action.setCallback(this, function(response){
  var state = response.getState();
  if(state === 'SUCCESS' || state === 'DRAFT'){
   let result = response.getReturnValue();
   component.set("v.records", result);
  }
 });
 $A.enqueueAction(action);
},

save : function(component, event, helper) {
 
 var recordsToSave  = component.get("v.records");
 // variable "recordsToSave" will have all the existing/changed data using input components
}
```
<br>
In the above example, we are just declaring an attribute called records of type array of objects and using it in our mark-up and everything is handled by AURA, we don't need to worry about indexing and stuff. In javascript, we directly retrieve the changed records by one single line "component.get()" and we get all changed records with changes reflecting in the exact indices rather than mapping the changes manually to the particular indexed record. This doesn't work in the case of  LWC.

## LWC
```html
<template for:each = {records} for:item = "record" for:index="indexVar">
 <tr key={record.Id} class="slds-hint-parent">
  <td class="slds-size_3-of-10" data-label="Prospecting">
   <div  title="Prospecting">
    <lightning-input data-id={record.Id} name="Name" label="Name" value={record.Name} variant="label-hidden" onchange={handleNameChange}></lightning-input>
   </div>
   <div  title="Prospecting">
    <lightning-input data-id={record.Id} name="Industry" label="Name" value={record.Industry} variant="label-hidden" onchange={handleIndustryChange}></lightning-input>
   </div>
  </td>
 </tr>
</template>
```
<br>
```js
import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/dynamicRowsController.getAccounts';

export default class TestBinding extends LightningElement {
    
    @track records = [];

    connectedCallback() {
      getAccounts()
         .then(result => {
           this.records = result;
           this.error = undefined;
         })
         .catch(error => {
           this.error = error;
           this.record = undefined;
         });  
    }

    /*--------------------Mapping field values to the list onchange --------------------*/                
    handleNameChange(event) {
        let record = this.records.find(ele  => ele.Id === event.target.dataset.id);
        record.Name = event.target.value;
        this.records = [...this.records];
    }
 
    handleIndustryChange(event) {
        let record = this.records.find(ele  => ele.Id === event.target.dataset.id);
        record.Industry = event.target.value;
        this.records = [...this.records];
    }
}
```
<br>
I hope you have understood the difference just by looking at the sample code. If not, here you go.

In connected callback which is equivalent to init handler in the aura, we get the list of accounts,  As you know LWC has only one-way data binding, we need to map data changes in the input elements to the exact record in the list to which changes are made, for that we use Id as the unique key and use find() method to find the record based on Id and map the changed value may it be name or any other field as shown above.

If you have noticed this line in the code
     `this.records = [...this.records]`

basically, what this means is we are cloning "records" and assigning the value to itself which triggers @track decorator to sense data change and re-render.

I hope you like this information. Please write what you think about one-way and two-way binding, what do you think is better. If you have any thoughts please write them the comment section below.

If you find any mistakes please let me know.

For your information, the round blue plus button to the bottom right corner is a lightning web component, Please click the button and subscribe to more updates on Salesforce LWC.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>