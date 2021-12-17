---
layout: post
title: Send Email - LWC
date: '2021-12-17T22:07:00.000+05:30'
categories: [ LWC, Lightning Web Components ]
permalink: /send-email-lwc.html
no_description: Dynamic component to configure send email
image: assets/images/email-lwc/emailheader.png
toc: false
beforetoc: "featured send email component built with LWC"
author: kishore
---

Customizable email component.

## Features

 1. Allows you to fetch emails from Contact and User objects, can be extended for any custom object
 2. Allows you to enter static emails
 3. Contains validations on To and Cc address to allow only valid emails (only checks for format)
 4. Allows user to upload and attach files
 5. Contains re-usable input component. (to add Bcc etc.)

## Images

![Email Lwc]({{ site.url }}/assets/images/emali-lwc/email.png)
![Email Address]({{ site.url }}/assets/images/emali-lwc/email-address.png)
![Search Email]({{ site.url }}/assets/images/emali-lwc/search-email.png)
![Upload]({{ site.url }}/assets/images/emali-lwc/upload.png)

In Aura we can write expression as seen above, where as in lwc something like this is not possible to directly write in markup. We need write expressions in JavaScript and use their result in markup.

## Code

### emailLwc.html

```html
<template>
    <article class="slds-card">
        <!-- Alert -->
        <div if:true={noEmailError} class="slds-notify slds-notify_alert slds-alert_error" role="alert">
            <span class="slds-assistive-text">error</span>
            <span
                class="slds-icon_container slds-icon-utility-error slds-m-right_x-small"
                title="Description of icon when needed"
            >
                <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                    <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#error"></use>
                </svg>
            </span>
            <h2>
                Please add a recepient
            </h2>
            <div class="slds-notify__close">
                <button
                    class="slds-button slds-button_icon slds-button_icon-small slds-button_icon-inverse"
                    title="Close"
                >
                    <svg class="slds-button__icon" aria-hidden="true">
                        <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                    </svg>
                    <span class="slds-assistive-text">Close</span>
                </button>
            </div>
        </div>
        <!-- Alert -->
        <!-- Alert -->
        <div if:true={invalidEmails} class="slds-notify slds-notify_alert slds-alert_error" role="alert">
            <span class="slds-assistive-text">error</span>
            <span
                class="slds-icon_container slds-icon-utility-error slds-m-right_x-small"
                title="Description of icon when needed"
            >
                <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                    <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#error"></use>
                </svg>
            </span>
            <h2>
                Some of the emails added are invalid
            </h2>
            <div class="slds-notify__close">
                <button
                    class="slds-button slds-button_icon slds-button_icon-small slds-button_icon-inverse"
                    title="Close"
                >
                    <svg class="slds-button__icon" aria-hidden="true">
                        <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                    </svg>
                    <span class="slds-assistive-text">Close</span>
                </button>
            </div>
        </div>
        <!-- Alert -->
        <div class="slds-card__body slds-card__body_inner">
            <!-- Body -->
            <div class="slds-form form slds-var-p-top_small">
                <div class="slds-form-element slds-form-element_horizontal slds-form-element_1-col">
                    <label class="slds-form-element__label" for="to">To</label>
                    <div class="slds-form-element__control">
                        <c-email-input onselection={handleToAddressChange}></c-email-input>
                    </div>
                </div>

                <div class="slds-form-element slds-form-element_horizontal slds-form-element_1-col">
                    <label class="slds-form-element__label" for="cc">Cc</label>
                    <div class="slds-form-element__control">
                        <c-email-input onselection={handleCcAddressChange}></c-email-input>
                    </div>
                </div>

                <div class="slds-form-element">
                    <label class="slds-form-element__label" for="subject"> </label>
                    <div class="slds-form-element__control">
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={subject}
                            placeholder="Subject..."
                            class="slds-input"
                            onchange={handleSubjectChange}
                        />
                    </div>
                </div>

                <div class="slds-form-element">
                    <div class="slds-form-element__control slds-var-p-top_small">
                        <lightning-input-rich-text value={body} onchange={handleBodyChange}></lightning-input-rich-text>
                    </div>
                </div>
            </div>
        </div>
        <div class="slds-var-p-around_medium">
            <template for:each={files} for:item="file" for:index="index">
                <lightning-pill
                    key={file.contentVersionId}
                    label={file.name}
                    onremove={handleRemove}
                    data-id={file.contentVersionId}
                    data-index={index}
                >
                    <lightning-icon
                        icon-name="doctype:attachment"
                        size="xx-small"
                        alternative-text="attach"
                    ></lightning-icon>
                </lightning-pill>
            </template>
        </div>
        <div class="slds-grid slds-grid_align-end slds-var-p-around_x-small">
            <div class="slds-col slds-var-p-right_x-small slds-var-p-bottom_x-small slds-is-relative">
                <!-- Pop over -->
                <section
                    if:true={wantToUploadFile}
                    aria-describedby="dialog-body-id-108"
                    aria-labelledby="dialog-heading-id-3"
                    class="slds-popover slds-popover_walkthrough slds-nubbin_bottom slds-is-absolute popover"
                    role="dialog"
                >
                    <button
                        class="
                            slds-button slds-button_icon slds-button_icon-small
                            slds-float_right
                            slds-popover__close
                            slds-button_icon-inverse
                        "
                        title="Close dialog"
                    >
                        <lightning-button-icon
                            variant="bare-inverse"
                            size="small"
                            onclick={toggleFileUpload}
                            icon-name="utility:close"
                            alternative-text="close"
                        ></lightning-button-icon>
                        <span class="slds-assistive-text">Close</span>
                    </button>
                    <header class="slds-popover__header slds-p-vertical_medium">
                        <h2 id="dialog-heading-id-3" class="slds-text-heading_medium">Upload Files</h2>
                    </header>
                    <div class="slds-popover__body" id="dialog-body-id-108">
                        <lightning-file-upload
                            label="Attach files"
                            name="fileUploader"
                            accept={acceptedFormats}
                            record-id={myRecordId}
                            onuploadfinished={handleUploadFinished}
                            multiple
                        >
                        </lightning-file-upload>
                    </div>
                </section>
                <!-- Pop over -->
                <lightning-button-icon
                    icon-name="utility:attach"
                    onclick={toggleFileUpload}
                    alternative-text="Attach File"
                    title="Attach_File"
                >
                </lightning-button-icon>
            </div>
            <div class="slds-col slds-var-p-right_x-small slds-var-p-bottom_x-small">
                <lightning-button label="Reset" title="reset" onclick={handleReset}></lightning-button>
            </div>
            <div class="slds-col slds-var-p-right_x-small slds-var-p-bottom_x-small">
                <lightning-button
                    variant="brand"
                    label="Send"
                    title="send"
                    onclick={handleSendEmail}
                ></lightning-button>
            </div>
        </div>
    </article>
</template>
```

