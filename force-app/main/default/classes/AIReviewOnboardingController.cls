public without sharing class AIReviewOnboardingController {
    
    @AuraEnabled(cacheable=false)
    public static String generateReview(String onboardingId, String buttonLabel) {
        try {
            // Prepare input for the Einstein Prompt Template
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            promptInput.isPreview = false;

            // Wrap sales alert input
            Map<String, String> onbMap = new Map<String, String>();
            onbMap.put('id', onboardingId);

            ConnectApi.WrappedValue onbWrapped = new ConnectApi.WrappedValue();
            onbWrapped.value = onbMap;

            // Input values for the prompt
            Map<String, ConnectApi.WrappedValue> inputValues = new Map<String, ConnectApi.WrappedValue>();
            inputValues.put('Input:Onboarding', onbWrapped);

            promptInput.inputParams = inputValues;

            // Set the application context
            promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

            // Call Einstein LLM with the prompt template
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result = 
                ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('PA_Review_Onboarding_Status', promptInput);

            System.debug(result.generations[0].text);
            
            return result.generations[0].text;

        } catch (Exception e) {
            System.debug('Error calling Einstein: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}