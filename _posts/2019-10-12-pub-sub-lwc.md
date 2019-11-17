---
layout: post
title: Publish–Subscribe Pattern in Lightning Web Components (pubsub)
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components ]
permalink: /2019/04/publishsubscribe-pattern-in-lightning.html
description: Publish–Subscribe Pattern in Lightning Web Components (pubsub). How do components communicate with each other. In a publish-subscribe pattern, one component publishes an event while the other components subscribe to receive and handle the event. Every component that subscribes to the event receives the event. Lets say, you have two components to a Lightning page in App Builder, then use the pubsub module to send events between them. Pubsub is not given by default, you have to add it to by yourself. You can get the file from here.
image: assets/images/pub-sub.png
toc: true
author: kishore
tags:
- Lightning
---

## How do components communicate with each other
To communicate between components that are not in the same DOM tree, we use a singleton library that follows the publish-subscribe pattern.

In a publish-subscribe pattern, one component publishes an event while the other components subscribe to receive and handle the event. Every component that subscribes to the event receives the event. Let's say, you have two components to a Lightning page in App Builder, then use the pubsub module to send events between them. Pubsub is not given by default, you have to add it to by yourself. You can get the file from here.

[PubSub file](https://gist.github.com/kishoreBandanadam/051952c51a6df85ae342db7b7b443644){:rel="nofollow"}{:target="_blank"}

**pubSub.js**
```js
/**
 * A basic pub-sub mechanism for sibling component communication
 *
 * TODO - adopt standard flexipage sibling communication mechanism when it's available.
 */

const events = {};

const samePageRef = (pageRef1, pageRef2) => {
    const obj1 = pageRef1.attributes;
    const obj2 = pageRef2.attributes;
    return Object.keys(obj1)
        .concat(Object.keys(obj2))
        .every(key => {
            return obj1[key] === obj2[key];
        });
};

/**
 * Registers a callback for an event
 * @param {string} eventName - Name of the event to listen for.
 * @param {function} callback - Function to invoke when said event is fired.
 * @param {object} thisArg - The value to be passed as the this parameter to the callback function is bound.
 */
const registerListener = (eventName, callback, thisArg) => {
    // Checking that the listener has a pageRef property. We rely on that property for filtering purpose in fireEvent()
    if (!thisArg.pageRef) {
        throw new Error(
            'pubsub listeners need a "@wire(CurrentPageReference) pageRef" property'
        );
    }

    if (!events[eventName]) {
        events[eventName] = [];
    }
    const duplicate = events[eventName].find(listener => {
        return listener.callback === callback && listener.thisArg === thisArg;
    });
    if (!duplicate) {
        events[eventName].push({ callback, thisArg });
    }
};

/**
 * Unregisters a callback for an event
 * @param {string} eventName - Name of the event to unregister from.
 * @param {function} callback - Function to unregister.
 * @param {object} thisArg - The value to be passed as the this parameter to the callback function is bound.
 */
const unregisterListener = (eventName, callback, thisArg) => {
    if (events[eventName]) {
        events[eventName] = events[eventName].filter(
            listener =>
                listener.callback !== callback || listener.thisArg !== thisArg
        );
    }
};

/**
 * Unregisters all event listeners bound to an object.
 * @param {object} thisArg - All the callbacks bound to this object will be removed.
 */
const unregisterAllListeners = thisArg => {
    Object.keys(events).forEach(eventName => {
        events[eventName] = events[eventName].filter(
            listener => listener.thisArg !== thisArg
        );
    });
};

/**
 * Fires an event to listeners.
 * @param {object} pageRef - Reference of the page that represents the event scope.
 * @param {string} eventName - Name of the event to fire.
 * @param {*} payload - Payload of the event to fire.
 */
const fireEvent = (pageRef, eventName, payload) => {
    if (events[eventName]) {
        const listeners = events[eventName];
        listeners.forEach(listener => {
            if (samePageRef(pageRef, listener.thisArg.pageRef)) {
                try {
                    listener.callback.call(listener.thisArg, payload);
                } catch (error) {
                    // fail silently
                }
            }
        });
    }
};

export {
    registerListener,
    unregisterListener,
    unregisterAllListeners,
    fireEvent
};
```
<br>
## Fire an event
To fire an even using Publish–Subscribe Pattern. In the js file of the component from where you want to fire the event, import the two lines shown below
```js
import{CurrentPageReference}
      from 'lightning/navigation';
import { fireEvent } 
       from 'c/pubsub';
```
<br>
Whenever the required condition is met then use the following code to fire the even.
```js
fireEvent(this.pageRef,
     'restaurantListUpdate',
       this.message);


fireEvent({pageReference}, {eventName}, {data})
```
<br>
## Subscribe and Receive the Event
In the component where you want to subscribe and receive event, import the following,

```js
import{CurrentPageReference} 
   from 'lightning/navigation';
import { registerListener,
   unregisterAllListeners } 
   from 'c/pubsub';

connectedCallback() {
registerListener('restaurantListUpdate' 
             ,this.handleRestaurants, 
             this);
}

disconnectedCallback() {
   unregisterAllListeners(this);
}
```
<br>

In connectedCallback we subscribe to the event, In disconnectedCallback we un-subscribe.

Hope this post helped you gain some knowledge, If you like the content please don't step back to like my page and leave your feedback, It will motivate me to make more posts.

Subscribe to get the latest updates directly in your inbox.