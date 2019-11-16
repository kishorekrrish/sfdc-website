---
layout: post
title: Fully Featured Custom Look-Up Component using Salesforce Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Lightning, Apex ]
permalink: /2019/10/lookup-in-lwc.html
description: Fully Featured Custom Look-Up Component using Salesforce Lightning Web Components. We will understand how to create a Custom Lookup component that can be reused for any object. As LWC is new and not completely mature everything is not available out of the box. Look-up Component is one of that. As a Salesforce CRM developer, we are well aware that there is no base component provided by salesforce either in AURA or LWC for look up.
image: assets/images/custom-lookup.png
author: kishore
tags:
- Lightning
---

Hi guys, today we are going to create a custom look-up component using Lightning Web Components. Lightning Web Components is a new framework created by Salesforce, a customer relationship management software. We can leverage modern and standard features. As LWC is new and not completely mature everything is not available out of the box, we need to build some things on our own to meet the requirements. 

## Create your first Lightning Web Component
Look-up Component is one of that. As a Salesforce crm developer, we are well aware that there is no base component provided by salesforce either in AURA or LWC. So, in this article, you will understand how to create a Custom Lookup component that can be reused for any object in Salesforce crm.

We are going to leverage Wire Service in building this component. know more about wire service

you can check out Custom Lookup component using AURA

## Final Outcome would be
1. Fully Dynamic component
2. Has an option to enable create record button 
3. Can create a new record from look-up directly if create record option is enabled
4. In-line, Block and none label variants available
5. Record-Type aware
6. Custom Filter available

## Usage
```html
<c-lookup-lwc   
 unique-key={item.Id} 
 value-id={item.JobType__c} 
 obj-name="JobType__c" 
 icon-name="custom:custom85" 
 label-name="JobType" 
 onvalueselect={handleSelection}
 create-record=true>
</c-lookup-lwc>
```
<br>
Creating a record from the lookup component is something that you have seen in standard record detail pages in Salesforce crm. It's no big deal and can be achieved easily, we just have to make sure whether Record Types are available for that particular object and handle it. We can get the record types available for an object using "**uiObjectInfoApi**"

`@wire(getObjectInfo, { objectApiName: '$objName' })`