```js
/* eslint-disable no-alert */
import { LightningElement, track } from "lwc";
import sendEmailController from "@salesforce/apex/EmailClass.sendEmailController";

export default class EmailLwc extends LightningElement {
    toAddress = [];
    ccAddress = [];
    subject = "";
    body = "";
    @track files = [];

    wantToUploadFile = false;
    noEmailError = false;
    invalidEmails = false;

    toggleFileUpload() {
        this.wantToUploadFile = !this.wantToUploadFile;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.files = [...this.files, ...uploadedFiles];
        this.wantToUploadFile = false;
    }

    handleRemove(event) {
        const index = event.target.dataset.index;
        this.files.splice(index, 1);
    }

    handleToAddressChange(event) {
        this.toAddress = event.detail.selectedValues;
    }

    handleCcAddressChange(event) {
        this.ccAddress = event.detail.selectedValues;
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleBodyChange(event) {
        this.body = event.target.value;
    }

    validateEmails(emailAddressList) {
        let areEmailsValid;
        if(emailAddressList.length > 1) {
            areEmailsValid = emailAddressList.reduce((accumulator, next) => {
                const isValid = this.validateEmail(next);
                return accumulator && isValid;
            });
        }
        else if(emailAddressList.length > 0) {
            areEmailsValid = this.validateEmail(emailAddressList[0]);
        }
        return areEmailsValid;
    }

    validateEmail(email) {
        console.log("In VE");
        const res = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()s[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        console.log("res", res);
        return res.test(String(email).toLowerCase());
    }

    handleReset() {
        this.toAddress = [];
        this.ccAddress = [];
        this.subject = "";
        this.body = "";
        this.files = [];
        this.template.querySelectorAll("c-email-input").forEach((input) => input.reset());
    }

    handleSendEmail() {
        this.noEmailError = false;
        this.invalidEmails = false;
        if (![...this.toAddress, ...this.ccAddress].length > 0) {
            this.noEmailError = true;
            return;
        }
        
        if (!this.validateEmails([...this.toAddress, ...this.ccAddress])) {
            this.invalidEmails = true;
            return;
        }

        let emailDetails = {
            toAddress: this.toAddress,
            ccAddress: this.ccAddress,
            subject: this.subject,
            body: this.body
        };

        sendEmailController({ emailDetailStr: JSON.stringify(emailDetails) })
            .then(() => {
                console.log("Email Sent");
            })
            .catch((error) => {
                console.error("Error in sendEmailController:", error);
            });
    }
}
```

