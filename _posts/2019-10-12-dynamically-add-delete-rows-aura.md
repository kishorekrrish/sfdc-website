---
layout: post
title: Dynamically Add/Delete Rows in Salesforce Lightning
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning, Apex ]
permalink: /2019/05/dynamically-adddelete-rows-in.html
description: Create a salesforce lightning component which can add and delete rows dynamically. You can build this component in less than 5 minutes using simple Html and js.
image: assets/images/add-delete/add-remove-header.png
toc: true
author: kishore
tags:
- Lightning
---
## What is Dynamic Rows!
Dynamically Add/Delete Rows is a component in which we can add and delete rows dynamically on the user interface by simple clicks. It can be used where multiple rows are to be added in a list or to be deleted as per the requirement without hard coding the number of rows in the code.

<iframe style="width:100%;" height="315" src="https://www.youtube.com/embed/Wm98VvVSKDA" frameborder="0" allowfullscreen></iframe>

## Why use Dynamic Rows!
Salesforce has provided standard lightning:datatable why can't we use this. You can use the standard data table as well but real challenge comes when the data comprises of fields like look up and pick list.

## How to use Dynamic Rows!
For building this component we are going to create following components and controllers.

- DynamicRows (Child)
- DynamicRowsParent (Parent)
- dynamicRowsController (Apex Controller)

![Dynamically Add/Delete Rows in Salesforce Lightning]({{site.url}}/assets/images/add-delete/add-delete.png)

This is just a simple example, customize it more as per your requirement.

> Styling: I have used lightning:layout and lightning:layoutItem in a card. You can find these components in Lightning Component library.you can use any of the styling as per your convenience.

Related: [Editable List in LWC]({{site.url}}/2019/04/blog-post.html)

## How two way binding makes our task simpler:
Lightning Aura components supports two types of data binding

`{#expression}`(Unbound Expression) Data updates behave as you would expect in JavaScript. Primitives, such as String, are passed by value, and data updates for the expression in the parent and child are decoupled.Objects, such as Array or Map, are passed by reference, so changes to the data in the child propagate to the parent. However, change handlers in the parent aren’t notified. The same behavior applies for changes in the parent propagating to the child.

`{!expression}` (Bound Expression) Data updates in either component are reflected through bidirectional data binding in both components. Similarly, change handlers are triggered in both the parent and child components.

As we have used bound expression in our parent component, The attribute records can be changed by the child component as well, which reduces our work of not using component events in order to get data entered in child. If you are not familiar about communication of components through event please get some knowledge about events.

> Note: If you are trying to implement the same using Lightning Web Components be ware that [LWC only supports one way binding]({{site.url}}/2019/09/blockers-in-lwc.html). If you experienced something like this please write in the comments below so that we can discuss.

## array.splice()
splice() is a Javascript method which adds/removes items to/from an array, and returns the removed item(s).

syntax: `array.splice(index, count, item1, ....., itemX)`

|  Parameter  |  Description  |
|-----|----|
|  index  |  Required. An integer that specifies at what position to add/remove items, Use negative values to specify the position from the end of the array | 
|  count  |  Optional. The number of items to be removed. If set to 0, no items will be removed  |
|  item1, ..., itemX  |  Optional. The new item(s) to be added to the array  |


