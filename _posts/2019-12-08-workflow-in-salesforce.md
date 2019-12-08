---
layout: post
title: Workflow Rules in Salesforce for Automation
date: '2019-12-08T22:25:00.000-07:00'
categories: [ Automation, Salesforce Automation ]
permalink: /workflow-rules-in-salesforce.html
description: Workflow Rule is the automation tool provided by Salesforce to achieve automation of repetitive manual tasks. Workflows lets you automate standard internal procedures and processes to save time.
image: assets/images/workflow/workflow.png
toc: true
beforetoc: "To achieve the automation of simple repetitive tasks we use automation tools. Salesforce provides automation tools like Workflows, Process Builder, Approval Process and Lightning Flow Builder."
author: kishore
tags:
- Automation
---

## WorkFlow
Workflow Rule is a basic automation tool provided by **Salesforce** to achieve automation of repetitive manual tasks without any code and just by simple clicks. Workflow rule is one of the old automation tools, as a best practice Salesforce always recommends to go with Workflow rule first unless your requirement contains something that cannot be achieved using Workflow Rule.

Workflow lets you automate standard internal procedures and processes to save time. A workflow rule is the main container for a set of workflow instructions. These instructions can always be summed up in an if/then statement.

<a href="{{ site.url }}/assets/files/Workflow_Rules_In_Salesforce.pdf" class="btn btn-primary" download>Download PDF to read later</a>

**Workflow rules have two key components**
 - **Criteria**
   - If criteria evaluate to "True" the specified actions get executed, if criteria evaluate to "False" the specified actions don't get evaluated. It's simple if this then does that principal.
    - There are two types of criteria, Evaluation criteria, and Rule criteria. Evaluation criteria specify when the workflow has to be triggered and rule criteria tell the triggered workflow when to execute the workflow actions. 
 - **Actions**
   - These are the set of actions that get executed when the criteria evaluate to true.


## Workflow Actions
Workflow actions are the set of actions that can be performed when certain criteria or no criteria are met.

 - Create Tasks
 - Update Field
 - Outbound Messages
 - Email Alert
 - Send Actions
 
## Create Workflow Rule

To create a workflow rule in salesforce go to,

> Setup --> Workflow Rules --> New Rule --> Object

***Select the evaluation criteria,***

![Select the evaluation criteria in workflow]({{ site.url }}/assets/images/workflow/workflow-criteria.png)

 - **created**
   -  Evaluate the rule criteria each time a record is created. If the rule criteria are met, run the rule. Ignore all updates to existing records. 
     - With this option, the rule never runs more than once per record.
 - **created, and every time it’s edited** 
   - Evaluate the rule criteria each time a record is created or updated. If the rule criteria are met, run the rule.
   - With this option, the rule repeatedly runs every time a record is edited as long as the record meets the rule criteria. 
 
- **created, and any time it’s edited to subsequently meet criteria**
  - For a new record, run the rule if the rule criteria are met.
  - For an updated record, run the rule only if the record is changed from not meeting the rule criteria to meeting the rule criteria.

***Set Rule Criteria,***
Set the rule criteria using the default conditionality table or using the formula evaluator.

![Set the Rule criteria in workflow]({{ site.url }}/assets/images/workflow/workflow-rule-criteria.png)

![Select the evaluation criteria in workflow]({{ site.url }}/assets/images/workflow/workflow-rule-criteria-formula.png)

***Set the Actions to be performed,***
Set any of the below-mentioned actions
 - Create Tasks
 - Update Field
 - Outbound Messages
 - Email Alert

 ![Set the Actions to be performed in workflow]({{ site.url }}/assets/images/workflow/workflow-actions.png)

***Activate the Workflow Rule***
Activate the workflow rule for automating the tasks for your user.
![Activate workflow rule]({{ site.url }}/assets/images/workflow/workflow-activate.png)

If you find this article useful, please let me know in the comments below. 
Write to me about your favourite automation tool in salesforce.