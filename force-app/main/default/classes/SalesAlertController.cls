public without sharing class SalesAlertController {
    public class AlertWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String category;
        @AuraEnabled public String triggerReason;
        @AuraEnabled public String action1;
        @AuraEnabled public String action2;
        @AuraEnabled public String objectName;
        @AuraEnabled public String recordId;
        @AuraEnabled public String displayTitle; // "TechCorp ($120K)"
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, List<AlertWrapper>> getSalesAlertsByCategory() {
        List<Sales_Alerts__c> alerts = [
            SELECT Id, Category__c, Trigger_Reason__c, Record_Id__c, Object__c,
                   AI_Identified_Action_1__c, AI_Identified_Action_2__c
            FROM Sales_Alerts__c
            WHERE Category__c IN ('Deals Needing Attention', 'Follow Ups', 'Grow and Protect', 'Onboarding')
        ];

        // Collect all referenced Record Ids by object type
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>();
        Map<Id, Account> accMap = new Map<Id, Account>();
        Map<Id, Contact> conMap = new Map<Id, Contact>();
        Map<Id, Onboarding__c> onboardMap = new Map<Id, Onboarding__c>();

        for (Sales_Alerts__c alert : alerts) {
            if (alert.Object__c == 'Opportunity') {
                oppMap.put(alert.Record_Id__c, null);
            } else if (alert.Object__c == 'Account') {
                accMap.put(alert.Record_Id__c, null);
            } else if (alert.Object__c == 'Contact') {
                conMap.put(alert.Record_Id__c, null);
            } else if (alert.Object__c == 'Onboarding__c') {
                onboardMap.put(alert.Record_Id__c, null);
            }
        }

        if (!oppMap.isEmpty()) {
            oppMap.putAll([
                SELECT Id, Name, Amount FROM Opportunity WHERE Id IN :oppMap.keySet()
            ]);
        }
        if (!accMap.isEmpty()) {
            accMap.putAll([
                SELECT Id, Name FROM Account WHERE Id IN :accMap.keySet()
            ]);
        }
        if (!conMap.isEmpty()) {
            conMap.putAll([
                SELECT Id, Name FROM Contact WHERE Id IN :conMap.keySet()
            ]);
        }
        if (!onboardMap.isEmpty()) {
            onboardMap.putAll([
                SELECT Id, Name FROM Onboarding__c WHERE Id IN :onboardMap.keySet()
            ]);
        }

        Map<String, List<AlertWrapper>> result = new Map<String, List<AlertWrapper>>();

        for (Sales_Alerts__c alert : alerts) {
            AlertWrapper wrap = new AlertWrapper();
            wrap.id = alert.Id;
            wrap.category = alert.Category__c;
            wrap.triggerReason = alert.Trigger_Reason__c;
            wrap.action1 = alert.AI_Identified_Action_1__c;
            wrap.action2 = alert.AI_Identified_Action_2__c;
            wrap.objectName = alert.Object__c;
            wrap.recordId = alert.Record_Id__c;

            // Fixed null-safe handling for display titles
            if (alert.Object__c == 'Opportunity' && oppMap.containsKey(alert.Record_Id__c)) {
                Opportunity o = oppMap.get(alert.Record_Id__c);
                if (o != null) {
                    String amountStr = '';
                    if (o.Amount != null) {
                        amountStr = ' ($' + String.valueOf((Integer)o.Amount) + 'K)';
                    }
                    wrap.displayTitle = (o.Name != null ? o.Name : 'Opportunity') + amountStr;
                } else {
                    wrap.displayTitle = 'Opportunity';
                }
            } else if (alert.Object__c == 'Account' && accMap.containsKey(alert.Record_Id__c)) {
                Account acc = accMap.get(alert.Record_Id__c);
                wrap.displayTitle = (acc != null && acc.Name != null) ? acc.Name : 'Account';
            } else if (alert.Object__c == 'Contact' && conMap.containsKey(alert.Record_Id__c)) {
                Contact con = conMap.get(alert.Record_Id__c);
                wrap.displayTitle = (con != null && con.Name != null) ? con.Name : 'Contact';
            } else if (alert.Object__c == 'Onboarding__c' && onboardMap.containsKey(alert.Record_Id__c)) {
                Onboarding__c onboard = onboardMap.get(alert.Record_Id__c);
                wrap.displayTitle = (onboard != null && onboard.Name != null) ? onboard.Name : 'Onboarding';
            } else {
                wrap.displayTitle = 'Record';
            }

            if (!result.containsKey(wrap.category)) {
                result.put(wrap.category, new List<AlertWrapper>());
            }
            result.get(wrap.category).add(wrap);
        }

        return result;
    }
}