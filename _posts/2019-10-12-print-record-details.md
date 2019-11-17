---
layout: post
title: How to Print Record Details in Lightning Experience
date: '2019-10-12T22:25:00.000-07:00'
last_modified_at: 2019-11-03 8:30:00 +0000
categories: [ Lightning Web Components ]
permalink: /2019/10/lookup-in-lwc.html
description: How to Print Record Details in Lightning Experience
Have you ever wondered, or did your client asked you to create a button, which opens the record details in printable form. Then you are in the right place. We will create a component that could actually print the record detail page and even its related records if necessary. We will try two approaches, of which one just includes configuration and other include code.
image: assets/images/print/print-lightning.png
author: kishore
beforetoc: Have you ever wondered, or did your client asked you to create a button, which opens the record details in printable form. Then you are in the right place. We will create a component that could actually print the record detail page and even its related records if necessary.

We will try two approaches, of which one just includes configuration and other include code.

As a best practice first we will go with configuration. Because salesforce always suggests us to use out-of-the-box functionality first, and only use code if that is not possible using configuration.

toc: true
tags:
- Lightning
---

Have you ever wondered, or did your client asked you to create a button, which opens the record details in printable form. Then you are in the right place. We will create a component that could actually print the record detail page and even its related records if necessary.

We will try two approaches, of which one just includes configuration and other include code.

As a best practice first we will go with configuration. Because salesforce always suggests us to use out-of-the-box functionality first, and only use code if that is not possible using configuration.

