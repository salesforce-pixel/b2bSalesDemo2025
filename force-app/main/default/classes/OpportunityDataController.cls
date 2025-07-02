public with sharing class OpportunityDataController {
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getOpportunityDetails(Id opportunityId) {
        Map<String, String> result = new Map<String, String>();

        Opportunity opp = [
            SELECT StageName, CloseDate
            FROM Opportunity
            WHERE Id = :opportunityId
            LIMIT 1
        ];

        result.put('StageName', opp.StageName);
        result.put('CloseDate', String.valueOf(opp.CloseDate));

        return result;
    }
}