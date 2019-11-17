---
layout: post
title: Create a Custom Component to Send an Email in Salesforce Lightning
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning, Apex ]
permalink: /2019/04/create-custom-component-to-send-email.html
description: Create a Custom Component to Send an Email in Salesforce Lightning. In this post we are going to see a custom component which can send emails with attachments. We will use Apex SingleEmailMessage. When we pass a list of contact or user record Id's, it automatically fetches emails for those record, making our life easy.
image: assets/images/send-email/send-email.png
toc: true
author: kishore
tags:
- Lightning
---

##SCENARIO
Create a custom email wizard which allows the users to notify respective contacts and other users about some event in contact record detail page. Show toast messages on success and failure of sending an email.

In this post we are going to see a custom component which can send emails with attachments. We will use Apex SingleEmailMessage. When we pass a list of contact or user record Id's, it automatically fetches emails for those record, making our life easy.

![Create a Custom Component to Send an Email in Salesforce Lightning](/assets/images/send-email/notify-gif.png)

**Controllers:**
- NotifyController.apxc

**Components:**

- NotifyModal.cmp
- NotifyModal.js

- CustomLookUpComp.cmp
- CustomLookUpComp.js

- selectAttachments.cmp
- selectAttachments.js

- AttachmentUploader.cmp
- AttachmentUploader.js

**Events:**
- CustomLookUpFinalValueEvent.evt
- selectedAttachmentsNotifyEvent.evt

![Create a Custom Component to Send an Email in Salesforce Lightning](/assets/images/send-email/notify.png)

