---
layout: post
title: Build Lightning Web Components Faster with Local Development🔥🔥
date: '2019-10-12T22:25:00.000-07:00'
last_modified_at:   2019-11-03 8:30:00 +0000
categories: [ Lightning Web Components ]
permalink: /2019/09/local-development-lwc.html
description: Build Lightning Web Components Faster with Local Development. What's new is that from now we can not only develop the code locally but also test the code and experience without even pushing the code to Salesforce. As we develop code in VS Code we need to push the code each and every time it's changed back to our Salesforce crm Org to test the changes. In this process, you might even mess up the code which tends to break the existing functionality in the crm client relationship management software.
image: assets/images/lightning-out/local-dev.png
author: kishore
beforetoc: Have you ever heard of the Local Development Environment? As a Salesforce Developers, we used to develop our code in either Developer Org, Sandbox or Scratch Org using developer console. 
To develop newly introduced Lightning Web Components we need to use the VS Code or any code editor of our choice though Salesforce highly recommends VS Code. As we develop code in VS Code we need to push the code each and every time it's changed back to our Salesforce Org to test the changes. If we are not satisfied with the changes we have made we need to make necessary changes and push it again sometimes it really takes a lot of time for these changes to get deployed and tested. In this process, you might even mess up the code which tends to break the existing functionality. Hang on! Local development is her for the rescue.
toc: true
tags:
- Lightning
---

## Common Misconception
Local development is relatively young theory in social sciences based on the identification and use of the resources and endogenous potentialities of a community, neighborhood, city, municipality or equivalent.

 --[Wikipedia](https://en.wikipedia.org/wiki/Local_development){:rel="nofollow"}{:target="_blank"}

If you think Local development as something as this you are totally in a misconception.

Local Development simply means hosting the files in our local computer rather than hosting them on some cloud service, which in our case is Force.com.

You might ask me that's what we are doing the whole time by using VS Code, What's new in that. What's new is that from now we can not only develop the code locally but also test the code and experience without even pushing the code to Salesforce crm software, by which we reduce the risk of breaking the existing functionality in customer crm software and also increasing our productivity as we don't have to wait for the code to be pushed to Salesforce. We can see the results instantly.

![Error Messages](/assets/images/lightning-out/error-messages.png)

## What if there are Errors in your Code 
Salesforce crm has made it easy for us with easy understanding error messages and error handling. Now you get even more sophisticated error messages which not only are descriptive but take us to the line where the error has occurred by providing a link, on clicking which directly takes us to that line in VS Code.

![Data](/assets/images/lightning-out/data.png)

## Can I Access Real-Time CRM Data 
Whats use in everything without salesforce customer management data? Yes! we can access realtime crm data in the local development environment using LDS, UI API and Apex. As Salesforce crm developers we love data.

After complete development and testing locally, you can deploy your bug-free code to Salesforce cloud.

## Features in Future 
- Flexipage Rendering
- Mock data/ Live data Rendering

**Salesforce CLI command for starting local server**

`sfdx force:lightning:lwc:start`

As of now, Flexi-page rendering is not available but as a workaround to test event communication between components locally, you can create a container component and wrap the components for which you want to test in the container.

Local development is only available for LWC as of now. I am so excited to test Local development for LWC and see how it works and increases my productivity and increase customer satisfaction.

It is going to be released in beta real soon. So stay tuned and update your Salesforce CLI with new updates regularly.

I really welcome a healthy technical conversation. Please start a conversation in the comments section below to know more about Local development for LWC. I am excited to share it with you. 

I Dream in Salesforce ☁☁! and love to share them,
Do you?

Please let me know what you dream about Salesforce.

>Note: Please let me know if you find any mistakes.


<span style="font-size: x-small;">Icons made by&nbsp;</span><a href="https://www.flaticon.com/%3C?=_(%27authors/%27)?%3Eitim2101" style="font-size: x-small;" title="itim2101">itim2101</a><span style="font-size: x-small;">&nbsp;from&nbsp;</span><a href="https://www.flaticon.com/" style="font-size: x-small;" title="Flaticon">www.flaticon.com</a>