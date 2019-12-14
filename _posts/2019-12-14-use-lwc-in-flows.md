---
layout: post
title: Use Lightning Web Component in Flows
date: '2019-12-14T22:25:00.000-07:00'
categories: [ Automation, Salesforce Automation ]
permalink: /use-lwc-in-flows.html
description: Lightning Flow Builder is one the awesome automation tool available in Salesforce which gets the work done without single line of code. Use Lightning Web Component to make better UI experience for users.
image: assets/images/lwc-flow/lwc-flow.png
toc: true
beforetoc: "Lightning Flow Builder is one the awesome automation tool available in Salesforce which gets the work done without single line of code."
author: kishore
tags:
- Automation
---

 Almost any thing can be achieved using Lightning Flow Builder like creating the records, updating the records, sending an e-mail, invoke approval process, call apex class, display and interact with lightning components and even call an External system and what not. It would be very un-cool if we as **Salesforce Developer/Admin** don't utilize such a great tool to the depths. In this article we will get some knowledge about how to use **Lightning Web Components** in Lightning Flow Builder to build better looking and un-conventional flow components.

## Preview
![LWC Flow gif]({{ site.url }}/assets/images/lwc-flow/lwc-flow-gif.gif =448 x 246.4)

## What is Lightning Flow Builder
If you are a Salesforce Developer/Admin you would obviously be knowing what Lightning Flow Builder is? this is just to make sure we are on the right track.
Lightning Flow Builder is the New **Automation** Tool launched by Salesforce which is built using modern technologies. It's earlier version is Cloud FLow Designer which is depricated.

## Why to use Lightning Web Components in Flow
We use Lightning Web Components in Flow to offer better UI experience for the Users and also to achieve things which flow alone cannot do.

## How To Make Lightning Web Components available for Flows
To make Lightning Web Component available for Flow screens add a target to the targets tag in the component's **Meta Xml** file.

```html
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata" fqn="lwcForFlow">
    <apiVersion>45.0</apiVersion>
    <isExposed>true</isExposed>

    <targets>
        <target>lightning__FlowScreen</target>
    </targets>
</LightningComponentBundle>
```

By adding this tag the Lightning Web Component becomes available for flow screens.

**Let's get some clarity of the requirement before we move forward**
Let's have you want a flow that displays a list of Accounts in a nice SLDS styled data-table, select the accounts and display the selected account Ids.
That's pretty staright-forward, I took this simple example so don't get confused.

Wait a Second!  How would the Flow know what accounts I have selected in the lightning component, is there anything that communicates between LWC and Flows ?

Obviously, we need declare the properties that could communicate between LWC and Flow. As, we have Targets we also have Target Configs where we declare properties. In this case we declare two properties 
- Property named **Accounts** of type="@salesforce/schema/account[]" which recieves list of accounts that have to displayed in the list.
- Property names "selectedAccsString" of type="String", so that we could display selected records Ids as a string. we can probably declare another property of type array of string to capture selected Ids as an array of strings instead of string.

```html
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata" fqn="lwcForFlow">
    <apiVersion>45.0</apiVersion>
    <isExposed>true</isExposed>

    <targets>
        <target>`lightning__FlowScreen`</target>
    </targets>

>     <targetConfigs>
        <targetConfig targets="lightning__FlowScreen">
            `<property name="Accs" type="@salesforce/schema/account[]" label="Accounts" description="list of Accounts"/>
            <property name="selectedAccs" type="String[]" label="Selected Accounts" description="Selected Account Ids"/>
            <property name="selectedAccsString" type="String" label="Selected Accounts String" description="Selected Account Ids"/>`
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```
Now eveything looks good.

## Lightning Web Component

