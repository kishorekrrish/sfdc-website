---
layout: post
title: Handle Bulk data in Lightning Component
date: '2022-02-30T22:25:00.000-07:00'
categories: [ Lightning, Apex, Visualforce ]
permalink: /handle-bulk-data-lightning.html
description: Handle and display bulk(huge) data in Lightning component. Display more than 50000 records in lightning component
image: assets/images/bulkdata/bulkdata.png
toc: true
beforetoc: "Handle and display bulk(huge) data in Lightning component. Display more than 50000 records in lightning component."
author: kishore
---

## Retrieve Data
There are 3 ways we can retrieve bulk data in Lightning.
1. VF remoting with @readonly annotation (nearly 1 million records)
2. VF remoting with @readonly annotation (multiple small chunks)
3. Lightning controller (multiple small chunks)

we can retrieve data using any of the above 3 ways.

Salesforce says,
![Salesforce on @readonly annotation]({{ site.url }}/assets/images/bulkdata/salesforce-about-readonly.png)

### VF remoting with @readonly annotation (nearly 1 million records)

We can query nearly 1 million records (Salesforce says unlimited records) by annotation an apex method with @readyonly. However, there are certain limitations. @readonly annotation in this context can only be called via vf remoting to serve its purpose to perform unrestricted queries. The @RemoteAction annotation provides support for Apex methods used in Visualforce to be called via JavaScript.

![@readyonly annotation for more than 50000 records]({{ site.url }}/assets/images/bulkdata/vf-remoting.png)

#### Limits:
1. Visualforce Remoting Exception: Remoting response size exceeded maximum of 15 MB. 

![Visualforce Remoting Exception]({{ site.url }}/assets/images/bulkdata/remoting-size-error.png)

This error is not because of apex or SOQL limit, all records are successfully queried and returned, but vf remoting cannot handle data beyond 15 MB and this error is thrown in javaScript. So, to avoid this error fields queried must be limited to 2-3 which doesn't involve text area or any type of field which consumes more storage (ex: text area, rich text, images, etc).

So, if you want to get all records with just one query without keeping offset in play, this approach best serves your need.

### VF remoting with @readonly annotation (multiple small chunks)
If you want to query more fields then the above mentioned methods doesn't serve your purpose. You need to divide the records that you query into small chucks. As you are calling apex from javascript it is very easy to call apex method multiple times to serve your need.

In order to query data in chunks you need to have a hook (`offset`) value, to query more records and again you are hit by one more Salesforce limit `offset` cannot be more than 2000. So what next? We need to add two fields to overcome this situation.

Metadata required:
Fields:
1. Auto Number
2. Formula(number)

you might have already understood what is happening, if not no worries just read ahead.

1. Create an auto number field with `{0}` this formatting and value starting from `1`.
2. Create a formula field converting auto number into its respective number as shown below.
```
VALUE(Auto number field API name)
```
Wait! what if you already have millions of existing records? That doesn't matter because when we create new Auto number fields we an option to generate auto number for existing records by selecting this checkbox `Generate Auto Number for existing records`

![Create Auto Number for existing records]({{ site.url }}/assets/images/bulkdata/auto-number.png)

That's it our setup is ready.


```js
var records = [];
    function apexCaller(varOffSet, totalRecords) {
        Visualforce.remoting.Manager.invokeAction(
            '{!$RemoteAction.RealOnlyApex.getRecords}',
            varOffSet,
            function(result){
                if(result && result.length > 0) {
                    records = records.concat(result);
                    console.log('Total Records: '+records.length);
                    publishMC(JSON.stringify(result));//using LMS to send message to Lightning component
                    if(records.length < totalRecords) {
                        apexCaller(result[result.length - 1].Sequence__c, totalRecords);
                    }
                }
            }
        );
    }
    
    apexCaller(0, 80000);
```
SOQL Query:
```
[SELECT Id  FROM Custom_Object__c WHERE formula__c >: offSet ORDER BY formula__c ASC NULLS LAST LIMIT 10000]
```

#### LIMITS
I don't see and immediate limits, just try to limit the each chunk size so it does't hit 15 MB remoting limit.

### Lightning controller (multiple small chunks)
All Lightning developers are very familiar on how to call apex from Lightning controller to get required data. We are going to do exactly same, but here instead of calling apex once we will be calling multiple times. Here trick is calling apex multiple times and getting data in small batches so we don't hit any limits enforced by Salesforce and get our work done, this step is same as we have done in above point `VF remoting with @readonly annotation (multiple small chunks)`. 

You need to make sure you never try to retrieve more than 50000 records in single batch chunk. 

Example code:
```js
auraAction : function(component, helper, offSet, totalRecords) {
        console.log("In auraAction Method");
        
        var action = component.get("c.getRecs");
        action.setParams({
            offSet : offSet
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log("State", state);
            if(state === 'SUCCESS') {
                var result = response.getReturnValue();
                if(result && result.length > 0) {
                    
                    var records = result;
                    helper.paginateData(component, helper, records);
                    
                    //console.log('existingRecords: '+component.get("v.receivedRecords").length);
                    var existingRecsLength = component.get("v.receivedRecords").length;
                    
                    if(existingRecsLength < totalRecords) {
                        helper.auraAction(component, helper, result[result.length - 1].Sequence__c, totalRecords);
                    }
                    else {
                        component.set("v.queryCompleted", true);
                    }
                    component.set("v.totalQueryRowsReturned", component.get("v.receivedRecords").length);
                }
                
            }
            else {
                console.log("Error In auraAction");
            }
        });
        
        $A.enqueueAction(action);
```

## Transfer Data to Lightning Component

If you have noticed in first two approaches we have use Visualforce to get data, so we need to transfer that data from Visualforce to Lightning Component using Lightning Message Service(LMS). Lightning Message Service lets you publish and subscribe to messages across the DOM and between Aura, Visualforce, and Lightning Web Components.

In this context you need to publish message from Visualforce and Subscribe to messages from Lightning component.

Lightning Message Channel is like any other metadata but as of now it can only be created from metadata API  or using VS code. Create a file with Lightning Message Channel name and append the file name with `.messageChannel-meta.xml`.

Sample xml:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
   <masterLabel>demoChannel</masterLabel>
   <isExposed>true</isExposed>
   <description>This Lightning Message Channel sends information from VF to LWC</description>

   <lightningMessageFields>
       <fieldName>messageToSend</fieldName>
       <description>message To Send</description>
   </lightningMessageFields>

   <lightningMessageFields>
       <fieldName>sourceSystem</fieldName>
       <description>My source</description>
   </lightningMessageFields>

</LightningMessageChannel>
```

Publish Message:
```js
// Load the MessageChannel token in a variable
    var SAMPLEMC = "{!$MessageChannel.demoChannel__c}";
    var records = 'Queried data';
    
    function publishMC() {
        const message = {
            messageToSend: records,
            sourceSystem: "VisualForce"
        };
        sforce.one.publish(SAMPLEMC, message);
    }
    publishMC();
```

Subscribe in AURA:
```html
<lightning:messageChannel type="demoChannel__c" aura:id="sampleMessageChannel" onMessage="{!c.messageReceived}" scope="APPLICATION"/>
```
this is how you need to transfer data from VF to AURA component.

## Display Data

Now it's up to you how you display the data. Implement pagination for better performance and user experience.

## Considerations while handling Huge Data

1. Consider to stringify array before transferring.

Find full implementation of above mentioned approaches in my Github Repository.

[Github Repository link](https://github.com/kishoreBandanadam/HandleBulkData)

Feel free to express your views in the comment section below. Subscribe to receive code snippets directly in your mail box.

Thanks
