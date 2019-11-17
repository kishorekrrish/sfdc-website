---
layout: post
title: Blockers You will come across while starting with LWC
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Lightning ]
permalink: /2019/09/blockers-in-lwc.html
description: Blockers You will come across while starting with LWC. AURA supports one way and two way data binding, whereas LWC only supports one way data binding. We will how this is a blocker and also how to overcome this.
image: assets/images/Blockers2-lwc.png
author: kishore
tags:
- Lightning
---
If you are a full-fledged AURA developer or just started understanding how it works, you will surely identify some blockers while getting started with LWC. We will cover these blockers one by one.

## Data Binding:
AURA supports one way and two-way data binding, whereas LWC only supports one-way data binding. We will see how this is a blocker and also how to overcome it.

In AURA, the child has the power to change the parent's value directly.
```html
<aura:component >

    <aura:attribute name="record" type="Object" default="{
                                                         'Name' : '',
                                                         }"/>
    
    <lightning:input label="First Name" value="{!v.record.Name}"/>
    
    <lightning:button label="Save" onclick="{!c.save}"/>

</aura:component>
```
<br>
```js
({
 save : function(component, event, helper) {
  
            var rec  = component.get("v.record");
        
 }
})
```
<br>
In the above example declare an attribute called record which has a name in it. We assign value to the lightning input base component. When we input some value, the value automatically gets assigned to the name in the record object, because it's AURA and it handles everything by itself. When we do "component.get()", we get JSON with name-value entered in the input. This is happening because we are using two-way data binding by using "!" in lightning input `{!v.record.Name}`. Do you think this is possible in LWC, absolutely NOT? There is no such operator to use and get two-way binding. 

Then How?

In LWC we need to capture the value that we enter in the input every time it changes or by using "querySelector()" and then manually assign that value to the name property in record object. It's something like this.
```html
<template>
        <lightning-card title="Record with Field Integrity" icon-name="standard:account">
                <div class="slds-p-around_x-small">
                    <lightning-input label="Name" value={name} onchange={handleNameChange}></lightning-input>
                    <lightning-button label="Save" onclick={handleClick}></lightning-button>
                </div>
        </lightning-card>
</template>
```
<br>
```js
import { LightningElement, track} from 'lwc';

export default class CreateRecordWithFieldIntigrity extends LightningElement {

    @track name = '';
   
    rec = {
        Name : this.name,
    }

    handleNameChange(event) {
        this.rec.Name = event.target.value;
    }
    
}
```
<br>
OR,
```html
<template>
        <lightning-card title="Record with Field Integrity" icon-name="standard:account">
                <div class="slds-p-around_x-small">
                    <lightning-input label="Name" value={name} onchange={handleNameChange}></lightning-input>
                    <lightning-button label="Save" onclick={handleClick}></lightning-button>
                </div>
        </lightning-card>
</template>
```
<br>
```js
import { LightningElement, track} from 'lwc';

export default class CreateRecordWithFieldIntigrity extends LightningElement {

    @track name = '';
   
    rec = {
        Name : this.name,
    }

    handleNameChange(event) {
        this.name = event.target.value;
    }
}
```
<br>
This is because the child cannot change the value of the parent attribute. It seems to be a little frustrating at the beginning but as you start working you will appreciate it's greatness, Because it gives you the control, by which you know how or when is the value getting changed and easy to debug. Whereas, in two-way binding, you don't know who is changing the value either parent or child. As a developer don't we want full power and control!!.

I hope you like this information. Please write what you think about one-way and two-way binding, what do you think is better. If you have any thoughts please write them the comment section below.

For your information, the round blue plus button to the bottom right corner is a lightning web component, Please click the button and subscribe to more updates on Salesforce LWC.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>