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
git clone <repository-url>
cd <repository-name>
```

### 2. Authenticate with Your Salesforce Org

```bash
sf org login web -a targetOrg
```

Replace `targetOrg` with your preferred alias for the target organization.

### 3. Deploy to Salesforce

```bash
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun
```

That's it! Your metadata will be deployed to the target org.

## Project Structure

```
├── .forceignore          # Files to ignore during deployment
├── .gitignore            # Git ignore file
├── .husky/               # Git hooks configuration
├── .prettierignore       # Prettier ignore file
├── .prettierrc           # Prettier configuration
├── .vscode/              # VS Code workspace settings
├── config/               # Project configuration files
├── force-app/main/default/  # Main source directory
├── jest.config.js        # Jest testing configuration
├── manifest/             # Package manifests
│   └── package.xml       # Deployment package manifest
├── package.json          # Node.js dependencies
├── scripts/              # Utility scripts
└── sfdx-project.json     # SFDX project configuration
```

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