**LookUp.html**
```html
<template>
    <div>
        <div class="slds-form-element">
            <div class="slds-form-element__control">
                <div class="slds-combobox_container">
                    <div id="box" class={boxClass} aria-expanded="true" aria-haspopup="listbox" role="combobox">
                        <div class="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <template if:true={isValue}>
                                <div id="lookup-pill" class="slds-pill-container">
                                    <lightning-pill class="pillSize" label={valueObj} name={valueObj} onremove={handleRemovePill} href={href}>
                                        <lightning-icon icon-name={iconName} alternative-text="acc" ></lightning-icon>
                                    </lightning-pill>
                                </div>
                            </template>
                            <template if:false={isValue}>
                                <div class="slds-p-top_none">
                                    <lightning-input class={inputClass} type="search" id="input" value={searchTerm}
                                        onclick={handleClick} onblur={inblur} onchange={onChange}
                                        variant="label-hidden" autocomplete="off" placeholder="Search...">
                                    </lightning-input>
                                </div>
                            </template>
                        </div>
                        <div id="listbox-id-1" class="slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid" role="listbox">
                            <ul class="slds-listbox slds-listbox_vertical" role="presentation">
                                <template for:each={options} for:item="item">
                                    <li key={item.Id} onclick={onSelect} data-id={item.Id} role="presentation">
                                        <span class="slds-lookup__item-action slds-lookup__item-action--label" role="option">
                                            <lightning-icon class="slds-icon slds-icon--small slds-icon-text-default" icon-name={iconName} alternative-text={objName} size="small"></lightning-icon>
                                            <span class="slds-truncate">{item.Name}</span>
                                        </span>
                                    </li>
                                </template>
                                <template if:true={createRecord}>
                                    <li onclick={createRecordFunc} role="presentation">
                                        <span class="slds-lookup__item-action slds-lookup__item-action--label" role="option">
                                            <lightning-button-icon class="slds-icon slds-icon--small  slds-icon-text-default" variant="border-inverse, bare" icon-name="utility:add" size="small"></lightning-button-icon>
                                            <span class="slds-truncate">New {objLabelName}</span>
                                        </span>
                                    </li>
                                </template>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- create Record Component-->
    <template if:true={createRecordOpen}>
       
        <template if:true={recordTypeSelector}>
            <div >
                <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open">
                    <div class="slds-modal__container">
                        <header class="slds-modal__header">
                            <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">
                                <lightning-button-icon icon-name="utility:close" variant="bare-inverse" size="large" onclick={closeModal}></lightning-button-icon>
                                <span class="slds-assistive-text">Close</span>
                            </button>
                            <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">New {objLabelName}</h2>
                        </header>
                        <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                            <div class="slds-radio_faux slds-radio__label">
                            <lightning-radio-group name="Record Type"
                                                  label="Record Type"
                                                  options={recordTypeOptions}
                                                  value={recordTypeId}
                                                  variant="label-inline"
                                                  type="radio"
                                                  onchange={handleRecTypeChange}>
                            </lightning-radio-group>
                            </div>
                        </div>
                        <footer class="slds-modal__footer">
                            <lightning-button label="Cancel" onclick={closeModal}></lightning-button>
                            <lightning-button label="Next" onclick={createRecordMain} variant="brand"></lightning-button>
                        </footer>
                    </div>
                </section>
                <div class="slds-backdrop slds-backdrop_open"></div>
            </div>
        </template>
        
        <template if:true={mainRecord}>
            <div class="main">
                <section role="dialog" tabindex="-1" class="slds-modal slds-fade-in-open slds-modal_medium" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1">
                    <div class="slds-modal__container">
                        <header class="slds-modal__header">
                            <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">
                                <lightning-button-icon icon-name="utility:close" variant="bare-inverse" size="large" onclick={closeModal}></lightning-button-icon>
                                <span class="slds-assistive-text">Close</span>
                            </button>
                            <h2 id="modal-heading-02" class="slds-text-heading_medium slds-hyphenate">New {objLabelName}</h2>
                        </header>
                        <div  class={myPadding}  id="modal-content-id-2">
                            
                            <div id="stencil" class={stencilClass}>
                                <c-stencil-lwc double={double} columns={cols} opacities={opacs}></c-stencil-lwc>
                            </div>
                    
                            <div id="stencilReplacement"  class={stencilReplacement}>
                                <lightning-record-form class="recordForm"
                                                        object-api-name={objName}
                                                        record-type-id={recordTypeId}
                                                        layout-type="Compact"
                                                        columns="2"
                                                        onload={handleLoad}
                                                        density="comfy"
                                                        onerror={handleError}
                                                        onsuccess={handleSuccess}>
                                </lightning-record-form>       
                            </div>                                                     
                        </div>
                        <footer class="slds-modal__footer">
                            <!--lightning-button class="slds-p-right_small" label="Save" onclick={handleSubmit} variant="brand"></lightning-button>
                            <lightning-button label="Cancel" onclick={closeModal}></lightning-button>-->
                        </footer>
                    </div>
                </section>
                <div class="slds-backdrop slds-backdrop_open"></div>
            </div>
        </template>
    </template>
</template>
```
<br>
In the Javascript controller, we are using a lot of standard and custom events. [Learn more about Events in Lightning Web Components](https://www.salesforcelwc.in/2019/05/events-in-lightning-web-components.html)

**LookUp.js**
```js
/* eslint-disable no-console */
/* eslint-disable @lwc/lwc/no-async-operation */

import lookUp from '@salesforce/apex/LookupController.lookUp';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { api, LightningElement, track, wire } from 'lwc';

let FIELDS = ['JobType__c.Name'];

export default class LookupLwc extends LightningElement {

    @api valueId;
    @api objName;
    @api iconName;
    @api labelName;
    @api readOnly = false;
    @api filter = '';
    @api showLabel = false;
    @api uniqueKey;
    objLabelName;

    /*Create Record Start*/
    @api createRecord;
    @track recordTypeOptions;
    @track createRecordOpen;
    @track recordTypeSelector;
    @track mainRecord;
    @track isLoaded = false;

    //stencil
    @track cols = [1,2];
    @track opacs = ['opacity: 1', 'opacity: 0.9', 'opacity: 0.8', 'opacity: 0.7', 'opacity: 0.6', 'opacity: 0.5', 'opacity: 0.4', 'opacity: 0.3', 'opacity: 0.2', 'opacity: 0.1'];
    @track double = true;

    //For Stencil
    @track stencilClass = '';
    @track stencilReplacement = 'slds-hide';  
    //css
    @track myPadding = 'slds-modal__content';
    /*Create Record End*/

    searchTerm;
    @track valueObj;
    href;
    @track options; //lookup values
    @track isValue;
    @track blurTimeout;

    blurTimeout;

    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';

    connectedCallback() {
        
        console.log("objName", this.objName);
       // FIELDS.push(this.objName+'.Name');
        console.log("FIELDS", FIELDS);
    }
    renderedCallback() {
        if(this.objName) {
            let temp = this.objName;
            if(temp.includes('__c')){
                let newObjName = temp.replace(/__c/g,"");
                if(newObjName.includes('_')) {
                    let vNewObjName = newObjName.replace(/_/g," ");
                    this.objLabelName = vNewObjName;
                }else {
                    this.objLabelName = newObjName;
                }
                
            }else {
                this.objLabelName = this.objName;
            }
        }

        console.log("In rendered", this.objName);
    }

    //Used for creating Record Start
    @wire(getObjectInfo, { objectApiName: '$objName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;

            let recordTypeInfos = Object.entries(this.record.recordTypeInfos);
            console.log("ObjectInfo length", recordTypeInfos.length);
            if (recordTypeInfos.length > 1) {
                let temp = [];
                recordTypeInfos.forEach(([key, value]) => {
                    console.log(key);
                    if (value.available === true && value.master !== true) {
                        console.log("Inside ifff",JSON.stringify(key,value));
                        
                        temp.push({"label" : value.name, "value" : value.recordTypeId});
                    }
                });
                this.recordTypeOptions = temp;
                console.log("recordTypeOptions", this.recordTypeOptions);
            } else {
                this.recordTypeId = this.record.defaultRecordTypeId;
            }

            console.log("this.recordTypeOptions", JSON.stringify(this.recordTypeOptions));
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }
    //Used for creating Record End

    @wire(lookUp, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
    wiredRecords({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            this.options = this.record;
            console.log("common this.options", JSON.stringify(this.options));
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("wire.error",this.error);
        }
    }

    //To get preselected or selected record
    @wire(getRecord, { recordId: '$valueId', fields: FIELDS })
    wiredOptions({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            this.valueObj = this.record.fields.Name.value;
            this.href = '/'+this.record.id;
            this.isValue = true;
            console.log("this.href", this.href);
            console.log("this.record", JSON.stringify(this.record));
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }

    //when valueId changes
    valueChange() {
        console.log("In valueChange");
    }

    handleClick() {
        console.log("In handleClick");

        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
        //let combobox = this.template.querySelector('#box');
        //combobox.classList.add("slds-is-open"); 
    }

    inblur() {
        console.log("In inblur");
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        console.log("In onSelect");
        let ele = event.currentTarget;
        let selectedId = ele.dataset.id;
        console.log("selectedId", selectedId);
        //As a best practise sending selected value to parent and inreturn parent sends the value to @api valueId
        let key = this.uniqueKey;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, key },
        });
        this.dispatchEvent(valueSelectedEvent);

        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    onChange(event) {
        console.log("In onChange");
        this.searchTerm = event.target.value;
        console.log("searchTerm",this.searchTerm);
    }

    handleRemovePill() {
        console.log("In handleRemovePill");
        this.isValue = false;
        let selectedId = '';
        let key = this.uniqueKey;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, key },
        });
        this.dispatchEvent(valueSelectedEvent);
    }

    createRecordFunc() {
        if (this.recordTypeOptions) {
            this.recordTypeSelector = true;
        }else {
            this.recordTypeSelector = false;
            this.mainRecord = true;
            //stencil before getting data
            this.stencilClass = '';
            this.stencilReplacement = 'slds-hide';
        }
        this.createRecordOpen = true;
    }

    handleRecTypeChange(event) {
        console.log("In handleRecTypeChange", event.target.value);
        this.recordTypeId = event.target.value;
    }

    createRecordMain() {
        this.recordTypeSelector = false;
        this.mainRecord = true;
        //stencil before getting data
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
    }

    handleLoad(event) {
        let details = event.detail;

        if(details) {
            setTimeout(() => {
                this.stencilClass = 'slds-hide';
                this.stencilReplacement = '';
                this.myPadding = 'slds-p-around_medium slds-modal__content';
            }, 1000);
        }

    }

    handleSubmit() {
        this.template.querySelector('lightning-record-form').submit();
    }

    handleSuccess(event) {
 
        this.createRecordOpen = false;
        this.mainRecord = false;
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';

        let selectedId = event.detail.id;
        let key = this.uniqueKey;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, key },
        });
        this.dispatchEvent(valueSelectedEvent);

        this.dispatchEvent(
            new ShowToastEvent({
                title : 'Success',
                message : `Record saved successfully with id: ${event.detail.id}`,
                variant : 'success',
            }),
        )
    }

    handleError() {

        this.dispatchEvent(
            new ShowToastEvent({
                title : 'Error',
                message : 'Error saving the record',
                variant : 'error',
            }),
        )
    }

    closeModal() {
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
        this.createRecordOpen = false;
        this.recordTypeSelector = false;
        this.mainRecord = false;
    }
}
```
<br>
**LookUp.css**
```css
.pillSize{
    width : 100%
}


lightning-radio-group .slds-radio_faux {
    margin-right: 10px;
}

.slds-modal__content{
    overflow: initial;
}
```
<br>
**LookupController.apxc**
```java
public class LookupController {

    @AuraEnabled(cacheable=true)
    public static List<sObject> lookUp(String searchTerm, string myObject, String filter) {
        String myQuery = null;
        
        if(filter != null && filter != ''){
            myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' AND '+filter+' LIMIT  5'; 
        }
        else {
            if(searchTerm == null || searchTerm == ''){
                myQuery = 'Select Id, Name from '+myObject+' Where LastViewedDate != NULL ORDER BY LastViewedDate DESC LIMIT  5'; 
            }
            else {
                myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' LIMIT  5';
            }
        }
        
        List<sObject> lookUpList = database.query(myQuery);

        return lookUpList;  
    }
}
```
<br>
**Implementation**
```html
<aura:component controller="ContactController" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,forceCommunity:availableForAllPageTypes,force:lightningQuickAction" access="global" >
    
    <aura:attribute name="recordId" type="String"/>
    <aura:attribute name="record" type="Object"/>
    <aura:attribute name="loaded" type="Boolean" default="false"/>
    <aura:attribute name="iconName" type="String" default="utility:refresh"/>
    
    <aura:handler name="init" value="{!this}" action="{!c.doInit}"/>
    
    
    <lightning:card title="Update Record Aura">
        <aura:set attribute="actions">
            <lightning:buttonIcon aura:id="refreshIcon" iconName="{!v.iconName}" onclick="{!c.refresh}" alternativeText="Refresh"/>
        </aura:set>
        <form>
            <div class="slds-p-around_small">
                <lightning:input label="First Name" value="{!v.record.FirstName}"/>
                <lightning:input label="Last Name" value="{!v.record.LastName}"/>
                <lightning:input label="Email" value="{!v.record.Email}"/>
                
  

                <c:LookupUpdated valueId="{!v.record.AccountId}"
                                 objName="Account"
                                 iconName="standard:account"
                                 labelName="Account"
                                 readOnly="false"
                                 />

                
                <c:LookupUpdated valueId="{!v.record.Id}"
                                 objName="Contact"
                                 iconName="standard:contact"
                                 labelName="Contact"
                                 readOnly="false"
                                 />
                
                
                <br></br>
                <lightning:button label="Update" onclick="{!c.save}"/>
            </div>
            <aura:if isTrue="{! !v.loaded }">
                <lightning:spinner alternativeText="Loading" />
                
            </aura:if>
            
        </form>
    </lightning:card>
    
</aura:component>
```
<br>
```js
({
 doInit : function(component, event, helper) {
  console.log("In rec Init");
        
        var recId = component.get("v.recordId");
        //For Record Insert usage
        if(!recId) {
            component.set("v.loaded", true);
            //return;
        }
        var action = component.get("c.example");
        action.setParams({
            recId : recId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if(state === 'SUCCESS') {
                var result = response.getReturnValue();
                console.log("In result", JSON.stringify(result));
                component.set("v.record", result);
                 component.set("v.iconName", "utility:refresh");
                component.set("v.loaded", true);
            }
        });
        $A.enqueueAction(action);
 },
    
    save : function(component, event, helper) {
        console.log("In save");
        
        component.set("v.loaded", false);
        
        var rec = component.get("v.record");
        console.log("Kishore rec", rec);
        var action = component.get("c.example1");
        action.setParams({
            record : rec
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if(state === 'SUCCESS') {
                console.log("In save Init");
    var init = component.get("c.doInit");
                $A.enqueueAction(init);
            }
        });
        $A.enqueueAction(action);
    },
    
    refresh : function(component, event, helper) {
        component.set("v.iconName", "utility:sync");
        
        component.set("v.loaded", false);
        
        var initMethod = component.get("c.doInit");
        $A.enqueueAction(initMethod);

        //$A.get('e.force:refreshView').fire();
       
    },
    handleChange4 : function(component, event, helper) {
        console.log("In Handle dependent picklist change Aura");
        
        var SelectedValue = event.getParam('selectedValue');
        component.set("v.record.Continent__c", SelectedValue);
    },
    handleChange5 : function(component, event, helper) {
        console.log("In Handle dependent picklist change Aura");
        
        var SelectedValue = event.getParam('selectedValue');
        component.set("v.record.Course__c", SelectedValue);
    },
    
    handleChange1 : function(component, event, helper) {
        console.log("In Handle dependent picklist change Aura");
        
        var SelectedValue = event.getParam('selectedValue');
        component.set("v.record.Country__c", SelectedValue);
    },
    handleChange2 : function(component, event, helper) {
        console.log("In Handle dependent picklist change Aura");
        
        var SelectedValue = event.getParam('selectedValue');
        component.set("v.record.State__c", SelectedValue);
    },
    handleChange3 : function(component, event, helper) {
        console.log("In Handle dependent picklist change Aura");
        
        var SelectedValue = event.getParam('selectedValue');
        component.set("v.record.Subjects__c", SelectedValue);
    },
})
```
In this component, we are using a custom Stencil component to make our component look more real and appealing rather than using the spinner. Get the stencil code here, [Learn more about Stencils](https://github.com/kishoreBandanadam/lwc/tree/master/force-app/main/default/lwc/stencilLwc).

Hope you enjoyed reading this article. You can ask your queries in the comments section below. I would be happy to answer. Please let me know if you find any mistakes.

<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>