---
layout: post
title: Editable List with files and notify option in Salesforce Lightning (Aura)
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning, Apex ]
permalink: /2019/05/editable-list-with-files-and-notify.html
no_description: This post gives detailed explanation on how to build a lightning component which can display a list of records and associated files, with an option to edit and notify.
image: assets/images/editable-list/editable-list.png
toc: true
author: kishore
tags:
- Lightning
---
## AIM 
To build a component which displays a list of records and associated files with an option to edit and notify.
 
## Access Files
Previously while using attachments in salesforce in order to get the attachments of particular record, we used to get all the attachments by using a simple SOQL statement on attachment object by specifying parentId.

But when it comes to files, it is a total different case. Files also comes with versioning. In order to completely utilize all the features providing we need to utilize following objects.

- ContentDocumentLink
- ContentVersion
- ContentDocument

With content version we can add another version of file to the existing file, It stores both the files as different versions. It helps in analyzing or finding changes made to the original file. We can always get the latest version by using “IsMajorVersion” or “IsLatest”.

![Editable List with files and notify option in Salesforce Lightning (Aura)](/assets/images/editable-list/flow-chart.png)

Every time a attachment is added or deleted an event is fired so that the components have the latest data of the files. Please understand the above image carefully as it shows the event firing and handling components.

![Editable List with files and notify option in Salesforce Lightning (Aura)](/assets/images/editable-list/contact-list.png)

![Editable List with files and notify option in Salesforce Lightning (Aura)](/assets/images/editable-list/contact-list.png)

![Editable List with files and notify option in Salesforce Lightning (Aura)](/assets/images/editable-list/popup.png)

![Editable List with files and notify option in Salesforce Lightning (Aura)](/assets/images/editable-list/notify.png)

