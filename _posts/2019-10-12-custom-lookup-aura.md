---
layout: post
title: Custom Lookup Component in Salesforce Lightning - Updated
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning, Apex ]
permalink: /2019/05/custom-lookup-component-in-salesforce.html
no_description: Salesforce doesn't provide any specific input tag that renders Look-up field in UI. The look-up component we are going to build is generic so that it can be re-used and not object specific Supports multi select and single select Able to pre-populate value.
image: assets/images/look-up-aura.png
toc: true
author: kishore
tags:
- Lightning
---

## Lookup Relationship in Salesforce
Creates a relationship between two records so you can associate them with each other. On the parent record, you can display a related list to show all of the records that are linked to it. You can create lookup relationship fields that link to users, standard objects, or custom objects. If a lookup field references a record that has been deleted, Salesforce clears the value of the lookup field by default. Alternatively, you can choose to prevent records from being deleted if they’re in a lookup relationship.

On a standard or custom object, a lookup relationship creates a field that allows users to click a lookup icon and select another record from a popup window.
 
## Look-Up in Custom Lightning Components
When using look up in salesforce lightning components, Salesforce doesn't provide any specific input tag that renders Look-up field UI.

`<lightning:inputField />`  tag which can render look up automatically, can only be used in
- `<lightning:recordEditForm/>`
- `<lightning:recordForm />`
- `<lightning:recordViewForm/>`

So for this reason we have build a custom Look-up component.

The look-up component we are going to build is generic so that it can be re-used,
- Not object specific 
- Supports multi select and single select
- Able to pre-populate value

## Flow
- **Step 1**: Create a apex class which returns a list of records (max of 5) based on the search term excluding the selected records (if any).
- **Step 2**: Create a parent lightning component with a search input that calls apex class on key change with two parameters ('<Search term>' , '<Selected records>').
- **Step 3**: Create a child component which displays list of records returned to parent.
- **Step 4**: Display selected record as pills.

**Controller:**
ContactController

**Components:**
CustomLookUpComp (Parent)
childLookUp (Child)

**Events:**
CustomLookUpFinalValueEvent
LookupEventToParent

**ContactController.apxc**
```js
public class ContactController {
        
    @AuraEnabled
    public static List getContacts(String searchTerm, List selectedOptions) {
        List Ids = new List();
        
        for(Contact c : selectedOptions){
            Ids.add(c.Id);
        }
        system.debug('selectedOptions:::'+selectedOptions);
        system.debug('Ids:::'+Ids);
        if(selectedOptions != NULL){
            List conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;
        }else{
            List conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;    
        }
    }
    
    @AuraEnabled
    public static List getUsers(String searchTerm, List selectedOptions) {
        List Ids = new List();
        
        for(User c : selectedOptions){
            Ids.add(c.Id);
        }
        system.debug('selectedOptions:::'+selectedOptions);
        system.debug('Ids:::'+Ids);
        if(selectedOptions != NULL){
            List userList = [Select Id, Name from User Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('userList:::'+userList);
            return userList;
        }else{
            List userList = [Select Id, Name from User Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('userList:::'+userList);
            return userList;    
        }
    }
}
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
    <aura:attribute name="selected" type="Map[]"/><!--Optional If you want any pre-population can use this to pass that record Id value-->
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
**CustomLookUpCompController.js**
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
**CustomLookUpCompHelper.js**
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
**childLookUp.cmp**
```html
<aura:component controller="ContactController" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,forceCommunity:availableForAllPageTypes,force:lightningQuickAction" access="global" >
    
    <aura:attribute name="myContact" type="Map"/>
    <aura:attribute name="icon" type="String"/>
    <aura:attribute name="object" type="String"/>
    <aura:handler name="init" value="{!this}" action="{!c.doinit}"/>
    <aura:registerEvent name="LookupEventToParent" type="c:LookupEventToParent"/>
    
    <li role="presentation" class="slds-listbox__item " onclick ="{!c.onOptionClick}">
        <div id="option1" class="slds-media slds-listbox__option slds-listbox__option_entity slds-media_center" role="option">
            <span class="slds-media__figure slds-listbox__option-icon">
                <span class="slds-icon_container slds-icon-standard-account">
                    <div class="slds-icon slds-icon_small" aria-hidden="true">
                        <lightning:icon iconName="{!v.icon}" alternativeText="{!v.object}" size="small"/>
                    </div>
                </span>
            </span>
            <span class="slds-media__body">
                <span class="slds-listbox">
                    {!v.myContact.Name}                     
                </span>
            </span>
        </div>
    </li>
</aura:component>
```
<br>
**childLookController.js**
```js
({ 
    doinit : function(component, event, helper) {
        console.log("In Child lookup Init");
        var icon = component.get("v.iconName");
        var Object = component.get("v.sObject");
        
        console.log("icon:: "+icon);
        console.log("Object:: "+Object);
    },
    
 onOptionClick : function(component, event, helper) {
  console.log("In child init");
        var selVal  = component.get("v.myContact");
        console.log(selVal);
        
        var evt = component.getEvent("LookupEventToParent");
        evt.setParams({
            selectedItem : selVal
        });
        evt.fire();
 }
})
```
<br>
**CustomLookUpFinalValueEvent.evt**
```html
<!-- CustomLookUpFinalValueEvent -->
<aura:event type="COMPONENT" description="Event template">
    
    <aura:attribute name="uniqueName" type="String"/>
    <aura:attribute name="finalValue" type="Map[]"/>
</aura:event>
```
<br>
**LookupEventToParent.evt**
```html
<!-- LookupEventToParent -->
<aura:event type="COMPONENT" description="Event template">
 
    <aura:attribute name="selectedItem" type="Map"/>
</aura:event>
```
<br>

## UPDATE
Now you can use this look up component for any object with only one apex method by using this piece of code.
We have used dynamic query so that, there is no need to write method for each and every object.
Please find the changes below.

To ContactController.apxc apex class add the following method lookUp().
```js
@AuraEnabled
    public static List lookUp(String searchTerm, List selectedOptions, string myObject) {
        List Ids = new List();
        
        for(sObject c : selectedOptions){
            Ids.add(c.Id);
        }
        
        if(selectedOptions != NULL){
            String myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' AND (Id != : Ids) LIMIT  5';
            List lookUpList = database.query(myQuery);
            system.debug('lookUpList:::'+lookUpList);
            return lookUpList;
        }else{
            String myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' AND (Id != : Ids) LIMIT  5';
                List lookUpList = database.query(myQuery);
                system.debug('lookUpList:::'+lookUpList);
                return lookUpList;    
        }
    }
```
<br>
To CustomLookUpCompHelper.js add the line  "myObject" : Object as show below
```js
        action.setParams({
            "searchTerm" :  term,
            "selectedOptions" : selected,
            "myObject" : Object //Updated Add this line in your code
        });
```

Will keep you posted with updates 😃
What other ideas can you add to this list that I may have not mentioned?
What kinds of content would you like to see more on this blog?
Please let me know in the comments below...

One Small help:
If you enjoyed this blog post, share it with a friend!

Do subscribe, for getting latest updates directly in your inbox.