```css
.form {
    background: white;
}

.popover {
    left: -145px;
    bottom: 52px;
}
```

```html
<template>
    <div class="slds-combobox_container">
        <div class={boxClass}>
            <div class="slds-combobox__form-element slds-has-focus">
                <template for:each={selectedValues} for:item="selectedValue" for:index="index">
                    <lightning-pill
                        key={selectedValue}
                        label={selectedValue}
                        onremove={handleRemove}
                        data-index={index}
                    ></lightning-pill>
                </template>
                <!-- sldsValidatorIgnoreNextLine -->
                <input
                    type="text"
                    id="to"
                    class="input"
                    required
                    onkeyup={handleInputChange}
                    onkeypress={handleKeyPress}
                    onblur={handleBlur}
                />
            </div>
            <!-- List Start -->
            <div
                id="listbox-id-3"
                class="slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid"
                role="listbox"
                if:true={hasItems}
            >
                <ul class="slds-listbox slds-listbox_vertical" role="presentation">
                    <template for:each={items} for:item="item" for:index="index">
                        <li
                            key={item.Id}
                            data-id={item.Id}
                            onclick={onSelect}
                            role="presentation"
                            class="slds-listbox__item"
                        >
                            <div
                                aria-selected="true"
                                class="
                                    slds-media
                                    slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta
                                "
                                role="option"
                                tabindex="0"
                            >
                                <span class="slds-media__figure slds-listbox__option-icon">
                                    <span class="slds-icon_container slds-icon-standard-account">
                                        <svg class="slds-icon slds-icon_small" aria-hidden="true">
                                            <use
                                                xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#account"
                                            ></use>
                                        </svg>
                                    </span>
                                </span>
                                <span class="slds-media__body">
                                    <span class="slds-listbox__option-text slds-listbox__option-text_entity"
                                        >{item.Name}</span
                                    >
                                    <span class="slds-listbox__option-meta slds-listbox__option-meta_entity"
                                        >{item.Email}</span
                                    >
                                </span>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
            <!-- List End -->
        </div>
    </div>
</template>
```