**ContactAttachWrapperUsingContentVersion.apxc:**
```js
public class ContactAttachWrapperUsingContentVersion {
    
    // Wrapper method with contact and its attachment list "content versions"
    @AuraEnabled
    public static List getConAttachments(){
        
        //List conList = [Select id, Name from Contact where Name LIKE '%Ki%'];
        map> mapParentIdFiles = new map>();
        //Map of Contact Id and Contact sObject
        //Map conList = new Map([Select id, Name, Account.Name, Phone from Contact where Name LIKE '%Ki%']);
        Map conList = new Map([Select id, Name, FirstName, LastName, Email, Account.Name, Phone from Contact LIMIT 50]);
        System.debug(':::conList:::'+conList);
        List CDLs = new List();
        //map of contact and list of ContentDocumentIds
        Map> cvMap = new Map>();
        //Set of contact Ids
        set conIds = conList.keySet();
        System.debug(':::conIds:::'+conIds);
        
        if(conList.Size() > 0 && conList != NULL){
            CDLs = [Select ContentDocumentId, LinkedEntityId 
                    from ContentDocumentLink 
                    where LinkedEntityId IN : conIds];
            System.debug(':::CDLs:::'+CDLs);
        }
        
        if(CDLs.Size() > 0 && CDLs != NULL){
            for(ContentDocumentLink c : CDLs){
                if(cvMap.containsKey(c.LinkedEntityId)){
                    List cd = cvMap.get(c.LinkedEntityId);
                    if(c.ContentDocumentId != NULL)
                        cd.add(c.ContentDocumentId);
                    System.debug(':::cd:::'+cd);
                    cvMap.put(c.LinkedEntityId, cd);
                }else{
                    cvMap.put(c.LinkedEntityId, new List { c.ContentDocumentId });
                }
            }
            System.debug(':::cvMap:::'+cvMap);
        }
        
        //Set of document Ids
        set setDocumentIds = new set();
        List fileLinks = [select Id, LinkedEntityId, ContentDocumentId from ContentDocumentLink where LinkedEntityId in: conIds];
        for(ContentDocumentLink fileLink: fileLinks){
            setDocumentIds.add(fileLink.ContentDocumentId);
        }
        
        //creating map of ContentDocumentId and content version
        map mapContentVersion = new map();
        for(ContentVersion cv: [select Id, title, ContentDocumentId from ContentVersion where ContentDocumentId in: setDocumentIds]){
            mapContentVersion.put(cv.ContentDocumentId, cv);
        }
        
        //Map of contact Ids and content version
        for(ContentDocumentLink fileLink: fileLinks){
            if(mapContentVersion.containsKey(fileLink.ContentDocumentId)){
                if(mapParentIdFiles.containsKey(fileLink.LinkedEntityId)){
                    mapParentIdFiles.get(fileLink.LinkedEntityId).add(mapContentVersion.get(fileLink.ContentDocumentId));
                }else{
                    mapParentIdFiles.put(fileLink.LinkedEntityId, new List{mapContentVersion.get(fileLink.ContentDocumentId)});
                }
            }
        }
        
        
        List wrapList = new List();
        
        
        for(Contact c : conList.values()){
            wrapList.add(new attachWrap(c, mapParentIdFiles.get(c.id)));
        }
        
        System.debug(':::wrapList:::'+wrapList);
        return wrapList;
    }
    // End of wrapper method
    
    //Wrapper class
    public class attachWrap{
        
        @AuraEnabled public Contact  wCon {get;set;}
        @AuraEnabled public List wCV {get;set;}
        
        public attachWrap(Contact con, List CV){
            wCon = con;
            wCV =  CV;
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
    
    @AuraEnabled
    public static boolean updateContact(Contact con){
        
        if(con != NULL){
            //Contact con = [Select Id from ContentDocument where Id = :attachId];
            update con;
            return true;
        }
        else{
            return false;
        }
    }
  
}
```
<br>
**ConAttachment.cmp:**
```html
<aura:component controller="ContactAttachWrapperUsingContentVersion" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId" access="global" >
    
    <aura:attribute name="wrapperList" type="object[]"/>
    <aura:handler name="init" value="{!this}" action="{!c.doinit}"/>
    <aura:attribute name="sNo" type="Integer" default= "1"/>
    <aura:attribute name="Spinner" type="boolean" default="false"/>
    
    <aura:attribute name="isOpen" type="Boolean" default="false"/>
    
    <aura:handler name="AttachmentUploaderEvent" event="c:AttachmentUploaderEvent" action="{!c.handleComponentEvent}"/>
    
    <aura:handler name="DeleteNotifyComponentEvent" event="c:DeleteNotifyComponentEvent" action="{!c.DeleteNotify}"/>
    <aura:registerEvent name="DeleteAttachmentsEvent" type="c:DeleteAttachmentsEvent"/>
    
    <!-- Spinner-->
    <aura:handler event="aura:waiting" action="{!c.showSpinner}"/>
    <aura:handler event="aura:doneWaiting" action="{!c.hideSpinner}"/>
    
    <!--aura:registerEvent name="DeleteAttachmentsEvent" type="c:DeleteAttachmentsEvent"/-->
    <!--aura:registerEvent name="OpenModalEvent" type="c:OpenModalEvent"/-->
    <c:Header/>
    <div class="slds-table--header-fixed_container">
        <div class="slds-scrollable_y" style="height: 36rem;">
            <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                <thead>
                    <tr class="slds-line-height_reset">
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="ID">Select</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="ID">Contact Name</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Email">Email</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Phone">Phone</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Attachments">Attachments</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Add">Add Attachments</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Edit">Edit Contact</div>
                        </th>
                        <th class="slds-text-title_caps" scope="col">
                            <div class="slds-truncate" title="Notify">Notify</div>
                        </th>
                    </tr>
                </thead>
                
                <tbody>

                    
                    <aura:iteration items="{!v.wrapperList}" var="w" indexVar="i">
                        
                        <tr class="slds-hint-parent">
                            <td data-label="Select">
                                {!v.sNo + i}
                                <!--div class="" title="Select"><lightning:input type="checkbox" name="input1"/></div-->
                            </td>
                            <td data-label="Contact Name">
                                <div class="" title="{!w.wCon.Id}"><a title="{!w.wCon.Id}" onclick="{!c.detailPage}">{!w.wCon.Name}</a></div>
                            </td>
                            <td data-label="Email">
                                <div class="slds-truncate" title="{!w.wCon.Email}">{!w.wCon.Email}</div>
                            </td>
                            <td data-label="Phone">
                                <div class="slds-truncate" title="{!w.wCon.Phone}">{!w.wCon.Phone}</div>
                            </td>
                            <td data-label="Loop">
                                <lightning:layout  multipleRows="true">
                                    <aura:iteration items="{!w.wCV}" var="wc">
                                        
                                        
                                        <lightning:layoutItem size="2">
                                            <lightning:buttonIcon size="large" iconName="utility:file" title="{!wc.Title}" value ="{!wc.ContentDocumentId}" variant="bare" onclick="{! c.handleClick }"/>
                                        </lightning:layoutItem>
                                        
                                        
                                        
                                        <!--lightning:fileCard fileId="{!wc}" description="view"/><br/-->
                                    </aura:iteration>
                                </lightning:layout>
                            </td>
                            <td data-label="Add Attachments">
                                <div class="slds-truncate" title="Add Attachments"><c:AttachmentUploader recordId="{!w.wCon.Id}"/></div>
                            </td>
                            <td data-label="Edit Contact">
                                <div class="slds-truncate" title="Edit"><lightning:buttonIcon value="{!w}" size="large" iconName="utility:edit" onclick="{!c.openDetail}"/></div>
                            </td>
                            <td data-label="Edit Contact">
                                <div class="slds-truncate" title="Edit"><lightning:button label="Notify" value="{!w.wCon.Id}" onclick="{!c.openNotify}"/></div>
                            </td>

                        </tr>
                        
                    </aura:iteration>
                    
                </tbody>
                
            </table>
        </div>    
    </div>
    <c:DeleteAttachmentsCV/>

    <!--c:Footer/-->
    <!--c:DeleteAttachments aura:id="childComp"/-->
    <aura:if isTrue="{!v.isOpen}">
        <div class="demo-only" style="height: 640px;">
            <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open">
                <div class="slds-modal__container">
                    <div class="slds-float_right">
                        <lightning:buttonIcon  iconName="utility:close" size="large" variant="bare-inverse" onclick="{!c.closeModal}"/>
                    </div>
                    <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                        <c:NotifyModal recordId="{!v.recordId}"/>
                    </div>
                </div>
            </section>
            <div class="slds-backdrop slds-backdrop_open"></div>
        </div>
    </aura:if>
</aura:component>
```
<br>
**ConAttachmentController.js:**
```js
({
    doinit : function(component, event, helper) {
        console.log("In Init");
        var action = component.get("c.getConAttachments");
        //action.setStorable();
        console.log("action");
        console.log(action);
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log("state");
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log("result");
                console.log(result);
                component.set("v.wrapperList", result);
            }
        });
        $A.enqueueAction(action);
    },
    handleClick : function(component, event, helper) {
        console.log("In Handleclick");
        var lis = event.getSource().get("v.value");
        console.log(lis);
        $A.get('e.lightning:openFiles').fire({
            recordIds: [lis],
            //selectedRecordId: lis[1]
        });
    },
    
    handleComponentEvent : function(component, event, helper) {
        
        var callDoinit = component.get('c.doinit');
        $A.enqueueAction(callDoinit);
    },
    
    handleDelete : function(component, event, helper) {
        //Open modal event
        var OpenModalEvent = component.getEvent("OpenModalEvent");
        OpenModalEvent.fire();
        
        var childcomponent= component.find("childComp");
        console.log("In handle delete");
        var Ids = event.getSource().get("v.value");
        console.log("To be deleted Ids::::::");
        console.log(Ids);
        childcomponent.childmethod(Ids);
        
        /*var DeleteAttachmentsEvent = $A.get("e.c:DeleteAttachmentsEvent");
        DeleteAttachmentsEvent.setParams({
            toDeleteIds : Ids
        });*/
        //console.log("Event");
        //console.log(DeleteAttachmentsEvent);
        //DeleteAttachmentsEvent.fire();
    },
    
    detailPage : function(component, event, helper) {
        var detailId1 = event.currentTarget.title;
        console.log("detailId1:::::"+detailId1);
        //var detailId2 = event.getSource().getLocalId();
        //console.log("detailId2:::::"+detailId2);
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": detailId1,
            "slideDevName": "detail"
        });
        navEvt.fire();
    },
    openDetail : function(component, event, helper) {
        console.log("Event fired");
        
        // getting here the wrapper obj from iteration
        var files = event.getSource().get("v.value");
        console.log("files are: ", JSON.stringify(files));
                
        var appEvent = $A.get("e.c:DeleteAttachmentsEvent");
        appEvent.setParams({
            "toDeleteIds" :  files
        });
        appEvent.fire();
    },
    
    DeleteNotify : function(component, event, helper) {
        
        var init = component.get("c.doinit");
        $A.enqueueAction(init);
    },
    
    showSpinner : function(component, event, helper) {
        component.set("v.Spinner", true); 
    },
    
    hideSpinner : function(component, event, helper) {
        component.set("v.Spinner", false); 
    },
    
    openNotify : function(component, event, helper) {
        console.log("In open notify in poc");
        

        var rec = event.getSource().get("v.value");
        console.log(rec);
        component.set("v.recordId", rec);
        
        var open = component.get("v.isOpen");
        console.log(open);
        
        component.set("v.isOpen", true);
    },
    
    closeModal : function(component, event, helper) {
;
        
        component.set("v.isOpen", false);
        console.log("In close notify");
        
    },
})
```
<br>
**AttachmentUploader.cmp:**
```html
<!-- AttachmentUploader-->
<aura:component implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >
 
    <aura:attribute name="recordId" type="Id"/>
    <aura:attribute name="accept" type="List" default="['.jpg', '.jpeg', '.pdf', '.zip', '.png']"/>
    <aura:attribute name="multiple" type="Boolean" default="true"/>
    <aura:attribute name="disabled" type="Boolean" default="false"/>
    
    <aura:registerEvent name="AttachmentUploaderEvent" type="c:AttachmentUploaderEvent"/>
    <aura:registerEvent name="updateAttachmentsAppEvent" type="c:updateAttachmentsAppEvent"/>
    
    <lightning:fileUpload
                          multiple="{!v.multiple}" 
                          accept="{!v.accept}" 
                          recordId="{!v.recordId}" 
                          onuploadfinished="{!c.handleUploadFinished}" />
    
    
</aura:component>
```
<br>
**AttachmentUploaderController.js**
```js
({
    handleUploadFinished : function(component, event, helper) {
        var uploadedFiles = event.getParam("files");
        var documentId = uploadedFiles[0].documentId;
        var fileName = uploadedFiles[0].name;
        console.log("In ");
        for(var i = 0; i < uploadedFiles.length; i++){
            console.log(uploadedFiles[i].name);
        }
        
        var toastEvent = $A.get("e.force:showToast");
        for(var i = 1; i < uploadedFiles.length; i++){
            fileName = fileName + ','+''+ uploadedFiles[i].name;
        }
        console.log("Names::::::"+fileName);
        
        toastEvent.setParams({
            "title": "Success!",
            "message": "File(s) "+ fileName +" Uploaded successfully.",
            "type" : "SUCCESS"
        });
        toastEvent.fire();
        
        
        var attachmentUploaderEvent = component.getEvent("AttachmentUploaderEvent");
   attachmentUploaderEvent.setParam("Uploaded", "Success");
         attachmentUploaderEvent.fire();
        
        
        var updateAttachmentsAppEvent = component.getEvent("updateAttachmentsAppEvent");
         updateAttachmentsAppEvent.fire();
        /*$A.get('e.lightning:openFiles').fire({
            recordIds: [documentId]
        });*/
        
    }
})
```
<br>
**DeleteAttachmentsCV.cmp**
```html
<!-- DeleteAttachmentsCV -->
<aura:component controller="ContactAttachWrapperUsingContentVersion" implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >

    <aura:attribute name="isOpen" type="boolean"/>

    <aura:attribute name="fileIds" type="Object"/>

    <aura:attribute name="aIds" type="List"/>

    <aura:attribute name="sNo" type="Integer" default="1"/>

    

    <aura:handler event="c:DeleteAttachmentsEvent" action="{!c.handleDeleteEvent}"/>

    

    <aura:registerEvent name="deleteRow" type="c:DeleteRowEvent"/>

    <aura:registerEvent name="DeleteNotifyComponentEvent" type="c:DeleteNotifyComponentEvent"/>

    <aura:handler name="deleteRow" event="c:DeleteRowEvent" action="{!c.deleteRow}"/>

    

    <!--aura:method name="childmethod" action="{!c.handleDeleteEvent}"> 

        <aura:attribute name="fileIds" type="Object"/> 

    </aura:method-->

    

    <aura:if isTrue="{!v.isOpen}">

        <div class="demo-only" style="height: 640px;">

            <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open">

                <div class="slds-modal__container">

                    <header class="slds-modal__header">

                        <div class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">

                            <lightning:buttonIcon iconName="utility:close" 

                                                  onclick="{! c.closeModal }" 

                                                  variant="bare-inverse"

                                                  size="large"

                                                  alternativeText="close" />

                        </div>

                        <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">{!v.fileIds.Name} Details</h2>

                    </header>

                    <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">

                        <!--Contact Form-->

                        

                        <div class="slds-grid slds-wrap">

                            <div class="slds-col slds-size_1-of-2 slds-p-left_x-large">

                                <lightning:input name="ContactName" label="First Name" value="{!v.fileIds.FirstName}"/>

                            </div>

                            <div class="slds-col slds-size_1-of-2 slds-p-left_x-large">

                                <lightning:input name="ContactName" label="Last Name" value="{!v.fileIds.LastName}"/>

                            </div>

                            <div class="slds-col slds-size_1-of-2 slds-p-left_x-large">

                                <lightning:input type="email" name="Email" label="Email" value="{!v.fileIds.Email}"/>

                            </div>

                            <div class="slds-col slds-size_1-of-2 slds-p-left_x-large">

                                <lightning:input type="tel" name="ContactName" label="Phone" value="{!v.fileIds.Phone}"/>

                            </div>

                        </div>

                        

                        <!--Contact Form End-->


                        <br/>

                        <h2>Attachments</h2>

                        <table class="slds-table slds-table_cell-buffer slds-table_bordered">

                            <thead>

                                <tr class="slds-line-height_reset">

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

                                

                                <aura:iteration items="{!v.aIds}" var="f"  indexVar="i">

                                    <tr>

                                        <td data-label="Sno" scope="row">

                                            <div class="slds-truncate" title="Cloudhub">{!v.sNo + i}</div>

                                        </td>

                                        <td data-label="Title">

                                            <div class="slds-truncate" title="Attachment Title"><lightning:formattedText value="{!f.Title}"/></div>

                                        </td>

                                        <td data-label="Delete">

                                            <div class="slds-truncate" title="DeleteIcon"><lightning:buttonIcon iconName="utility:delete" value="{!f.ContentDocumentId}" size="large" variant="bare"  alternativeText="delete" onclick="{!c.deleteFile}"/></div>

                                        </td>

                                    </tr>

                                </aura:iteration>  

                            </tbody>

                        </table>

                    </div>

                    <footer class="slds-modal__footer">

                        <div>

                            <lightning:button label="Update" variant="brand" onclick="{!c.UpdateContact}"/>

                            <lightning:button label="Cancel" variant="destructive" onclick="{!c.closeModal}"/>

                        </div>

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
**DeleteAttachmentsCVController.js**
```js
({
    handleDeleteEvent : function(component, event, helper) {
        var deleteFiles = event.getParam("toDeleteIds");
        if(deleteFiles.wCon){
        component.set("v.fileIds", deleteFiles.wCon);
        }
        console.log("deleteFiles",JSON.stringify(deleteFiles));
        
        if(deleteFiles.wCV != null){
            var attachIds = [];
            for(var i = 0; i < deleteFiles.wCV.length; i++){
                attachIds.push({
                    Title : deleteFiles.wCV[i].Title, Id : deleteFiles.wCV[i].Title, ContentDocumentId : deleteFiles.wCV[i].ContentDocumentId
                });
            }
            component.set("v.aIds", attachIds);
            console.log("attachIds",attachIds);
        }
        else{
            var attachIds = [];
            component.set("v.aIds", attachIds);
        }
        //console.log("deleteFiles[0].Title::::"+deleteFiles.wCV[0].Title);
        if(deleteFiles.wCon === null){
            
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
        var fileToDelete = event.getSource().get("v.value");       
        var action = component.get("c.deleteAttachments");
        action.setParams({
            attachId : fileToDelete
        });
        action.setCallback(this, function(response){            
            var state = response.getState();           
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
        var AllRowsList = component.get("v.aIds");
        AllRowsList.splice(index, 1);
        component.set("v.aIds", AllRowsList);
        
        //Close Modal
        //component.set("v.isOpen", false);
        
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
    
    UpdateContact : function(component, event, helper) {
        
        var updatedCon = component.get("v.fileIds")
        console.log("updatedCon::");
        console.log(JSON.stringify(updatedCon));
        
        var action = component.get("c.updateContact");
        action.setParams({
            con : updatedCon
        });
        
        action.setCallback(this, function(response){
            console.log("In call back");
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log(result);
                if(result == true){
                    //Toast message on deletion
                    var toastEvent = $A.get("e.force:showToast");
                    
                    toastEvent.setParams({
                        "title": "Success!",
                        "message": "File Updated successfully.",
                        "type" : "SUCCESS"
                    });
                    toastEvent.fire();
                    // Event to notify parent about update
                    var delEvntNotify = component.getEvent("DeleteNotifyComponentEvent");
                    delEvntNotify.fire();
                    //To close modal
                    component.set("v.isOpen", false);
                }else{
                    var toastEvent = $A.get("e.force:showToast");
                    
                    toastEvent.setParams({
                        "title": "Failed!",
                        "message": "File Updated Error.",
                        "type" : "ERROR"
                    });
                }
            }
        });
        $A.enqueueAction(action);
    }
})
```
<br>
To understand Notify component fully please visit this post.

**Related:**  Create a Custom Component to Send an Email in Salesforce Lightning 

**NotifyModal.cmp**
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
**NotifyModalController.js**
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
**Events:**
**AttachmentUploaderEvent.evt:**
```html
<!-- AttachmentUploaderEvent -->

<aura:event type="COMPONENT" description="Event template">

    <aura:attribute name="Uploaded" type="String"/>

</aura:event>
```
<br>
**DeleteNotifyComponentEvent.evt:**
```html
<!-- DeleteNotifyComponentEvent -->

<aura:event type="COMPONENT" description="Event template">

</aura:event>
```
<br>
**DeleteAttachmentsEvent.evt:**
```html
<!-- DeleteAttachmentsEvent -->

<aura:event type="APPLICATION" description="Event template">

 <aura:attribute name="toDeleteIds" type="Object[]"/>

</aura:event>
```
<br>
**DeleteRowEvent.evt:**
```html
<aura:event type="COMPONENT" description="delete row">

 <aura:attribute name="rowIndex" type="Integer"/>

</aura:event>
```

One Small help:
If you enjoyed this blog post, share it with a friend!

Do subscribe, for getting latest updates directly in your inbox.