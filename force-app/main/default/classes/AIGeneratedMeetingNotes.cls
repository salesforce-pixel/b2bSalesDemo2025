public without sharing class AIGeneratedMeetingNotes {
    
    @AuraEnabled(cacheable=false)
    public static String extractInformation(String fileId, String buttonLabel) {
        try {
            // Prepare input for the Einstein Prompt Template
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            promptInput.isPreview = false;

            // Wrap sales alert input
            Map<String, String> cMap = new Map<String, String>();
            cMap.put('id', fileId);

            ConnectApi.WrappedValue cWrapped = new ConnectApi.WrappedValue();
            cWrapped.value = cMap;

            // Input values for the prompt
            Map<String, ConnectApi.WrappedValue> inputValues = new Map<String, ConnectApi.WrappedValue>();
            inputValues.put('Input:File', cWrapped);

            promptInput.inputParams = inputValues;

            // Set the application context
            promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

            // Call Einstein LLM with the prompt template
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result = 
                ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Sales_Rep_Meeting_Summary', promptInput);

            System.debug(result.generations[0].text);
            
            return result.generations[0].text;

        } catch (Exception e) {
            System.debug('Error calling Einstein: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}