```html
<template>
    <lightning-card title="Accounts List" icon-name="standard:account">
        <div class="slds-p-around_x-small">
            <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                <thead>
                    <tr class="slds-line-height_reset">
                        <th class="" scope="col">
                            <div class="slds-truncate" title="Edit">Select</div>
                        </th>
                        <th class="" scope="col">
                            <div class="slds-truncate" title="Account Name">Account Name</div>
                        </th>
                        <th class="" scope="col">
                            <div class="slds-truncate" title="Industry">Industry</div>
                        </th>
                        <th class="" scope="col">
                            <div class="slds-truncate" title="Phone">Phone</div>
                        </th>                        
                    </tr>
                </thead>
                <tbody>
                    <template for:each={Accs} for:item="acc"> 
                        <tr key={acc.Id} class="slds-hint-parent">
                            <td data-label="Prospecting">
                                <div class="slds-truncate" title="Select">
                                    <lightning-input type="checkbox-button" label="select" variant="label-hidden" onchange={handleCheck} name={acc.Id}></lightning-input>
                                </div>
                            </td>                                
                            <td data-label="Prospecting">
                                <div class="slds-truncate" title="Account Name">{acc.Name}</div>
                            </td>
                            <td data-label="Confidence">
                                <div class="slds-truncate" title="Industry">{acc.Industry}</div>
                            </td>
                            <td data-label="Confidence">
                                <div class="slds-truncate" title="Phone">{acc.Phone}</div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </lightning-card>
</template>
```
<br>
```js
/* eslint-disable no-console */
import { LightningElement, api } from 'lwc';

export default class LwcForFlow extends LightningElement {
    @api selectedAccs = [];
    @api selectedAccsString;
    @api Accs = [];

    handleCheck(event) {
        if(!this.selectedAccs.includes(event.currentTarget.name))
            this.selectedAccs.push(event.currentTarget.name);
        else {
            for(let i = 0; i < this.selectedAccs.length; i++) {
                if(event.currentTarget.name === this.selectedAccs[i])
                this.selectedAccs.splice(i, 1);
            }
        }
        
        this.selectedAccsString = JSON.stringify(this.selectedAccs);
        
    }
}
```
<br>
```html
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata" fqn="lwcForFlow">
    <apiVersion>45.0</apiVersion>
    <isExposed>true</isExposed>

    <targets>
        <target>lightning__FlowScreen</target>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
    </targets>

    <targetConfigs>
        <targetConfig targets="lightning__FlowScreen">
            <property name="Accs" type="@salesforce/schema/account[]" label="Accounts" description="list of Accounts"/>
            <property name="selectedAccs" type="String[]" label="Selected Accounts" description="Selected Account Ids"/>
            <property name="selectedAccsString" type="String" label="Selected Accounts String" description="Selected Account Ids"/>
        </targetConfig>
    </targetConfigs>    
</LightningComponentBundle>
```
<br>
## Flow Design
Below is the flow that uses LWC. The images are self explanatory.

**Flow**
![Main lightning flow builder flow]({{ site.url }}/assets/images/lwc-flow/main-flow-diagram.png)

**Resources used in Flow**
![Resources used in Lightning builder flow]({{ site.url }}/assets/images/lwc-flow/resources-lwc-flow.png)

## Variables Used
- varAccountList
- varSelectedIds

**varAccountList**
![varAccountList in lightning flow builder]({{ site.url }}/assets/images/lwc-flow/account-list-var-in-flow.png)

**varSelectedIds**
![varSelectedIds in lightning flow builder]({{ site.url }}/assets/images/lwc-flow/selected-var-flows.png)

## Get Records Element

**Get Accounts Element**
![Get Accounts Element in lightning flow builder]({{ site.url }}/assets/images/lwc-flow/get-accounts-flow.png)

**Drag LWC to Screen Element**
![Drag LWC to Screen Element lightning flow builder]({{ site.url }}/assets/images/lwc-flow/drag-lwc-to-flow.png)

## Screen Elements
- LWC Screen Element
- Selected Ids Screen Element

**LWC Screen Element**
![LWC Screen Element lightning flow builder]({{ site.url }}/assets/images/lwc-flow/lwc-screen-flow.png)

**Selected Ids Screen Element**
![Selected Ids Screen Element lightning flow builder]({{ site.url }}/assets/images/lwc-flow/selected-screen-flow.png)

## Live LWC Flow Component
![Live LWC Flow Component]({{ site.url }}/assets/images/lwc-flow/live-lwc-flow-component.png)
