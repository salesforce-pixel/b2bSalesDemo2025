# Salesforce DX Project
Author: Rajeev Shekhar, rshekhar@salesforce.com

A Salesforce DX project to deploy the Smart AI based Sales Rep Dashboard Home.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) (sf CLI)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Git](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/salesforce-pixel/b2bSalesDemo2025.git
cd <repository-name>
```

### 2. Authenticate with Your Salesforce Org

```bash
sf org login web -a targetOrg
```

Replace `targetOrg` with your preferred alias for the target organization.

### 3. Deploy the codebase to the target Salesforce Org

```bash
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun
```

That's it! Your metadata will be deployed to the target org.

### 4. Assign Permission Set

Assign "Sales Alert Object Access" Permission Set to your User record.

### 4. Upload the sample Sales Alert data to run the dashboard

Run the following script and a dataset will be automatically be created in your org
```bash
sf data import tree --files Sales_Alerts__c.json --target-org yourTargetOrg 
```
Once this dataset is uploaded, you need to open the Sales Alert Object --> Go to List View All --> Assing these Sales Alerts to real Account, Opportunities, Contact and Onboarding records via the Record_Id__c field.
Record_Id__c on Sales Alert is just a text field, and it needs the record Id of the respective Parent record.





## Available Commands

### Deploy Commands

```bash
# Deploy with manifest (recommended)
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun

# Deploy with validation only
sf project deploy start -x manifest/package.xml --dry-run -o targetOrg

# Deploy and run tests
sf project deploy start -x manifest/package.xml -o targetOrg -l RunLocalTests
```

### Org Management

```bash
# List authenticated orgs
sf org list

# Open org in browser
sf org open -o targetOrg

# Check org limits
sf org list limits -o targetOrg
```