**DynamicRows.cmp**
```html
<aura:component implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >
    
    <aura:attribute name="record" type="Object" default="{
                                                         'sobjectType' : 'Account',
                                                         'Name' : '',
                                                         'Industry' : '' }"/>
    

        <lightning:layoutItem size="4" padding="around-small">
            <lightning:input label="name" value="{!v.record.Name}" variant="label-hidden"/>
        </lightning:layoutItem>
        <lightning:layoutItem size="4" padding="around-small">
            <lightning:input label="Industry" value="{!v.record.Industry}" variant="label-hidden"/>
        </lightning:layoutItem>
    
</aura:component>
```
<br>
**DynamicRowsParent.cmp**
```html
<aura:component controller="dynamicRowsController" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >
    
    <aura:attribute name="records" type="Object[]"/>
    <aura:attribute name="rows" type="Integer"/>
    <aura:attribute name="visible" type="Boolean" default="false"/>
    
    
    <aura:handler name="init" value="{!this}" action="{!c.doinit}"/>
    
    <lightning:card title="Add/Delete Rows Dynamically">
        <aura:set attribute="actions">
            <a onclick="{!c.add}">
                <lightning:icon iconName="utility:add" alternativeText="add"/>
            </a>
        </aura:set>
        <table class="slds-table slds-table_cell-buffer slds-table_bordered">
            <thead>
                <tr class="slds-line-height_reset">
                    <lightning:layout>
                        <lightning:layoutItem  flexibility="auto, no-grow">
                            <th class="" scope="col">
                                <div class="slds-truncate" title="Sno">S.No</div>
                            </th>
                        </lightning:layoutItem>
                        <lightning:layoutItem size="4" >
                            <th class="" scope="col">
                                <div class="slds-truncate" title="Opportunity Name">Name</div>
                            </th>
                        </lightning:layoutItem> 
                        <lightning:layoutItem size="4" >
                            <th class="" scope="col">
                                <div class="slds-truncate" title="Opportunity Name">Industry</div>
                            </th>
                        </lightning:layoutItem> 
                        <lightning:layoutItem size="4" >
                            <th class="" scope="col">
                                <div class="slds-truncate" title="Opportunity Name">Action</div>
                            </th>
                        </lightning:layoutItem> 
                    </lightning:layout>
                </tr>
            </thead>
        </table>
        
        <aura:iteration items="{!v.records}" var="rec" indexVar="index">
            
            <lightning:layout>
                <lightning:layoutItem  padding="around-small" flexibility="auto, no-grow">
                    <div class="slds-text-heading_small slds-text-align_center">{!index + 1}.</div>
                </lightning:layoutItem>
                <c:dynamicRows record="{!rec}"/>
                <lightning:layoutItem size="4" padding="around-small">
                    <a name="{!index}" onclick="{!c.remove}">
                        <lightning:icon iconName="utility:delete" alternativeText="delete"/>
                    </a>
                </lightning:layoutItem>
            </lightning:layout>
        </aura:iteration>
       
        <div class="slds-grid slds-grid_reverse">
            <div class="slds-col slds-size_4-of-12 ">
                <aura:if isTrue="{!v.visible}">
                    <div class="slds-p-top_small">
                        Saved {!v.rows} records...
                    </div>
                </aura:if>
            </div>
            <div class="slds-col slds-size_2-of-12">
             <lightning:button label="Save" onclick="{!c.save}" variant="brand"/>
            </div>
        </div>
        
    </lightning:card>
</aura:component>
```
<br>
**DynamicRowsParent.js**
```js
({
    doinit : function(component, event, helper) {
        console.log("In dynamic init");
        
        var initRec = {'sobjectType' : 'Account','Name' : '','Industry' : '' };
        component.set("v.records", initRec);
    },
    
    add : function(component, event, helper) {
        var addRec = {'sobjectType' : 'Account','Name' : '','Industry' : '' };
        var existingRecords = component.get("v.records");
        existingRecords.push(addRec);
        component.set("v.records", existingRecords);
    },
    
    remove : function(component, event, helper) {
        
        var indexPosition = event.target.name;
        var existingRecords = component.get("v.records");
        console.log("indexPosition",indexPosition);
        existingRecords.splice(indexPosition, 1);
        component.set("v.records", existingRecords);
        //splice(indexPosition, howmany, item1, ....., itemX)
    },
    
    save : function(component, event, helper) {
        
        var existingRecords = component.get("v.records");
        var validRecords = [];
        
        for(var i = 0; i < existingRecords.length; i++) {
            if(existingRecords[i].Name != "") {
                validRecords.push(existingRecords[i]);
            }
        }
        component.set("v.records", validRecords);
        component.set("v.rows", validRecords.length);
        
        
        console.log("validRecords", JSON.stringify(validRecords));
        console.log("valid Records length", validRecords.length);
        
        var action = component.get("c.saveaccs");
        action.setParams({
            'inprec' : validRecords
        });
        
        action.setCallback(this, function(response){
           var state = response.getState();
            if(state === 'SUCCESS' || state === 'DRAFT'){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title : 'Message',
                    message: 'Records saved successfully',
                    duration:' 3000',
                    key: 'info_alt',
                    type: 'success',
                    mode: 'pester'
                });
                toastEvent.fire();
                component.set("v.visible", true);
                window.setTimeout(
                    $A.getCallback(function() {
                        component.set("v.visible", false);
                    }), 3000);
                
            }
            else if(state === 'ERROR' || state === 'WARNING'){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title : 'Message',
                    message: 'No Records saved successfully',
                    duration:' 3000',
                    key: 'info_alt',
                    type: 'error',
                    mode: 'pester'
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
        
    }
    
})
```
<br>
**DynamicRowsController.apxc**
```js
public with sharing class dynamicRowsController {
    
    @AuraEnabled
    public static void saveaccs(List inprec){
        if(inprec.size()>0 && inprec != null){
            list inputrec =  inprec;
            insert inputrec;
        }
    }
    
}
```
<br>
If you think there are better ways doing this, please write it in the comments below.

## Also Read

[Editable List with files and notify option in Salesforce Lightning (Aura)]({{site.url}}/2019/05/editable-list-with-files-and-notify.html)

[Create a Custom Component to Send an Email in Salesforce Lightning]({{site.url}}/2019/04/create-custom-component-to-send-email.html)

[Custom Lookup Component in Salesforce Lightning - Updated]({{site.url}}/2019/05/custom-lookup-component-in-salesforce.html)


If you enjoyed this blog post, share it with your group!

Subscribe, to get latest updates directly in your inbox.

