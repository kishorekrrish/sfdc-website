---
layout: post
title: How to integrate Salesforce with Zomato using Lightning Web Components
date: '2019-10-12T22:25:00.000-07:00'
categories: [ Lightning Web Components, Apex ]
permalink: /2019/04/how-to-integrate-salesforce-with-zomato.html
no_description: In this post we are going to learn how to you integrate Salesforce with Zomato by Http Callouts in LWC.
image: assets/images/integration-zomato/integration-lwc.png
toc: true
author: kishore
tags:
- Lightning
---

In this post we are going to learn how to integrate Salesforce with Zomato by Http Callouts in LWC.

We are all aware of the newly introduced Lightning Web Components by Salesforce. Now we can build Lightning components using two programming models, 

- Lightning Web Components (New model) 
- Aura Components (Original model)

Lightning web components are custom HTML elements built using HTML and modern JavaScript. With newly introduced tech comes new challenges. We are going to overcome those challenges and develop a component.

<iframe allow="autoplay; fullscreen" allowfullscreen="" frameborder="0" height="348" src="https://player.vimeo.com/video/335609844" width="640"></iframe>

In order to integrate with Zomato, we need to add Zomato site URL in Remote Site settings in Salesforce.  

## Remote Site Settings
Salesforce allows you to access external website resources from a Salesforce application for your organization. You can access these external websites through Apex Callouts. To avoid access to malicious websites from Salesforce, the website first needs to be registered with remote site settings. Once the site is registered, it can be used within Salesforce.

In Salesforce go to, 

> Settings ---- Security ---- Remote Site Settings ----New Remote Site

