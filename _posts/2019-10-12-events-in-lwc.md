---
layout: post
title: Events in Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/05/events-in-lightning-web-components.html
description: Events in Lightning Web Components. We need custom events to communicate up the containment hierarchy. The child component can tell its parent that something has happened or changed, without events that cannot be done.
image: assets/images/events-in-lwc.png
toc: true
author: kishore
tags:
- Lightning
---

## Why do we need Custom Events?
We need custom events to communicate up the containment hierarchy. The child component can tell its parent that something has happened or changed, without events that cannot be done. 

So why do we need Custom events ??? to communicate up the component hierarchy. That's Right!!

> Note: To communicate down the component containment hierarchy, we can pass properties to the child via HTML attributes, or call its public methods. To communicate down the component hierarchy we don't need events.

To communicate between two different components that do not have any direct relation, we use **publish-subscribe** utility.

## How to create Events?
Events in Lightning web components are built on DOM Events.

###Design Pattern
- Event name called a type
- A configuration to initialize the event
- A JavaScript object that emits the event

To create custom events, Salesforce strongly recommends using the CustomEvent interface. It allows us to pass any kind of data via the detail property.

Lightning web components implement the EventTarget interface, which allows them to dispatch events, listen for events, and handle events.

To create an event, we use the CustomEvent() constructor. To dispatch an event, call the EventTarget.dispatchEvent() method.

**To understand this we will take an example:**

Display a list with the edit button in each row, When the edit button is clicked show a pop up with a form to edit that record.

Here, List is Parent component and form is the child component. When data is changed and saved show new data in the Parent List.

When we save data using child component the parent is unaware that data change has happened or say save button is clicked. To inform the parent about the change, we dispatch an event called __create__ in the child when the save button is clicked in the **handleClick** method and handle it in the parent. To listen for events in Parent, use an HTML attribute with the syntax **on**__eventName__. As our event type(event Name) is create the listener will be **on**__create__.

**Child**
```js
handleClick() {
        
        updateAcc({acc : this.account})
        .then(result => {
            this.record = result;

            //Fire Event so that parent can know
            this.dispatchEvent(new CustomEvent("create"));

            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.record = undefined;
        });
}
```
<br>
This is a simple event like something happened event, It doesn't send any data.

**Parent**
```html
<div class="slds-modal__content slds-p-around_medium">
    <c-update-rec record-id={rec2Id} oncreate={reloadList}>
    </c-update-rec>
</div>
```
<br>
```js
reloadList() {
        this.closeModal();
        return refreshApex(this.Accounts);
}
```
<br>
Here you can use events with data to refresh Apex only when the data is changed. This is just to understand how events work.

## Send Data in Events:
Above what we have seen is just a "something happened" event that doesn't send any data to the parent. Like, assume there is list of accounts displayed with checkbox in each row. When the user selects the checkboxes, the selected accounts should be displayed. In this case, we need to send the selected rows account Ids as data.

**In Child:**
```js
onSelect() {
     const selectedEvent = new CustomEvent('selected', { detail: this.account.Id });
}
```
<br>
**In Parent:**
```js
onselected(event) {
     const accountId = event.detail;
}
```
<br>
Try implementing this. By any means, if you couldn't implement, just drop a comment.

Find full code here: [Salesforce Lightning Web components, Editable List](/2019/04/blog-post.html)

Reference: [Create and Dispatch Events LWC Documentation](https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_create_dispatch){:rel="nofollow"}{:target="_blank"}

If you enjoyed this article, share it with your group!

Subscribe to get the latest updates directly in your inbox.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>