**NotifyModal.cmp:**
```html
<!-- NotifyModal -->
<aura:component controller="NotifyController" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickActionWithoutHeader" access="global" >
    
    
    
    <aura:attribute name="recordId" type="Id"/>
    <aura:attribute name="open" type="Boolean" default="false"/>
    <aura:attribute name="ownerId" type="Map[]"/>
    <aura:attribute name="selected" type="Map[]"/>
    <aura:attribute name="fvalues" type="Map[]"/>
    <aura:attribute name="cCUser" type="Map[]"/>
    <aura:attribute name="cCContact" type="Map[]"/>
    <aura:attribute name="toUser" type="Map[]"/>
    <aura:attribute name="toContact" type="Map[]"/>
    <aura:attribute name="subject" type="String"/>
    <aura:attribute name="body" type="String"/>
    
    <aura:handler name="init" value="{!this}" action="{!c.doinit}"/>
 
    
    <!-- Handling to get Final values of lookups -->
    <aura:handler name="CustomLookUpFinalValueEvent" event="c:CustomLookUpFinalValueEvent" action="{!c.finalValueAction}"/>
    <!-- handling onselect values while attaching docs -->
    <aura:handler name="selectedAttachmentsNotifyEvent" event="c:selectedAttachmentsNotifyEvent" action="{!c.selectedAction}"/>
    
    <header class="slds-modal__header slds-p-bottom_large">
        
        <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Notify</h2>
    </header>
    
    
    <div class="slds-grid slds-gutters slds-p-bottom_large slds-p-top_large"> 
        <div class="slds-col slds-size_2-of-12">
            <div class="slds-text-heading_small">To:</div>
        </div>
        <div aura:id="toContact" class="slds-col slds-size_5-of-12">
            <c:CustomLookUpComp uniqueName="toContact"
                                iconName="standard:contact"
                                methodName="c.getContacts"
                                singleSelect="false"
                                sObject="Contact"
                                />   
        </div>
        <div class="slds-col slds-size_5-of-12">
            <c:CustomLookUpComp uniqueName="toUser"
                                iconName="standard:user"
                                methodName="c.getUsers"
                                singleSelect="false"
                                sObject="User"
                                />   
        </div>
    </div>
    <div class="slds-grid slds-gutters"> 
        <div class="slds-col slds-size_2-of-12">
            <div class="slds-text-heading_small">cC:</div>
        </div>
        <div class="slds-col slds-size_5-of-12">
            <c:CustomLookUpComp uniqueName="cCContact"
                                iconName="standard:contact"
                                methodName="c.getContacts"
                                singleSelect="false"
                                sObject="Contact"
                                />   
        </div>
        <div class="slds-col slds-size_5-of-12">
            <c:CustomLookUpComp aura:id="Record"
                                uniqueName="cCUser"
                                iconName="standard:user"
                                methodName="c.getUsers"
                                singleSelect="false"
                                sObject="User"
                                selected="{!v.ownerId}"
                                />   
        </div>
    </div>
    
    <div class="slds-grid slds-gutters slds-p-top_large slds-p-bottom_large"> 
        <div class="slds-col slds-size_2-of-12">
            <div class="slds-text-heading_small">Subject:</div>
        </div>
        <div class="slds-col slds-size_10-of-12">
            <lightning:input variant="label-hidden" value="{!v.subject}" placeholder="Subject"/>
        </div>
    </div>
    
    <div class="slds-grid slds-gutters slds-p-top_large"> 
        <div class="slds-col slds-size_2-of-12">
            <div class="slds-text-heading_small">Message:</div>
        </div>
        <div class="slds-col slds-size_10-of-12">
            <lightning:inputRichText value="{!v.body}" placeholder="Email body...."/>
        </div>
    </div>
    
    <div class="slds-p-left_medium">
        <aura:iteration items="{!v.selected}" var="l">
            <li class="slds-listbox-item slds-truncate" role="presentation"> 
                <aura:if isTrue="{! v.selected}">
                    <lightning:pill class="" label="{!l.Title}" name="{!l}" onremove="{! c.handleRemoveOnly }" href="{!'/'+(l.Id)}"/>
                    
                </aura:if>
            </li>
        </aura:iteration>
    </div>
    

    
    <div class="slds-button-group slds-m-top_large slds-p-right_medium slds-float_right" style="margin-top: 2rem;" role="group">
		<lightning:button class="slds-m-top_medium slds-float_right" label="Attach" onclick="{!c.toOpenAttachments}"/>
        <lightning:button class="slds-m-top_medium slds-float_right" variant="brand" label="Notify" onclick="{!c.sendMail}"/>
    </div>
    
    <div class="slds-button slds-m-top_medium slds-float_right">
        <c:AttachmentUploader recordId="{!v.recordId}"/>
    </div>
    
    
    <c:selectAttachments isOpen="{!v.open}" recordId="{!v.recordId}"/> 
    <lightning:notificationsLibrary aura:id="notifLib"/>
    
</aura:component>
```
<br>
**NotifyModal.js:**
```js
({
    doinit : function(component, event, helper) {
        
        console.log("In Notify Doinit");
        var recid = component.get("v.recordId");
        console.log("recId:: "+recid);
        if(recid){
            var action = component.get("c.getContactOwners");
            action.setParams({
                recId : recid
            });
            
            action.setCallback(this, function(response){
                console.log("In call back doinit notify");
                var state = response.getState();
                console.log(state);
                if(state === "SUCCESS"){
                    var result = response.getReturnValue();
                    console.log("Result");
                    console.log(JSON.stringify(result));
                    component.set("v.ownerId", result);
                    
                    console.log("owner result");
                    console.log(result);
                    var childComp = component.find("Record");
                    console.log("childComp");
                    console.log(childComp);
                    childComp.prePopulateMethod(result);
                    
                }
               
            });
            $A.enqueueAction(action);
        }
    },
    
    finalValueAction : function(component, event, helper) {
        console.log("Handling Final value event");
        var values = event.getParams();
        console.log(JSON.stringify(values));
        
        //debugger;
        
        if(values.uniqueName === "cCUser"){
            console.log(values.finalValue.length);
            var cUser = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                cUser.push(values.finalValue[i].Id);
            }
            
            component.set("v.cCUser", cUser);   
            console.log("cUser");
            console.log(JSON.stringify(cUser));
        }
        
        if(values.uniqueName === "cCContact"){
            
            var cContact = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                cContact.push(values.finalValue[i].Id);
            }
            
            component.set("v.cCContact", cContact);  
            console.log("cContact");
            console.log(JSON.stringify(cContact));
        }
        
        if(values.uniqueName === "toUser"){
            
            var tUser = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                tUser.push(values.finalValue[i].Id);
            }
            
            component.set("v.toUser", tUser);
            console.log("tUser");
            console.log(JSON.stringify(tUser));
        }
        
        if(values.uniqueName === "toContact"){
            
            var tContact = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                tContact.push(values.finalValue[i].Id);
            }
            
            component.set("v.toContact", tContact);
            console.log("tContact");
            console.log(JSON.stringify(tContact));
        }
        
    },
    
    sendMail : function(component, event, helper) {
        //debugger;
        var cU = component.get("v.cCUser");
        console.log(JSON.stringify(cU));
        var cC = component.get("v.cCContact");
        console.log(JSON.stringify(cC));
        var tU = component.get("v.toUser");
        console.log(JSON.stringify(tU));
        var tC = component.get("v.toContact");
        console.log(JSON.stringify(tC));
        
        console.log("In send mail action");
        let c = [];
        if(cU.length > 0){
            for(var i = 0; i < cU.length; i++){
                c.push(cU[i]);
            }
        }
        if(cC.length > 0){
            for(var i = 0; i < cC.length; i++){
                c.push(cC[i]);
            }
        }
        
        let t = [];
        if(tU.length > 0){
            for(var i = 0; i < tU.length; i++){
                t.push(tU[i]);
            }
        }
        if(tC.length > 0){
            for(var i = 0; i < tC.length; i++){
                t.push(tC[i]);
            }
        }
        console.log(JSON.stringify(c));
        console.log(JSON.stringify(t));
        var emailSubject = component.get("v.subject");
        console.log(emailSubject);
        var emailBody = component.get("v.body");
        console.log(emailBody);
        var fileIds = component.get("v.selected");
        var file = [];
        for(var i = 0; i < fileIds.length; i++){
            file.push(fileIds[i].Id);
        }
        console.log("file");
        console.log(file);
        
        var action = component.get("c.sendEmailApex");
        action.setParams({
            "toAddress" : t,
            "ccAddress" : c,
            "subject" : emailSubject,
            "body" : emailBody,
            "files" : file
        });
        
        action.setCallback(this, function(response){
            console.log("In call back of notify component on send button");
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                console.log("In success");
                /*var toast = $A.get("e.force:showToast");
                toast.setParams({
                    "title" : "Success!",
                    "message" : "Notify message sent successfully sent",
                    "type" : "success"
                });
                toast.fire();*/
                var message = component.find("notifLib").showNotice({
                    variant : "success",
                    header : "Message sent successfully",
                    message : "Notify message was sent successfully"
                    
                });
                 $A.get("e.force:closeQuickAction").fire();
                
            }else if(state === "ERROR"){
                console.log("In error");
                var errors = response.getError();
                console.log(errors);
                
                /*var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title" : "Error!",
                    "message" : errors[0].message,
                    "type" : "error"
                });
                toastEvent.fire();*/
                var message = component.find("notifLib").showNotice({
                    variant : "error",
                    header : "Error sending the message",
                    message : errors[0].message
                    
                });
                
            }
        });
        $A.enqueueAction(action);
    },
    
    toOpenAttachments : function(component, event, helper) {
        console.log("Opened small modal to select attachments");
        component.set("v.open", true);
    },
    
    selectedAction : function(component, event, helper) {
        console.log("Opened selectedAction");
        
        var select = event.getParam("selectedIds");
        component.set("v.selected", select);
        
    },
    
    handleRemoveOnly : function(component, event, helper) {
        console.log("in remove");
        var sel = event.getSource().get("v.name");
        console.log(JSON.stringify(sel));
        var lis = component.get("v.selected");
        console.log(JSON.stringify(lis));
        for(var i = 0; i < lis.length; i++){
            console.log(JSON.stringify(lis[i]));
            console.log(lis[i].Id);
            console.log(sel.Id);
            console.log(lis[i].Id == sel.Id);
            if(lis[i].Id == sel.Id){
                
                lis.splice(i,1);
            }
        }
        
        component.set("v.selected", lis);
        console.log(JSON.stringify(lis));
    },

})
```
<br>
**CustomLookUpComp.cmp**
```html
<!-- CustomLookUpComp -->
<aura:component controller="ContactController" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,forceCommunity:availableForAllPageTypes,force:lightningQuickAction" access="global" >
    
    <!-- Main attributes Start -->
    <aura:attribute name="uniqueName" type="String" required="true" default="lookup1"/><!--If not entered it takes default value-->
    <aura:attribute name="iconName" type="String" default="standard:contact" required="true"/>
    <aura:attribute name="methodName" type="String" default="c.getContacts" required="true"/>
    <aura:attribute name="singleSelect" type="Boolean" default="true"/>
    <aura:attribute name="sObject" type="String" default="Contact" required="true"/>
    <aura:attribute name="selected" type="Map[]"/><!--Optional If you want any pre-population can use this to pass that record value-->
    <!-- Main attributes End -->
    
    <aura:attribute name="sTerm" type="string" default=""/>
    <aura:attribute name="conList" type="Map[]"/>
    <aura:attribute name="blurTimeout" type="Integer"/>
    
    <!-- Register Final value Event -->
    <aura:registerEvent name="CustomLookUpFinalValueEvent" type="c:CustomLookUpFinalValueEvent"/>
    
    <!-- Handlers -->
    <aura:handler name="init" value="{!this}" action="{!c.doInit}"/>
    <aura:handler name="LookupEventToParent" event="c:LookupEventToParent" action="{!c.handleEvent}"/>
    
    <!-- Method to send pre-populate lookUp value to the requested component: parent to lookup-->
    <aura:method name="prePopulateMethod" action="{!c.render}">
        <aura:attribute name="populatedRecord" type="Map[]"/>
    </aura:method>
    
    <aura:if isTrue="{!v.singleSelect}">
        <div class="slds-form-element">
            <div class="slds-form-element__control">
                <div class="slds-combobox_container slds-has-selection">
                    <div aura:id="toOpen" class="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-expanded="true" aria-haspopup="listbox" role="combobox">
                        <div class=" slds-input-has-icon slds-input-has-icon_right" role="none">
                            
                            <div>
                                <div aura:id="input" class="slds-p-top_none" >
                                    <lightning:input class="slds-p-top_none" variant="label-hidden" name="Search" value="{!v.sTerm}" onblur="{!c.onblur}" onclick="{!c.onfocus}" onchange="{!c.onchange}" placeholder="{!'Select ' + (v.sObject)}"/>
                                    
                                    <span class="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right ">
                                        <span class="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                            <lightning:icon class="" iconName="utility:search" size="x-small" alternativeText="Search" />
                                        </span>
                                    </span>
                                </div>
                                <aura:if isTrue="{!v.selected}">
                                    <div aura:id="lookup-pill" class="slds-pill-container slds-hide">
                                        <aura:iteration items="{!v.selected}" var="l">
                                            <lightning:pill class="pillSize" label="{!l.Name}" name="{!l}" onremove="{! c.handleRemoveOnly }" href="{!'/'+(l.Id)}">
                                                <aura:set attribute="media">
                                                <lightning:icon iconName="{!v.iconName}"  alternativeText="{!v.iconName}"/>
                                                </aura:set>
                                            </lightning:pill>
                                        </aura:iteration>
                                    </div>
                                </aura:if>
                            </div>
                            
                        </div>
                        <div onfocus="{!c.onfocus}" id="listbox-id-1" class="slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid" role="listbox">
                            <ul class="slds-listbox slds-listbox_vertical" role="presentation">
                                <aura:iteration items="{!v.conList}" var="listItem">
                                    <span ><c:childLookUp myContact="{!listItem}" icon="{!v.iconName}" object="{!v.sObject}"/></span>
                                </aura:iteration>
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Multi Select Start-->
        <aura:set attribute="else">
            <div class="slds-form-element">
                <div class="slds-form-element__control">
                    <div class="slds-combobox_container slds-has-selection">
                        <div aura:id="toOpen" class="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-expanded="true" aria-haspopup="listbox" role="combobox">
                            <div class=" slds-input-has-icon slds-input-has-icon_right" role="none">
                                
                                <div>
                                    
                                    <lightning:input class="slds-p-top_none" variant="label-hidden" name="Search" value="{!v.sTerm}" onblur="{!c.onblur}" onclick="{!c.onfocus}" onchange="{!c.onchange}" placeholder="{!'Select ' + (v.sObject)}"/>
                                    
                                    <span class="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                                        <span class="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                            <lightning:icon iconName="utility:search" size="x-small" alternativeText="Search" />
                                        </span>
                                    </span>     
                                    
                                </div>
                                
                            </div>
                            <div onfocus="{!c.onfocus}" id="listbox-id-1" class="slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid" role="listbox">
                                <ul class="slds-listbox slds-listbox_vertical" role="presentation">
                                    
                                    <aura:iteration items="{!v.conList}" var="listItem">
                                        <span ><c:childLookUp myContact="{!listItem}" icon="{!v.iconName}" object="{!v.sObject}"/></span>
                                    </aura:iteration>
                                    
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!--div class="slds-listbox_selection-group slds-listbox-toggle"-->
                    
                    <ul class="slds-listbox slds-listbox_horizontal" role="listbox" aria-label="Selected Options:" aria-orientation="horizontal">
                        <aura:iteration items="{!v.selected}" var="l">
                            <li class="slds-listbox-item slds-truncate" role="presentation"> 
                                <aura:if isTrue="{! v.selected}">
                                    <lightning:pill class="" label="{!l.Name}" name="{!l}" onremove="{! c.handleRemoveOnly }" href="{!'/'+(l.Id)}">
                                        <aura:set attribute="media">
                                        <lightning:icon iconName="{!v.iconName}" alternativeText="{!v.iconName}"/>
                                        </aura:set>
                                    </lightning:pill>
                                </aura:if>
                            </li>
                        </aura:iteration>
                    </ul>
                   
                <!--/div-->
            </div>
        </aura:set> 
        <!-- Multi Select End-->
    </aura:if>
</aura:component>
```
<br>
**CustomLookUpCompController.js:**
```js
({
    doInit : function(component, event, helper) {
		helper.doInit(component, event, helper);
    },
    
    render : function(component, event, helper) {
		helper.render(component, event, helper);
    },
    
    onchange : function(component, event, helper) {
        helper.onchange(component, event, helper);
    },
    
    onblur : function(component, event, helper) {
        helper.onblur(component, event, helper);
    },
    
    onfocus : function(component, event, helper) {
        helper.onfocus(component, event, helper);
    },
    
    handleRemoveOnly : function(component, event, helper) {
        helper.handleRemoveOnly(component, event, helper);
    },
    
    onOptionClick : function(component, event, helper) {
        helper.onOptionClick(component, event, helper);
    },
    
    handleEvent : function(component, event, helper) {
        helper.handleEvent(component, event, helper);
    },
})
```
<br>
**CustomLookUpCompHelper.js:**
```js
({	
    doInit : function(component, event, helper) {
   		//As of now does nothing
		
    },
    
    render : function(component, event, helper) {
     //This is to send the prepopulated value through event to parent
        console.log("In render");
        var args = event.getParam("arguments");
        console.log(JSON.stringify(args));
        console.log(JSON.stringify(args.populatedRecord));
        if(args){
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired:: "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : args.populatedRecord                
            });
            finalEvent.fire();
        }else{
            console.log("Didnt get any record to pre-populate");
        }
    },
    
    onchange : function(component, event, helper) {
        
        console.log("Onchange");
        var icon = component.get("v.iconName");
        var Object = component.get("v.sObject");
        
        console.log("icon:: "+icon);
        console.log("Object:: "+Object);
        // Setting method name dynamically
        var methodName = component.get("v.methodName");
        console.log(methodName);
        /*Send this value to server to get values other than in this list*/
        var selected = component.get("v.selected");
        console.log("selected");
        console.log(JSON.stringify(selected));
        
        var action = component.get(methodName);
        var term = component.get("v.sTerm");
        
        action.setParams({
            "searchTerm" :  term,
            "selectedOptions" : selected
        });
        
        if(term.length > 0){
            action.setCallback(this, function(response){
                var state = response.getState();
                console.log(state);
                if(state === "SUCCESS")  {
                    var result = response.getReturnValue();
                    console.log(JSON.stringify(result));
                    console.log(result);
                    component.set("v.conList", result);
                    if(term != "" && result.length > 0){
                        var ToOpen = component.find("toOpen");
                        $A.util.addClass(ToOpen, "slds-is-open");
                    }else{
                        var ToOpen = component.find("toOpen");
                        $A.util.removeClass(ToOpen, "slds-is-open");
                    }
                }
                
            });
            
            $A.enqueueAction(action);
        }
    },
    
    onblur : function(component, event, helper) {
        
        
        //Setting timeout so that we can capture the value onclick
        const blurTimeout = window.setTimeout(
            $A.getCallback(() => {
                var ToOpen = component.find("toOpen");
                $A.util.removeClass(ToOpen, "slds-is-open");
            }),
            300
        );
        component.set('v.blurTimeout', blurTimeout);
    },
    
    onfocus : function(component, event, helper) {
        var term = component.get("v.sTerm");
        var returnedResults = component.get("v.conList");
        console.log("in onfocus");
        console.log(term);
        if(term && returnedResults.length > 0){
            var ToOpen = component.find("toOpen");
            $A.util.addClass(ToOpen, "slds-is-open");
        }
        
    },
    
    handleRemoveOnly : function(component, event, helper) {
        
        var singleSel = component.get("v.singleSelect");
        if(singleSel){
            console.log("in remove");
            var sel = event.getSource().get("v.name");
            console.log(JSON.stringify(sel));
            var lis = component.get("v.selected");
            console.log(JSON.stringify(lis));
            for(var i = 0; i < lis.length; i++){
                console.log(JSON.stringify(lis[i]));
                console.log(lis[i].Id == sel.Id);
                if(lis[i].Id == sel.Id){
                    
                    lis.splice(i,1);
                }
            }
            
            component.set("v.selected", lis);
            console.log(JSON.stringify(lis));
            
            var Input = component.find("input");
            $A.util.removeClass(Input, "slds-hide");
            
            var lookupPill = component.find("lookup-pill");
            $A.util.addClass(lookupPill, "slds-hide");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : lis                
            });
            finalEvent.fire();
            
        }else{
            console.log("in remove");
            var sel = event.getSource().get("v.name");
            console.log(JSON.stringify(sel));
            var lis = component.get("v.selected");
            console.log(JSON.stringify(lis));
            for(var i = 0; i < lis.length; i++){
                console.log(JSON.stringify(lis[i]));
                console.log(lis[i].Id);
                console.log(sel.Id);
                console.log(lis[i].Id == sel.Id);
                if(lis[i].Id == sel.Id){
                    
                    lis.splice(i,1);
                }
            }
            
            component.set("v.selected", lis);
            console.log(JSON.stringify(lis));
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : lis                
            });
            finalEvent.fire();
        }
    },
    
    handleEvent : function(component, event, helper) {
        
        var lookupEventToParent = event.getParam("selectedItem");
        /* selectedValue attribute is used to de duplicate the list box options in dropdown after selecting a value. so that the value does not repeat in box after selecting once*/

        console.log("In event handler");
        console.log(JSON.stringify(lookupEventToParent));
        var singleSel = component.get("v.singleSelect");
        
        if(!singleSel){
            var selectedList = [];
            var existing = component.get("v.selected");
            if(existing.length > 0){
                for(var i = 0; i < existing.length; i++){
                    selectedList.push(existing[i]);
                }
            }
            selectedList.push(lookupEventToParent);
            console.log(JSON.stringify(selectedList));
            component.set("v.selected", selectedList);
            
            const blurTimeout = component.get('v.blurTimeout');
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            var ToOpen = component.find("toOpen");
            $A.util.removeClass(ToOpen, "slds-is-open");
            
            //Empty Search string
            component.set("v.sTerm", "");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : selectedList                
            });
            finalEvent.fire();
            
            
        }else{
            var selectedList = [];
            //var existing = component.get("v.selected");
            selectedList.push(lookupEventToParent);
            console.log(JSON.stringify(selectedList));
            component.set("v.selected", selectedList);
            
            var Input = component.find("input");
            $A.util.addClass(Input, "slds-hide");
            
            var lookupPill = component.find("lookup-pill");
            $A.util.removeClass(lookupPill, "slds-hide");
            
            const blurTimeout = component.get('v.blurTimeout');
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            var ToOpen = component.find("toOpen");
            $A.util.removeClass(ToOpen, "slds-is-open");
            //Empty Search string
            component.set("v.sTerm", "");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : selectedList                
            });
            finalEvent.fire();
        }
    }
})
```
<br>
**selectAttachments.cmp:**
```html
<!-- selectAttachments -->
<aura:component controller="ContactAttachments" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >
    <aura:attribute name="isOpen" type="boolean"/>
    <aura:attribute name="fileIds" type="Object[]"/>
    <aura:attribute name="sNo" type="Integer" default="1"/>
    <aura:attribute name="isChecked" type="Boolean" default="false"/>
    <aura:attribute name="box" type="object[]"/>
    <aura:attribute name="recordId" type="Id"/>
    <aura:handler name="init" value="{!this}" action="{!c.doInit}"/>
    <aura:handler event="c:DeleteAttachmentsEvent" action="{!c.handleDeleteEvent}"/>
    
    <aura:registerEvent name="deleteRow" type="c:DeleteRowEvent"/>
    <aura:registerEvent name="DeleteNotifyComponentEvent" type="c:DeleteNotifyComponentEvent"/>
    <aura:handler name="deleteRow" event="c:DeleteRowEvent" action="{!c.deleteRow}"/>

    <aura:handler name="updateAttachmentsAppEvent" event="c:updateAttachmentsAppEvent" action="{!c.handleUpload}"/>
    
    <aura:registerEvent name="selectedAttachmentsNotifyEvent" type="c:selectedAttachmentsNotifyEvent"/>
    <!--aura:method name="childmethod" action="{!c.handleDeleteEvent}"> 
        <aura:attribute name="fileIds" type="Object"/> 
    </aura:method-->
    
    <aura:if isTrue="{!v.isOpen}">
        <div class="demo-only" style="height: 200px;">
            <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-2" class="slds-modal slds-fade-in-open slds-modal_medium">
                <div class="slds-modal__container">
                    <header class="slds-modal__header">
                        <div class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">
                            <lightning:buttonIcon iconName="utility:close" 
                                                  onclick="{! c.closeModal }" 
                                                  variant="bare-inverse"
                                                  alternativeText="close" />
                        </div>
                        <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Attachments</h2>
                    </header>
                    <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                        <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                            <thead>
                                <tr class="slds-line-height_reset">
                                    <th class="slds-text-title_caps" scope="col">
                                        <div class="slds-truncate" title="Selected">Selected</div>
                                    </th>
                                    <th class="slds-text-title_caps" scope="col">
                                        <div class="slds-truncate" title="S.No">S.No</div>
                                    </th>
                                    <th class="slds-text-title_caps" scope="col">
                                        <div class="slds-truncate" title="Attachment Name">Attachment Name</div>
                                    </th>
                                    <th class="slds-text-title_caps" scope="col">
                                        <div class="slds-truncate" title="Delete">Delete</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <aura:iteration items="{!v.fileIds}" var="f"  indexVar="i">
                                    <tr class="slds-hint-parent">
                                        <th data-label="Opportunity Name" scope="row">
                                            <div class="slds-truncate" title="Selected">
                                            	<lightning:input type="checkbox" label="" value="{!f}" checked="false" onchange="{!c.onChan}"/>
                                            </div>
                                        </th>
                                        <th data-label="Opportunity Name" scope="row">
                                            <div class="slds-truncate" title="Cloudhub">{!v.sNo + i}</div>
                                        </th>
                                        <td data-label="Account Name">
                                            <div class="slds-truncate" title="Attachment Title"><lightning:formattedText value="{!f.Title}"/></div>
                                        </td>
                                        <td data-label="Close Date">
                                            <div class="slds-truncate" title="DeleteIcon"><lightning:buttonIcon iconName="utility:delete" value="{!f.ContentDocumentId}" size="large" variant="bare" onclick="{!c.deleteFile }" alternativeText="delete" /></div>
                                        </td>
                                    </tr>
                                </aura:iteration>  
                            </tbody>
                        </table>
                    </div>
                    <footer class="slds-modal__footer">
                        <lightning:button label="Ok" onclick="{!c.onOk}"/>
                    </footer>
                </div>
            </section>
            <div class="slds-backdrop slds-backdrop_open"></div>
        </div>
    </aura:if>
    
    <!--lightning:button label="Delete files" onclick="{!c.openModal}"/-->
</aura:component>
```
<br>
**selectAttachmentsController.js:**
```js
({
    doInit : function(component, event, helper) {
        var rId = component.get("v.recordId");
        console.log("In Init");
		var action = component.get("c.getAttachments");
        action.setParams({
            conId : rId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log("result of Attach display component");
                console.log(result);
                //console.log(result[0].Id);
                component.set("v.fileIds", result);
            }
        });
        $A.enqueueAction(action);
	},
    
    handleDeleteEvent : function(component, event, helper) {
        console.log("In handle delete event in child");
        /*var eventName = event.getSource().getElement();
        console.log("eventName");
        console.log(eventName);*/
        
        var deleteFiles = event.getParam("toDeleteIds");
        console.log("deleteFiles");
        console.log(deleteFiles);
        component.set("v.fileIds", deleteFiles);
        if(deleteFiles === null){
            
            //Toast message on deletion if there are no records in list
            var toastEvent = $A.get("e.force:showToast");
            
            toastEvent.setParams({
                "title": "Attention!",
                "message": "There are no files to delete",
                "type" : "ERROR"
            });
            toastEvent.fire();
        }else{
        component.set("v.isOpen", true);
        }
        /*var deleteFiles = component.get("v.fileIds");
        console.log("deleteFiles");
        console.log(deleteFiles);*/
        
    },
    
    closeModal : function(component, event, helper) {
        component.set("v.isOpen", false);
    },
    
    openModal : function(component, event, helper) {
        component.set("v.isOpen", true);
    },
    
    deleteFile : function(component, event, helper) {
        console.log("In delte file method delete attachments modal");
        var fileToDelete = event.getSource().get("v.value");
        console.log("ContentDocumentId");
        console.log(fileToDelete);
        var action = component.get("c.deleteAttachments");
        action.setParams({
            attachId : fileToDelete
        });
        action.setCallback(this, function(response){
            console.log("In call back");
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log(result);
                if(result === true){
                    
                    //alert(component.get("v.rowIndex"));
                    var index = component.getEvent("deleteRow");
                    index.setParams({
                        "rowIndex" : component.get("v.sNo")
                    });
                    index.fire();
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    deleteRow : function(component, event, helper) {
        var index = event.getParams("v.sNo");
        //alert(index);
        var AllRowsList = component.get("v.fileIds");
        AllRowsList.splice(index, 1);
        component.set("v.fileIds", AllRowsList);
        
        //Close Modal
        component.set("v.isOpen", false);
        
        var delEvntNotify = component.getEvent("DeleteNotifyComponentEvent");
        delEvntNotify.fire();
        
        //Toast message on deletion
        var toastEvent = $A.get("e.force:showToast");
        
        toastEvent.setParams({
            "title": "Success!",
            "message": "File deleted successfully.",
            "type" : "SUCCESS"
        });
        toastEvent.fire();
    },
    
    onChan : function(component, event, helper) {
        
        console.log("In on change ");
        var change = event.getSource().get("v.value");
        var val = event.getSource().get("v.checked");
        console.log(JSON.stringify(change));
        console.log(JSON.stringify(val));
        var selected = component.get("v.box");
        if(val === true){
        selected.push(change); 
        }else{
            selected.pop(change);
        }
        console.log(JSON.stringify(selected));
        component.set("v.box", selected);  
    },
    
    onOk : function(component, event, helper) {
        console.log("In on onOk ");
        var selected = component.get("v.box");
        console.log(JSON.stringify(selected));
        var evnt = component.getEvent("selectedAttachmentsNotifyEvent");
        
        evnt.setParams({
            selectedIds : selected
        });
        evnt.fire();
        console.log("Event fired");
        component.set("v.isOpen", false);
        component.set("v.box", []);
    },
    
            
    handleUpload : function(component, event, helper) {
        
        var evnt = $A.get("updateAttachmentsAppEvent");
        evnt.getParam("Uploaded");
        var init = component.get("c.doInit");
        $A.enqueueAction(init);
    },
})
```
<br>
**CustomLookUpFinalValueEvent.evt:**
```html
<!-- CustomLookUpFinalValueEvent -->
<aura:event type="COMPONENT" description="Event template">
    
    <aura:attribute name="uniqueName" type="String"/>
    <aura:attribute name="finalValue" type="Map[]"/>
</aura:event>
```
<br>
**selectedAttachmentsNotifyEvent.evt:**
```html
<!-- selectedAttachmentsNotifyEvent -->
<aura:event type="COMPONENT" description="Event template" >
    <aura:attribute name="selectedIds" type="Map[]"/>
</aura:event>
```
<br>
**NotifyController.apxc:**
```js
public with sharing class NotifyController {
    
    
    @AuraEnabled
    public static List<User> getContactOwners(String recId){
        
        Contact con = [Select Id, Name, Email, OwnerId, CreatedById, LastModifiedById from Contact where Id =:recId];
        system.debug('con:::'+con);
        String OwnerId = con.OwnerId;

        User owner = [Select Id, Name from User where Id =: OwnerId];
        List<User> userList = new List<User>();
        userList.add(owner);
        system.debug('owner:::'+owner);
        system.debug('userList:::'+userList);
        return userList;
    }
    
    @AuraEnabled
    public static void sendEmailApex(List<String> toAddress, List<String> ccAddress, String subject, String body, List<String> files) {
        /*List<Id> ids = new List<Id>();
        ids.add('0687F000008zGL5QAM');*/
        
        Messaging.reserveSingleEmailCapacity(1);
        try{
        messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
        
        //toAddress.add('krrish.kishore02@gmail.com');
        //ccAddress = new List<String>(); //{'bala.bandanadam@birlasoft.com'};
                
        mail.setToAddresses(toAddress);
        mail.setCcAddresses(ccAddress);
        mail.setReplyTo('bala.bandanadam@birlasoft.com');
        mail.setSenderDisplayName('Kishore');
        mail.setSubject(subject);
        mail.setHtmlBody(body);
        mail.setEntityAttachments(files);
        Messaging.sendEmail(new List<messaging.SingleEmailMessage> {mail});
        }
        catch (exception e){
            throw new AuraHandledException(e.getMessage());
            //return null;
        }
    }
}
```
<br>
**ContactAttachments.apxc:**
```js
public with sharing class ContactAttachments {
    
    @AuraEnabled
    public static List<ContentVersion> getAttachments(String conId){
        
        List<ContentDocumentLink> CDLs = [Select ContentDocumentId 
                                          from ContentDocumentLink 
                                          where LinkedEntityId = : conId];
        
        System.debug('CDLs::::'+CDLs);
        if(CDLs != NULL && CDLs.size() > 0){
        Set<Id> CDIdList = new Set<Id>();
        for (ContentDocumentLink nextCDL : CDLs) {
            CDIdList.add(nextCDL.ContentDocumentId); 
        }
        System.debug('CDIdList::::'+CDIdList);        
        
        List<ContentDocument> entries = [SELECT Id, Title, FileType FROM ContentDocument WHERE ContentDocument.Id IN :CDIdList];
        System.debug('entries::::'+entries);
            
        List<ContentVersion> CVmainList = new List<ContentVersion>();  
        List<ContentVersion> CVList = [SELECT Id, ContentDocumentId, isLatest, Title 
                                       FROM ContentVersion 
                                       WHERE ContentDocumentId = :CDIdList AND isLatest = true];

            return CVList;
        }
        else{
            List<ContentVersion> CV = new List<ContentVersion>();
            CV = NULL;
            return CV;
        }
    }
    
    
    //Attachment delete method
    @AuraEnabled
    public static boolean deleteAttachments(Id attachId){
        
        if(attachId != NULL){
            ContentDocument file = [Select Id from ContentDocument where Id = :attachId];
            delete file;
            return true;
        }
        else{
            return false;
        }
    }
}
```
<br>
Hope this post helped you gain some knowledge, If you like the content please don't step back to like my page and leave your feedback, It will motivate me to make more posts.


Do subscribe, for getting latest updates directly in your inbox.