Add the Site name and Url (In site Url add: https://developers.zomato.com) and click on save.

![How to integrate Salesforce with Zomato lwc](/assets/images/integration-zomato/remoteSite.jpg)

In order to integrate with Zomato and access its data, we need to request zomato for an API key, which you can generate from here in less than a minute.

[Generate API Key](https://developers.zomato.com/api#headline2){:rel="nofollow"}{:target="_blank"}

Sign up into Zomato and generate API key by following the instructions.

![How to integrate Salesforce with Zomato using lwc](/assets/images/integration-zomato/apikey.jpg)

You will get the key similar to the above key in the image. Save it, as we are going to use that in the api call.

Zomato API documentation consists of all the services provided. In this session, we are going to use only two services.

1. Location (to get the location details)
2. Search (to search the restaurants based on the selected location)

[Zomato Documentation](https://developers.zomato.com/documentation){:rel="nofollow"}{:target="_blank"}

![How to integrate Salesforce with Zomato using Lightning Web Components](/assets/images/integration-zomato/zomatoServices.jpg)

## Now comes the Code!!!
First, we need to write Apex Classes for **Locations** and **Search** [GET] services provided by Zomato, which are selected in red in the above image. Please refer [How to convert JSON to Apex](/2019/04/how-to-parse-json-response-in-apex.html) to know more about the conversion of JSON to apex.

**Related Post:** [How to convert Json to Apex](/2019/04/how-to-parse-json-response-in-apex.html)

**Controllers:**
ZomatoLocation.cls
ZomatoSearch.cls
ZomatoClass.cls

**Components:**
zomato.js
zomato.html

zomatoDisplayRestaurants.js
zomatoDisplayRestaurants.html

pubsub.js
zomato.html

```html
<template>
    <lightning-card title="Enter Location" icon-name="standard:location">

            <lightning-layout>
                    <lightning-layout-item size="6" padding="around-small">
                        <div class="header-column">
                                <lightning-input label="Location" value={location} onchange={handleLocationChange}></lightning-input></br>
                                <lightning-button label="Select Location" onclick={selectLocation}></lightning-button>
                        </div>
                    </lightning-layout-item>
                    <lightning-layout-item size="6" padding="around-small">
                        <div class="header-column">
                            <lightning-input label="Location Selected" value={selectedLocation} readonly onchange={handleLocationChange}></lightning-input></br>
                            <lightning-input label="Restaurant Name" value={restaurant} onchange={handleRestaurantChange}></lightning-input></br>
                            <lightning-button label="Search Restaurants" onclick={searchRestaurant}></lightning-button>
                        </div>
                    </lightning-layout-item>
                </lightning-layout>
    </lightning-card>
</template>
```
<br>
![How to integrate Salesforce with Zomato using Lightning Web Components](/assets/images/integration-zomato/zomato-gif.png)

When the user enters the location name in the input and clicks Select Location button, the entered location is sent as a parameter to getLocation(location name). The entered string is concatenated to the endpoint URL.

![How to integrate Salesforce with Zomato using Lightning Web Components](/assets/images/integration-zomato/string-search.jpg)

After location is selected and entering Restaurant/Cuisine/Location (optional), on clicking the `search Restaurants` button, the obtained location entity Id and entity type are passed to the method searchRestaurants(entityId, entityType, location), list of restaurants are obtained from the API.

**Zomato.js**
```js
/* eslint-disable no-console */
import { LightningElement, track, wire} from 'lwc';
import getLocation from '@salesforce/apex/zomatoClass.getLocation';
import searchRestaurants from '@salesforce/apex/zomatoClass.searchRestaurants';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class Zomato extends LightningElement {
    location = '';
    entityId = '';
    @track selectedLocation = '';
    entityType = '';
    restaurant = '';

    @wire(CurrentPageReference) pageRef;

    handleLocationChange(event) {
        this.location = event.target.value;
        //console.log('location', this.location);
    }

    handleRestaurantChange(event) {
        this.restaurant = event.target.value;
        //console.log('restaurant', this.restaurant);
    }

    selectLocation() {

        getLocation({ 'locationName' : this.location })
        .then(result => {
            const output = JSON.parse(result);
            this.error = undefined
            console.log("Location::::", output);

            if(output !== undefined) {
                this.entityId = output[0].entity_id;
                this.entityType = output[0].entity_type;
                this.selectedLocation = output[0].title;
                console.log('this.selectedLocation',this.selectedLocation+this.entityId+this.entityType);
                /*this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );*/
            }
            else {
                console.log("No info returned in call back in selectLocation method");
            }
        })
        .catch(error => {
            this.message = undefined;
            this.error = error;
            /*this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );*/
            console.log("error", JSON.stringify(this.error));
        });
    }

    searchRestaurant() {

        console.log('restaurant selection data',this.restaurant+''+this.entityId+''+this.entityType);

        searchRestaurants({ 'entityId' : this.entityId, 'entityType' : this.entityType, 'searchTerm' : this.restaurant})
        .then(result => {
            this.message = JSON.parse(result);
            this.error = undefined
            console.log("Restaurant List::::", this.message);

            if(this.message !== undefined) {
                console.log("searchRestaurants pubSub fires....");
                fireEvent(this.pageRef, 'restaurantListUpdate', this.message);
                /*this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );*/
            }
            else {
                console.log("No info returned in call back in searchRestaurant method");
            }
        })
        .catch(error => {
            this.message = undefined;
            this.error = error;
            /*this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );*/
            console.log("error", JSON.stringify(this.error));
        });
    }
}
```
<br>
When the list of restaurants is obtained successfully, we pass the list to zomatoDisplayRestaurants component using an pubsub event, where the list is displayed. Don't worry about pubsub, just use the given the code, we will learn in-depth about it in further posts. For now, imagine it is similar to Application event in Aura framework.

**Related Post:** [Publish–Subscribe Pattern in Lightning Web Components (pubsub)](/2019/04/publishsubscribe-pattern-in-lightning.html)

**zomatoDisplayRestaurants.html**
```html
<template>
        <lightning-card title="Restaurants nearby..." icon-name="custom:custom65">
 
                <ul class="slds-has-dividers_bottom-space">
                    <template for:each={restaurantsList} for:item='rest'>
                            <li  key={rest.restaurant.id} class="slds-item" value={rest} onclick={handleRestaurantSelected}>
                                    <lightning-tile label={rest.restaurant.name} href="javascript:void(0)" type="media">
                                        <lightning-avatar slot="media" src={rest.restaurant.thumb} fallback-icon-name="standard:person_account" alternative-text={rest.restaurant.name}></lightning-avatar>
                                        <ul class="slds-list_horizontal slds-has-dividers_right">
                                            <li class="slds-item">{rest.restaurant.cuisines} . {rest.restaurant.user_rating.aggregate_rating}</li>
                                            <li class="slds-item">Rs.{rest.restaurant.average_cost_for_two} for 2</li>
                                        </ul>
                                    </lightning-tile>
                            </li>
                    </template>
                </ul>
        </lightning-card>
</template>
```
<br>
Iterates over restaurantsList displays the list.

**zomatoDisplayRestaurants.js**
```js
/* eslint-disable no-console */
import { LightningElement, wire, track} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

export default class ZomatoDisplayRestaurants extends LightningElement {

    @track restaurantsList = [];

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        console.log('In connectedCallBack in ZomatoDisplayRestaurants');
        registerListener('restaurantListUpdate', this.handleRestaurants, this);
    }

    disconnectedCallback() {
        console.log('In disconnectedCallback in ZomatoDisplayRestaurants');
        unregisterAllListeners(this);
    }

    handleRestaurants(restaurants) {
        console.log('In handleRestaurants in ZomatoDisplayRestaurants');
        console.log('restaurants in handle', restaurants);
        //const output001 = JSON.parse(restaurants);
        //console.log('output001', output001);
        this.restaurantsList = restaurants;
        console.log('this.restaurantsList', this.restaurantsList);
    }

    handleRestaurantSelected(event) {
        this.restaurantSelected = event.target.value;
        console.log('event.type', event.type);
        console.log('event.target.value', event.target.value);
        console.log('event.target', JSON.stringify(event.target));
        console.log('event.currentTarget', JSON.stringify(event.currentTarget));
        console.log('this.restaurantSelected', this.restaurantSelected);
    }
}
```
<br>
**ZomatoLocation.cls**
```js
public class ZomatoLocation {

    public List location_suggestions;
    public String status;
    public Integer has_more;
    public Integer has_total;

    public class Location_suggestions {
        public String entity_type;
        public Integer entity_id;
        public String title;
        public Double latitude;
        public Double longitude;
        public Integer city_id;
        public String city_name;
        public Integer country_id;
        public String country_name;
    }
    
    public static ZomatoLocation parse(String json) {
        return (ZomatoLocation) System.JSON.deserialize(json, ZomatoLocation.class);
    }
}
```
<br>
ZomatoLocation.cls class is written based on the JSON response.

**ZomatoSearch.cls**
```js
public class ZomatoSearch {

    public Integer results_found;
    public Integer results_start;
    public Integer results_shown;
    public List restaurants;
    
 public class Restaurant {
  public R R;
  public String apikey;
  public String id;
  public String name;
  public String url;
  public Location location;
  public Integer switch_to_order_menu;
  public String cuisines;
  public Integer average_cost_for_two;
  public Integer price_range;
  public String myCurrency;
  public List offers;
  public Integer opentable_support;
  public Integer is_zomato_book_res;
  public String mezzo_provider;
  public Integer is_book_form_web_view;
  public String book_form_web_view_url;
  public String book_again_url;
  public String thumb;
  public User_rating user_rating;
  public String photos_url;
  public String menu_url;
  public String featured_image;
  public Integer has_online_delivery;
  public Integer is_delivering_now;
  public Integer has_fake_reviews;
  public Boolean include_bogo_offers;
  public String deeplink;
  public Integer is_table_reservation_supported;
  public Integer has_table_booking;
  public String events_url;
  public List establishment_types;
 }

 public class R {
  public Integer res_id;
 }

 public class User_rating {
  public String aggregate_rating;
  public String rating_text;
  public String rating_color;
  public String votes;
  public Integer has_fake_reviews;
 }

 public class Offers {
 }

 public class Restaurants {
  public Restaurant restaurant;
 }

 public class Location {
  public String address;
  public String locality;
  public String city;
  public Integer city_id;
  public String latitude;
  public String longitude;
  public String zipcode;
  public Integer country_id;
  public String locality_verbose;
 }

 
 public static ZomatoSearch parse(String json) {
  return (ZomatoSearch) System.JSON.deserialize(json, ZomatoSearch.class);
 }
}
```
<br>
ZomatoSearch.cls class is written based on the JSON response.

**ZomatoClass.cls**
```js
global class zomatoClass {
    
    
    //Used to get entityId and entityType
    @AuraEnabled
    public static String getLocation(String locationName) {   
        
        String reponse;
        
        List locationList = new List();
        List locationList1 = new List();
        // Instantiate a new http object
        Http h = new Http();
        String url = 'https://developers.zomato.com/api/v2.1/locations';
        url += '?query='+locationName;
        
        // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('user-key', '3e8b235d70f0a4e7f0e5e6feebc29dd0');
        req.setMethod('GET');
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        system.debug('response:::::'+res.getBody());
        reponse = res.getBody();
        //return res.getBody();
        if(res.getStatusCode() == 200){
            system.debug('Status::::::::'+res.getStatus());
            
            ZomatoLocation.Location_suggestions locationClass = new ZomatoLocation.Location_suggestions();
            
            ZomatoLocation jsonApex = ZomatoLocation.parse(reponse);
            
            system.debug('jsonApex::::::'+jsonApex.Location_suggestions);
            
            for(ZomatoLocation.Location_suggestions loc : jsonApex.Location_suggestions){
                System.debug('location details'+loc);
                //System.debug('Categories:' + category.Categories.id+':'+category.Categories.name);
                locationList.add(loc);
            }
            system.debug('locationList'+locationList);
        }
        system.debug('locationList222'+locationList);
        String locationString = System.JSON.serialize(locationList);
        return locationString;
        
    }
    
    
    @AuraEnabled
    public static String searchRestaurants(string entityId, string entityType, string searchTerm) {   
        string reponse;
        System.debug('Data::::'+ entityId+''+entityType+''+searchTerm);
        List restaurantsList = new List();
        // Instantiate a new http object
        Http h = new Http();
        String url = 'https://developers.zomato.com/api/v2.1/search';
        url += '?entity_id='+ entityId;
        url += '&entity_type='+ entityType;
        url += '&q='+searchTerm;
        
        // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('user-key', '3e8b235d70f0a4e7f0e5e6feebc29dd0');
        req.setMethod('GET');
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        system.debug('response:::::'+res.getBody());
        reponse = res.getBody();
        //return res.getBody();
        //locationDetailsList = new List();
        if(res.getStatusCode() == 200){
            system.debug('Status::::::::'+res.getStatus());
            
            //string strResponse = reponse.replace('Currency', 'myCurrency');
            //System.debug('strResponse:::::'+strResponse);
            
            ZomatoSearch jsonApex = ZomatoSearch.parse(res.getBody());
            
            system.debug('jsonApex::::::'+jsonApex);
            
            for(ZomatoSearch.Restaurants rest : jsonApex.restaurants){
                System.debug('Restaurants:::::'+rest.Restaurant.name);
                //System.debug('Categories:' + category.Categories.id+':'+category.Categories.name);
                restaurantsList.add(rest);
            }
            system.debug('restaurantsList::::'+restaurantsList);
        }
        String restaurantString = System.JSON.serialize(restaurantsList);
        return restaurantString;
    } 
}
```
<br>
Hope this post helped you gain some knowledge, If you like the please don't step back to like my page and leave your feedback, It will motivate me to make more posts.


Subscribe for getting the latest updates directly in your inbox.









