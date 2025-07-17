# Smart AI Dashboard for B2B Sales

**Author:** Rajeev Shekhar - rshekhar@salesforce.com

An intelligent Salesforce DX project that deploys an AI-powered Sales Rep Dashboard Home, designed to enhance B2B sales performance through smart insights and automation.

## Prerequisites

Ensure you have the following tools installed before starting:

- **[Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli)** (sf CLI) - Latest version
- **[Node.js](https://nodejs.org/)** - Version 18 or higher
- **[Git](https://git-scm.com/)** - For version control

## Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/salesforce-pixel/b2bSalesDemo2025.git
cd <repository-name>
```

### Step 2: Authenticate with Your Salesforce Org

```bash
sf org login web -a targetOrg
```

> **Note:** Replace `targetOrg` with your preferred alias for the target organization.

### Step 3: Deploy to Salesforce

```bash
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun
```

The metadata will be deployed to your target org automatically.

### Step 4: Configure Permissions

After successful deployment:

1. **Assign Permission Set:** Navigate to your User record and assign the "Sales Alert Object Access" Permission Set
2. **Enable Prerequisites:** Ensure the following features are enabled in your target org:
   - Generative AI
   - Einstein for Sales
   - Prompt Builder

### Step 5: Load Sample Data

Import the sample Sales Alert data to activate the dashboard:

```bash
sf data import tree --files Sales_Alerts__c.json --target-org yourTargetOrg 
```

**Important Configuration Steps:**

1. After data import, navigate to **Sales Alert Object → List View All**
2. Associate Sales Alert records with existing records in your org by updating the `Record_Id__c` field with actual record IDs for:
   - Accounts
   - Opportunities
   - Contacts
   - Onboarding records

> **Performance Note:** The dashboard effectiveness depends on your org's existing data quality. Review the Prompt Template configurations to understand the design patterns, then optimize your data accordingly for desired dashboard outputs.

## Command Reference

### Deployment Commands

```bash
# Standard deployment (recommended)
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun

# Validation-only deployment
sf project deploy start -x manifest/package.xml --dry-run -o targetOrg

# Deploy with test execution
sf project deploy start -x manifest/package.xml -o targetOrg -l RunLocalTests
```

### Org Management Commands

```bash
# View authenticated orgs
sf org list

# Open org in browser
sf org open -o targetOrg

# Check org limits and usage
sf org list limits -o targetOrg
```

## Troubleshooting

**Common Issues:**

- **Permission Errors:** Ensure the Permission Set is properly assigned after deployment
- **Data Issues:** Verify that `Record_Id__c` fields contain valid Salesforce record IDs
- **AI Features:** Confirm that Einstein for Sales and Prompt Builder are enabled in your org

**Support:** For technical issues or questions, contact the author at rshekhar@salesforce.com

## Next Steps

Once deployed and configured, explore the dashboard features and customize the Prompt Templates to match your specific sales processes and data structure for optimal AI-driven insights.