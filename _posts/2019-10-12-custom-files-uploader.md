---
layout: post
title: Custom Files Uploader for Salesforce Lightning Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning, Apex ]
permalink: /2019/04/custom-files-uploader-for-lightning.html
description: Files Uploader is a base component provided by salesforce, using this let's build a Custom Files Uploader lightning component which can be re-used in any component with ease.
image: assets/images/files-uploader.png
toc: true
author: kishore
tags:
- Lightning
---

In this post we are going to see a Custom Files Uploader lightning component. Which can be reused in any other Salesforce lightning component.

<iframe allow="autoplay; fullscreen" allowfullscreen="" frameborder="0" height="404" src="https://player.vimeo.com/video/335663627" width="640"></iframe>  

**Component:**

**FilesUploader.cmp:**
```html
<aura:component implements="force:appHostable,flexipage:availableForAllPageTypes,flexipage:availableForRecordHome,force:hasRecordId,force:lightningQuickAction" access="global" >
 
    <aura:attribute name="recordId" type="Id"/>
    <aura:attribute name="accept" type="List" default="['.jpg', '.jpeg', '.pdf', '.zip']"/>
    <aura:attribute name="multiple" type="Boolean" default="true"/>
    <aura:attribute name="disabled" type="Boolean" default="false"/>
    
    <aura:registerEvent name="AttachmentUploaderEvent" type="c:AttachmentUploaderEvent"/>
    <aura:registerEvent name="updateAttachmentsAppEvent" type="c:updateAttachmentsAppEvent"/>
    
    <lightning:fileUpload multiple="{!v.multiple}" 
                          accept="{!v.accept}" 
                          recordId="{!v.recordId}" 
                          onuploadfinished="{!c.handleUploadFinished}" />
    
    
</aura:component>
```
<br>
**FilesUploder.js:**
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
This component is a reusable component and can be used in any component and upload files to any record just by specifying the Record Id and multiple = 'true' or 'false'. Specify the attribute multiple = 'true' or 'false' as true if you want to upload multiple files and false when you want to restrict files to be uploaded to only one. It also has an event that fires when files are successfully uploaded.

**FilesUploaderEvent.evt:**
```html
<aura:event type="COMPONENT" description="Event template">
    <aura:attribute name="Uploaded" type="String"/>
</aura:event>
```
<br>
Hope this post helped you gain some knowledge, If you like the content

please don't step back to like my page and leave your feedback, It will motivate me to make more posts. Do subscribe, for getting latest updates directly in your inbox.