```js
import { LightningElement, track, api } from "lwc";
import search from "@salesforce/apex/EmailClass.search";

export default class EmailInput extends LightningElement {
    @track items = [];
    searchTerm = "";
    blurTimeout;
    boxClass = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";

    _selectedValues = [];
    selectedValuesMap = new Map();

    get selectedValues() {
        return this._selectedValues;
    }
    set selectedValues(value) {
        this._selectedValues = value;

        const selectedValuesEvent = new CustomEvent("selection", { detail: { selectedValues: this._selectedValues} });
        this.dispatchEvent(selectedValuesEvent);
    }

    handleInputChange(event) {
        event.preventDefault();
        if (event.target.value.length < 3) {
            return;
        }

        search({ searchString: event.target.value })
            .then((result) => {
                this.items = result;
                if (this.items.length > 0) {
                    this.boxClass =
                        "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    handleBlur() {
        console.log("In onBlur");
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = setTimeout(() => {
            this.boxClass = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
            const value = this.template.querySelector('input.input').value
            if (value !== undefined && value != null && value !== "") {
                this.selectedValuesMap.set(value, value);
                this.selectedValues = [...this.selectedValuesMap.keys()];
            }

            this.template.querySelector('input.input').value = "";
        }, 300);
    }

    get hasItems() {
        return this.items.length;
    }

    handleKeyPress(event) {
        if (event.keyCode === 13) {
            event.preventDefault(); // Ensure it is only this code that runs

            const value = this.template.querySelector('input.input').value;
            if (value !== undefined && value != null && value !== "") {
                this.selectedValuesMap.set(value, value);
                this.selectedValues = [...this.selectedValuesMap.keys()];
            }
            this.template.querySelector('input.input').value = "";
        }
    }

    handleRemove(event) {
        const item = event.target.label;
        this.selectedValuesMap.delete(item);
        this.selectedValues = [...this.selectedValuesMap.keys()];
    }

    onSelect(event) {
        this.template.querySelector('input.input').value = "";
        let ele = event.currentTarget;
        let selectedId = ele.dataset.id;
        let selectedValue = this.items.find((record) => record.Id === selectedId);
        this.selectedValuesMap.set(selectedValue.Email, selectedValue.Name);
        this.selectedValues = [...this.selectedValuesMap.keys()];

        //As a best practise sending selected value to parent and inreturn parent sends the value to @api valueId
        let key = this.uniqueKey;
        const valueSelectedEvent = new CustomEvent("valueselect", {
            detail: { selectedId, key }
        });
        this.dispatchEvent(valueSelectedEvent);

        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
    }

    @api reset() {
        this.selectedValuesMap = new Map();
        this.selectedValues = [];
    }

    @api validate() {
        this.template.querySelector('input').reportValidity();
        const isValid = this.template.querySelector('input').checkValidity();
        return isValid;
    }
}
```

```css
.input {
    border-top-style: hidden;
    border-right-style: hidden;
    border-left-style: hidden;
    border-bottom-style: solid;
    border-bottom-color: #dddbda;
    background-color: hidden;
    width: 100%;
}

.input:focus {
    outline-width: 0;
}
```

```java
public with sharing class EmailClass {

    @AuraEnabled
    public static List<SObject> search(String searchString) {
        List<SObject> searchList = new List<SObject>();
        try {
            String searchStr = '*' + searchString + '*';
            String searchquery =
                'FIND\'' +
                searchStr +
                '\'IN ALL FIELDS RETURNING Contact(id, name, email where email != null), User(id, name, email where email != null AND isActive = true) LIMIT 10';
            List<List<SObject>> searchResult = search.query(searchquery);
            for (List<SObject> curList : searchResult) {
                searchList.addAll(curList);
            }
            system.debug('searchList:::' + searchList.size());
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return searchList;
    }


    @AuraEnabled
    public static void sendEmailController(String emailDetailStr) {
        EmailWrapper emailDetails = (EmailWrapper) JSON.deserialize(emailDetailStr, EmailWrapper.class);
        Messaging.reserveSingleEmailCapacity(1);
        try {
            messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
            mail.setToAddresses(emailDetails.toAddress);
            mail.setCcAddresses(emailDetails.ccAddress);
            mail.setReplyTo('test.k@xyz.com');
            mail.setSenderDisplayName('Test');
            mail.setSubject(emailDetails.subject);
            mail.setHtmlBody(emailDetails.body);
            mail.setEntityAttachments(emailDetails.files);
            Messaging.sendEmail(new List<messaging.SingleEmailMessage>{ mail });
        } catch (exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    Class EmailWrapper {
        public List<String> toAddress;
        public List<String> ccAddress;
        public String subject;
        public String body;
        public List<String> files;
    }
}
```

- [Github Link for complete code](https://github.com/kishoreBandanadam/EmailLwc){:target="_blank"}
