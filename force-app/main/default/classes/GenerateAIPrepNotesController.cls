public without sharing class GenerateAIPrepNotesController {
    
    @AuraEnabled(cacheable=false)
    public static String generatePrepNotes(String accountId, String buttonLabel) {
        try {
            // Prepare input for the Einstein Prompt Template
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            promptInput.isPreview = false;

            // Wrap sales alert input
            Map<String, String> accountMap = new Map<String, String>();
            accountMap.put('id', accountId);

            ConnectApi.WrappedValue accountWrapped = new ConnectApi.WrappedValue();
            accountWrapped.value = accountMap;

            // Input values for the prompt
            Map<String, ConnectApi.WrappedValue> inputValues = new Map<String, ConnectApi.WrappedValue>();
            inputValues.put('Input:Account', accountWrapped);

            promptInput.inputParams = inputValues;

            // Set the application context
            promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

            // Call Einstein LLM with the prompt template
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result = 
                ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('PA_AI_Generated_Prep_Notes', promptInput);

            System.debug(result.generations[0].text);
            
            return result.generations[0].text;

        } catch (Exception e) {
            System.debug('Error calling Einstein: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}