## Method 1 (Configuration)
1. Select an object for which you want to enable a printable view ("Printable view" 😀 that's what Salesforce calls it). I am using the Account object for the demonstration.
2. Click on the gear icon to the top-right corner and open Setup.
3. Open object manager, search for your required object which in my case is Account and click on the object name which opens object detail page.
4. Navigate to the "**Page Layouts**" tab and select your page layout.
5. Look for "**Salesforce Mobile and Lightning Experience Actions**" section, If you are editing page layout for the first time then you need to do one more thing, that is to click on the Wrench Icon to the extreme right corner of the section, which on hover displays "Override to customize", click on that and now you must be able to see enabled quick action buttons.
6. Check whether "**Printable view**" quick action is available, if not drag and drop it from the panel above.
7. Save the page layout and go back to your record page.

![page-layout](/assets/images/print/page-layout.png)

In the compact layout of the record page, you must be able to see the "Printable View" quick action. Click on that button to generate a printable view.

![printable-view](/assets/images/print/printable-view.png)

It should look something like this displaying record details along with related list details. It's more of a classic look. The good thing is that we get the Salesforce logo and all details just by some simple configuration. We don't have any control over the fields and related lists that are displayed.

## Method 2 (Code)
### Requirements
1. Configure field sets for the object record that you want to print including related objects. Because we are only interested in displaying/printing the important fields.
2. To configure fieldsets, go to setup, select your object, click on fieldsets and create a new fieldset and copy the fieldset name, which we are going to use later.

create an apex class called FieldSet with two methods in it as shown below.
```java
public class FieldSet {
    
    @AuraEnabled
    public static List<String> getFieldSet(String fieldSetName, String sObjectName) {
        List<String> fsmList = new List<String>();
        Schema.FieldSet fieldSet;
        
        Schema.SObjectType myObjectType = Schema.getGlobalDescribe().get(sObjectName);
        Schema.DescribeSObjectResult describe = myObjectType.getDescribe();
        
        //Contains all fieldSets in that object
        Map<String, Schema.FieldSet> FsMap = describe.fieldSets.getMap();
        
        if(FsMap.containsKey(fieldSetName)) {

            fieldSet = describe.fieldSets.getMap().get(fieldSetName);
            
            for(Schema.FieldSetMember fsm : fieldSet.getFields()) {
                fsmList.add(String.valueOf(fsm.getSObjectField()));
            }
        }
        
        if(fsmList != null && fsmList.size() > 0)
            return fsmList;
        else
            return null;
    }
    
    @auraEnabled
    public static List<sObject> getRelatedRecords(String childObjectName, String referenceFieldName, String referenceFieldValue) {
        List<sObject> objList = new List<sObject>();
        
        try {
            
            String query = 'Select Id, Name from ' +childObjectName+ ' where ' +referenceFieldName+ ' =: referenceFieldValue';
            objList = database.query(query);
            return objList;
        }
        catch(exception e) {
            system.debug('e'+e);
            return null;
        }
    }
}
```
<br>
for now concentrate on getFieldSet() method, which takes two parameters 
('fieldSetName', 'sObjectName') 
and returns fieldset values in the form of list of strings.

Next, create a lightning component to the display record and its related records.

**Lightning Component:**
```html
<aura:component controller="FieldSet" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,forceCommunity:availableForAllPageTypes,force:lightningQuickAction" access="global" >
    
    <!-- Gets Values from design attributes-->
    <aura:attribute name="fieldSetName" type="String"/>
    <aura:attribute name="sObjectTypeName" type="String"/>
    <aura:attribute name="objName" type="String"/>

    <aura:handler name="init" value="{!this}" action="{!c.doInit}"/>
    
    <aura:attribute name="recordId" type="String"/>
    <aura:attribute name="fieldSet" type="String[]"/>
    
    <!-- Related list attributes-->
    <aura:attribute name="isRelatedList" type="Boolean"/>
    <aura:attribute name="childObjectName" type="String" default="Contact"/>
    <aura:attribute name="referenceFieldName" type="String"/>
    <aura:attribute name="referenceFieldValue" type="String"/>
    <aura:attribute name="iconName" type="String"/>
    <aura:attribute name="relatedList" type="Object[]"/>


    
    <aura:if isTrue="{!!v.isRelatedList}">
        <div class="slds-p-left_large">
            <lightning:avatar size="large"   
                              src="https://live.staticflickr.com/65535/48735236061_41c4d0c71f_m.jpg" 
                              class="slds-m-right_small"/>
            <div class="slds-text-heading_large">The quick brown fox jumps over the lazy dog.</div>
            <lightning:recordForm recordId="{!v.recordId}"
                                  objectApiName="{!v.sObjectTypeName}"
                                  fields="{!v.fieldSet}"
                                  columns="2"
                                  density="comfy"
                                  mode="readonly"/>
        </div>
    </aura:if>
    
    <aura:if isTrue="{!v.isRelatedList}">
        <div class="slds-p-around_large">
            <lightning:card title="{!v.childObjectName+'s'}">
                <div class="slds-p-around_small">
                    <aura:iteration items="{!v.relatedList}" var="relatedRecord">
                        <aura:if isTrue="{!v.fieldSet}">
                            <lightning:card title="{!relatedRecord.Name}">
                                <div class="slds-p-around_small">
                                    <lightning:recordForm recordId="{!relatedRecord.Id}"
                                                          objectApiName="{!v.sObjectTypeName}"
                                                          fields="{!v.fieldSet}"
                                                          columns="2"
                                                          density="comfy"
                                                          mode="readonly"/>
                                </div>
                            </lightning:card><br></br>
                        </aura:if>
                    </aura:iteration>
                </div>
            </lightning:card>
        </div>
    </aura:if>
</aura:component>
```
<br>
** Controller:**
```js
({
 doInit : function(component, event, helper) {
        
        var isRelatedList = component.get("v.isRelatedList");
        if(isRelatedList) {
            var recId = component.get("v.recordId");
            var action = component.get("c.getRelatedRecords");
            action.setParams({
                childObjectName : component.get("v.childObjectName"),
                referenceFieldName : component.get("v.referenceFieldName"),
                referenceFieldValue : recId
            });
            action.setCallback(this, function(response) {
                console.log("In printData related call back");
                var state = response.getState();
                console.log("state::::", state);
                if(state === 'SUCCESS' || state === 'DRAFT') {
                    var result = response.getReturnValue();
                    component.set("v.relatedList", result);
                    console.log("relatedList::::", result);
                    helper.doInit(component, event, helper);
                }
            });
            $A.enqueueAction(action);
            helper.doInit(component, event, helper);
        }
        else {
            helper.doInit(component, event, helper);
        }
               
 }
})
```
<br>
**Helper:**
```js
({
    doInit : function(component, event, helper) {
  console.log("In printData");
        var recordId = component.get("v.recordId");
        var fieldSetName = component.get("v.fieldSetName");
        var sObjectTypeName = component.get("v.sObjectTypeName");
        console.log("fieldSetName::::", fieldSetName);
        console.log("sObjectTypeName::::", sObjectTypeName);
        
        var action = component.get("c.getFieldSet");
        action.setParams({
            fieldSetName : fieldSetName,
            sObjectName : sObjectTypeName
        });
        action.setCallback(this, function(response) {
            console.log("In printData call back");
            var state = response.getState();
            console.log("state::::", state);
            if(state === 'SUCCESS' || state === 'DRAFT') {
                var result = response.getReturnValue();
                console.log("fieldSet::::", result);
                component.set("v.fieldSet", result);
                                
                console.log("fields::::", JSON.stringify(result));
                var myList = result;
                var jsonString = "";
                for(var i = 0; i < myList.length; i++) {
                    if(jsonString === '')
                        jsonString = myList[i];
                    else
      jsonString = jsonString +','+myList[i];
                }
                var newString = jsonString;
                console.log("newString::::", newString);
                component.set("v.render", true);
            }
        });
        $A.enqueueAction(action);
    },
})
```
<br>
I have used a base lightning component called `lightning:recordForm`, you can use any of your choices. We use the same component to display parent records as well as child records by using the "**isRelatedList**" boolean flag. 

Finally, create a lightning App and reference this component in the app.

**App:**
```html
<aura:application extends="force:slds">
    <aura:attribute name="recordid" type="String"/>
    <aura:attribute name="fieldSetName" type="String"/>
    <aura:attribute name="sObjectTypeName" type="String"/>
    <aura:attribute name="objName" type="String"/>
    
    <div class="slds-clearfix slds-p-around_medium">
        <div class="slds-float_right">
            <lightning:button aura:id="printButton" class="" label="Print" onclick="{!c.print}"/>
        </div>
    </div>

    <c:PrintData recordId="{!v.recordid}" fieldSetName="FieldsToPrint" sObjectTypeName="Account"/>
    
    <c:PrintData recordId="{!v.recordid}" 
                 fieldSetName="contactFieldSet" 
                 sObjectTypeName="Contact"
                 isRelatedList="true"
                 childObjectName="Contact"
                 referenceFieldName="AccountId"
                 iconName="standard:contact"/>
</aura:application>
```
<br>
**App Controller:**
```js
({
    print : function(component, event, helper) {
        var printButton = component.find('printButton');
        
        $A.util.toggleClass(printButton, 'slds-hide');
        event.preventDefault();
        window.print();
        $A.util.toggleClass(printButton, 'slds-hide');
 }
})
```
<br>
Just a few more steps to go,

Create a "Custom button" with display type = "detail page button"  and Content Source = "URL" then, in the editor paste the below URL replacing App name, Fieldset name and object name with yours.

`/c/YourAppName.app?recordid={!Account.Id}&fieldSetName=FieldsSetName&sObjectTypeName=Account&objName={!Account.Name}`

Add the button to your page layout and make necessary changes in the App above and you are good to go.

![print-preview](/assets/images/print/Print-preview.png)

Here is the windows browser print preview in portrait mode.

<div class="canva-embed" data-design-id="DADlh9i9RaY" data-height-ratio="1.4143" style="background: rgba(0 , 0 , 0 , 0.03); border-radius: 8px; padding: 141.4286% 5px 5px 5px;">
</div>
<script async="" src="https://sdk.canva.com/v1/embed.js"></script>


I hope you like this information. If you have any thoughts please write them in the comments section below.

If you find any mistakes please let me know.

For your information, the round, blue, plus button to the bottom right corner, is a lightning web component, Please click the button and subscribe for more updates on Salesforce LWC.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>