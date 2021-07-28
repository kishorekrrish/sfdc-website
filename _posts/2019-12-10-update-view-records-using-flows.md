---
layout: post
title: Update Record using Flow Builder in Salesforce
date: '2019-12-10T22:25:00.000-07:00'
categories: [ Automation, Salesforce Automation ]
permalink: /update-view-records-using-flows-salesforce.html
no_description: Use Flow Builder to create-update records in Salesforce without code and just clicks. Mastering flows can reduce the usage of code by 70-80%.
image: assets/images/flows/update-flow.png
toc: true
beforetoc: "To create or update records in Salesforce you no longer need to write a Lightning component, you can make use of Lightning Flow Builder where you can create any requirement just by clicks. Mastering flows can reduce the usage of code by 70-80%, and you don't have to write any test classes for what you build. Flows come with a component visibility option with which you can show/hide flow components conditionally."
author: kishore
tags:
- Automation
---


**Let's create a flow to update and view a Contact record**

![Main lightning flow builder flow]({{ site.url }}/assets/images/flows/Main-flow-diagram.png)

## Preview

<iframe style="width:100%;" height="315" src="https://www.youtube.com/embed/ZMQkFouwnX4" frameborder="0" allowfullscreen></iframe>

## Flow Elements Required

 - Get Records Element 
 - Screen Element 
 - Update Records Element

## Flow Variables Required

- recordId (Text)
- accountLookupId (Text)
- varContactRecordValues (Record)

**recordId (Text)**
![record Id flow builder]({{ site.url }}/assets/images/flows/recordId-variable.png)

**accountLookupId (Text)**
![account lookup Id flow builder]({{ site.url }}/assets/images/flows/account-lookup-id-variable.png)

**varContactRecordValues (Record)**
![contact record flow builder]({{ site.url }}/assets/images/flows/contact-record-values-variable-flow.png)

## All Resources Used
![All Resources Used flow builder]({{ site.url }}/assets/images/flows/resources.png)

## Get Records Element
Get Records Element is used to find and get the records from the Salesforce database. In this case, we will use Get Records Element to get the record using record Id, for this, we need to create a variable named "recordId" and allow it for input and use this record Id to filter the contacts and get the contact record.

![Get Records Element in Lightning flow builder]({{ site.url }}/assets/images/flows/get-records.png)

## Screen Element
There are a lot of screen components available. In this case drag and drop **Name**  (for "First Name and  Last Name") and **Lookup**  (lookup tp Account) components with configuration mentioned in the below images.

![Screen Component Lghtning flow Builder]({{ site.url }}/assets/images/flows/screen-component-for-edit.png)

**Name Element**
![Name Screen Element in Lightning flow builder]({{ site.url }}/assets/images/flows/screen-name-component.png)

**Lookup Element**
![Lookup Screen Element in Lightning flow builder]({{ site.url }}/assets/images/flows/lookup-screen-component.png)

## Update Records Element
Filter the contact you want to update using record Id variable and set Field values for the Contact Records with field mapping.

![Lookup Screen Element in Lightning flow builder]({{ site.url }}/assets/images/flows/update-records.png)

## Add Flow Component to Record Page
Drag and drop Lightning flow to the record page with following configuration.

![Add Flow Component to Record Page in Lightning flow builder]({{ site.url }}/assets/images/flows/appbuilder-page-flow.png)

## Live Flow Component
Enjoy the live easy made flow component to edit and view contact record.

![Live Flow Component Record Page in Lightning flow builder]({{ site.url }}/assets/images/flows/flow-component.png)

Write to me how you feel about new Lightning Flow Builder and how it made your life easier.




