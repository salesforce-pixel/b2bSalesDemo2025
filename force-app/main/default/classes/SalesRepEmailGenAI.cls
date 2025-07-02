public without sharing class SalesRepEmailGenAI {
    
    @AuraEnabled(cacheable=false)
    public static String generateEmail(String salesAlertId, String buttonLabel) {
        try {
            // Prepare input for the Einstein Prompt Template
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            promptInput.isPreview = false;

            // Wrap sales alert input
            Map<String, String> salesAlertMap = new Map<String, String>();
            salesAlertMap.put('id', salesAlertId);

            ConnectApi.WrappedValue salesAlertWrapped = new ConnectApi.WrappedValue();
            salesAlertWrapped.value = salesAlertMap;

            // Wrap button label input
            ConnectApi.WrappedValue buttonLabelWrapped = new ConnectApi.WrappedValue();
            buttonLabelWrapped.value = buttonLabel;

            // Input values for the prompt
            Map<String, ConnectApi.WrappedValue> inputValues = new Map<String, ConnectApi.WrappedValue>();
            inputValues.put('Input:Sales_Alerts', salesAlertWrapped);
            inputValues.put('Input:ActionClicked', buttonLabelWrapped);

            promptInput.inputParams = inputValues;

            // Set the application context
            promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

            // Call Einstein LLM with the prompt template
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result = 
                ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('PA_AI_Generated_Communication', promptInput);

            System.debug(result.generations[0].text);
            
            return result.generations[0].text;

        } catch (Exception e) {
            System.debug('Error calling Einstein: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}