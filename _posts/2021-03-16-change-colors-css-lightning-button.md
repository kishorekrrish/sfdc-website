---
layout: post
title: Change colors for lightning-button with css styling hooks
date: '2021-03-16T17:25:00.000+05:30'
categories: [ LWC, Lightning Web Components ]
permalink: /change-css-lightning-button.html
description: Change css for standard base lightning components using styling hooks
image: assets/images/styling-hooks/header.png
toc: false
beforetoc: "Change css for standard base lightning components using styling hooks"
author: kishore
---

Now we customize CSS for standard lightning base components using styling hooks.

# What are Styling Hooks
Styling hooks use CSS custom properties which make it easy to customize component styling. We can use CSS Custom Properties as hooks to customize the SLDS component with your style.

# Where can I find Styling Hooks?
You can find styling hooks for base lightning components on the SLDS website. For example to find styling hooks for lightning-button base components navigate to Lightning Component Library and in the documentation section, you can find "**Customize Component Styling**" here you will find styling hooks for that component as shown below.

![Sample Styling Hooks]({{ site.url }}/assets/images/styling-hooks/component-library.png)

# How does a Styling Hook look like

    --sds-c-button-brand-color-background : green;

![SLDS Styling Hooks]({{ site.url }}/assets/images/styling-hooks/styling-hooks.png)

# How to use a Styling Hooks
Styling hooks can be used in many ways, have a look at the example below
```html
<template>
	<lightning-button class="button" variant="brand" label="Custom" title="custom"></lightning-button>
</template>
```
```css
lightning-button.button {
	--sds-c-button-brand-color-background : green;
}
```

![Customised lightning-button]({{ site.url }}/assets/images/styling-hooks/styled-button.png)

In the above example, I aim to change the lightning-button color to green.

Learn more about [styling hooks](https://www.lightningdesignsystem.com/platforms/lightning/styling-hooks/){:rel="nofollow"}{:target="_blank"}


**Reference links**
[Styling hooks](https://www.lightningdesignsystem.com/platforms/lightning/styling-hooks/){:rel="nofollow"}{:target="_blank"}
[Lightning Component Library](https://developer.salesforce.com/docs/component-library/bundle/lightning-button/documentation){:rel="nofollow"}{:target="_blank"}
[SLDS](https://www.lightningdesignsystem.com/components/buttons/#Styling-Hooks-Overview){:rel="nofollow"}{:target="_blank"}
[LWC Documentation](https://developer.salesforce.com/docs/component-library/documentation/en/50.0/lwc/lwc.create_components_css_custom_properties){:rel="nofollow"}{:target="_blank"}