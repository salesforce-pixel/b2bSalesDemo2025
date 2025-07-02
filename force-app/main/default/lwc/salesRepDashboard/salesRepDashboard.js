import {
    LightningElement,
    wire,
    track
} from 'lwc';
import getSalesAlertsByCategory from '@salesforce/apex/SalesAlertController.getSalesAlertsByCategory';
import generateEmail from '@salesforce/apex/SalesRepEmailGenAI.generateEmail';
import generatePrepNotes from '@salesforce/apex/GenerateAIPrepNotesController.generatePrepNotes';
import generateReview from '@salesforce/apex/AIReviewOnboardingController.generateReview';
import doResearch from '@salesforce/apex/AIResearchContactController.doResearch';
import extractInformationFromMeetingNotes from '@salesforce/apex/AIGeneratedMeetingNotes.extractInformation';
import draftAIProposal from '@salesforce/apex/AIGeneratedDraftProposal.draftProposal';
import queryOppData from '@salesforce/apex/OpportunityDataController.getOpportunityDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SalesRepDashboard extends LightningElement {
    columns = [];

    // Modal visibility flags
    showEmailModal = false;
    showCallNotesModal = false;
    showPrepNotesModal = false;
    showReviewStatusModal = false;
    showContactResearchModal = false;
    showOpportunityModal = false;

    // Voice CRM related properties
    showVoiceFlow = false;
    voiceFlowInputVariables = [];

    // Email related properties
    emailTo = '';
    emailSubject = '';
    emailBody = '';
    isLoading = false;

    // Prep notes related properties
    prepNotes = '';
    prepLoading = false;

    // Review related properties
    reviewNotes = '';
    reviewLoading = false;

    // Contact research related properties
    contactResearch = '';
    contactLoading = false;

    // Call notes upload related properties
    uploadRecordId = '';
    uploadedDocumentId = '';
    uploadedFileName = '';
    disableAnalyzeButton = true;
    analyzingNotes = false;
    callNoteAnalysisResult = '';
    callNoteAnalysisResultReady = false;

    // Opportunity related properties
    opptyRecordId = '';
    opptyCloseDate = '';
    opptyStage = '';
    opptyProposal = '';
    aiGeneratedProposalLoading = false;
    oppStageName;
    oppCloseDate;
    stageOptions = [
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Discovery', value: 'Discovery' },
        { label: 'Proposal/Quote', value: 'Proposal/Quote' },
        { label: 'Negotiation', value: 'Negotiation' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    isVoiceMode = false;

    @wire(getSalesAlertsByCategory)
    wiredAlerts({ error, data }) {
        if (data) {
            const processed = {};

            Object.keys(data).forEach(category => {
                processed[category] = data[category].map(record => ({
                    ...record,
                    recordUrl: `/lightning/r/${record.recordId}/view`
                }));
            });

            this.columns = [
                {
                    label: 'Deals needing attention',
                    cssClass: 'column deals',
                    isDeals: true,
                    records: processed['Deals Needing Attention'] || [],
                    isEmpty: !processed['Deals Needing Attention'] || processed['Deals Needing Attention'].length === 0
                },
                {
                    label: 'Follow Ups',
                    cssClass: 'column followups',
                    isFollowups: true,
                    records: processed['Follow Ups'] || [],
                    isEmpty: !processed['Follow Ups'] || processed['Follow Ups'].length === 0
                },
                {
                    label: 'Grow and Protect',
                    cssClass: 'column grow',
                    isGrow: true,
                    records: processed['Grow and Protect'] || [],
                    isEmpty: !processed['Grow and Protect'] || processed['Grow and Protect'].length === 0
                },
                {
                    label: 'Onboarding',
                    cssClass: 'column onboarding',
                    isOnboarding: true,
                    records: processed['Onboarding'] || [],
                    isEmpty: !processed['Onboarding'] || processed['Onboarding'].length === 0
                }
            ];
        } else if (error) {
            console.error('Error loading sales alerts:', error);
            this.showToastMessage('Error', 'Failed to load dashboard data', 'error');
        }
    }

    handleButtonClick(event) {
        const label = event.target.label;
        const alertId = event.target.dataset.id;
        const recordId = event.target.dataset.recordid;
        console.log('Button label: ' + label);
        console.log('Sales alertId: ' + alertId);

        switch (label) {
            case 'Send Email':
            case 'Schedule Check-In':
            case 'Schedule Meeting':
                this.handleEmailGeneration(alertId, label);
                break;
            case 'Update Call Notes':
                this.showCallNotesModal = true;
                this.uploadRecordId = recordId;
                this.resetCallNotesState();
                break;
            case 'Review Prep Notes':
                this.handlePrepNotesGeneration(recordId, label);
                break;
            case 'Initiate Kick Off':
            case 'Initiate Nurture Process':
                this.showToastMessage(label, 'The process has been initiated successfully', 'success');
                break;
            case 'Review Status':
                this.handleReviewStatusGeneration(recordId, label);
                break;
            case 'Research Contact':
                this.handleContactResearch(recordId, label);
                break;
            case 'Update Opportunity':
                this.openUpdateOpportunityModal(event);
                break;
            default:
                console.log('Unhandled button label:', label);
        }
    }

    // Voice CRM handling
    handleVoiceRecord() {
        console.log('Record id in handleVoiceRecord: ' + this.uploadRecordId);
        this.showVoiceFlow = true;
        this.voiceFlowInputVariables = [
            {
                name: 'recordId',
                type: 'String',
                value: this.uploadRecordId
            }
        ];
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.showToastMessage('Success', 'Voice note recorded successfully', 'success');
        } else if (event.detail.status === 'ERROR') {
            this.showToastMessage('Error', 'An error occurred while recording voice note', 'error');
        }
    }

    // Email handling
    handleEmailGeneration(alertId, label) {
        this.isLoading = true;
        this.showEmailModal = true;
        this.emailTo = '';
        this.emailSubject = '';
        this.emailBody = '';

        generateEmail({
            salesAlertId: alertId,
            buttonLabel: label
        })
        .then(result => {
            console.log('result email: ' + result);
            const parsed = JSON.parse(result);
            this.emailTo = parsed.contact_email && parsed.contact_email.includes('@') 
                ? parsed.contact_email 
                : '[Email missing]';
            this.emailSubject = parsed.subject || '[No subject]';
            this.emailBody = parsed.email_content && parsed.email_content.length > 10
                ? parsed.email_content
                : '[Email content not available]';
        })
        .catch(error => {
            console.error('Error generating email:', error);
            this.showToastMessage('Error', 'Failed to generate email content', 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    // Prep notes handling
    handlePrepNotesGeneration(recordId, label) {
        this.showPrepNotesModal = true;
        this.prepLoading = true;
        this.prepNotes = '';

        generatePrepNotes({
            accountId: recordId,
            buttonLabel: label
        })
        .then(result => {
            this.prepNotes = result;
        })
        .catch(error => {
            console.error('Error generating prep notes:', error);
            this.prepNotes = '<div class="slds-text-color_error">Failed to generate notes. Please try again later.</div>';
            this.showToastMessage('Error', 'Failed to generate prep notes', 'error');
        })
        .finally(() => {
            this.prepLoading = false;
        });
    }

    // Review status handling
    handleReviewStatusGeneration(recordId, label) {
        this.showReviewStatusModal = true;
        this.reviewLoading = true;
        this.reviewNotes = '';

        generateReview({
            onboardingId: recordId,
            buttonLabel: label
        })
        .then(result => {
            this.reviewNotes = result;
        })
        .catch(error => {
            console.error('Error generating review status:', error);
            this.reviewNotes = '<div class="slds-text-color_error">Failed to generate status. Please try again later.</div>';
            this.showToastMessage('Error', 'Failed to generate status review', 'error');
        })
        .finally(() => {
            this.reviewLoading = false;
        });
    }

    // Contact research handling
    handleContactResearch(recordId, label) {
        this.showContactResearchModal = true;
        this.contactLoading = true;
        this.contactResearch = '';

        doResearch({
            contactId: recordId,
            buttonLabel: label
        })
        .then(result => {
            this.contactResearch = result;
        })
        .catch(error => {
            console.error('Error generating contact research:', error);
            this.contactResearch = '<div class="slds-text-color_error">Failed to research contact. Please try again later.</div>';
            this.showToastMessage('Error', 'Failed to generate contact research', 'error');
        })
        .finally(() => {
            this.contactLoading = false;
        });
    }

    // Call notes state management
    resetCallNotesState() {
        this.uploadedFileName = '';
        this.uploadedDocumentId = '';
        this.disableAnalyzeButton = true;
        this.callNoteAnalysisResultReady = false;
        this.callNoteAnalysisResult = '';
        this.analyzingNotes = false;
        // Reset voice CRM state as well
        this.showVoiceFlow = false;
    }

    // Modal handling methods
    handleCloseReviewStatusModal() {
        this.showReviewStatusModal = false;
    }

    handleCloseContactResearchModal() {
        this.showContactResearchModal = false;
    }

    handleEmailCloseModal() {
        this.showEmailModal = false;
    }

    handleCloseCallNotesModal() {
        this.showCallNotesModal = false;
        this.showVoiceFlow = false; // Ensure voice flow is hidden when modal closes
    }

    handleClosePrepNotesModal() {
        this.showPrepNotesModal = false;
    }

    handleCloseOpportunityModal() {
        this.showOpportunityModal = false;
    }

    // Toast message utility
    showToastMessage(title, msg, variant = 'success') {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            message: msg,
        });
        this.dispatchEvent(event);
    }

    // Call notes upload handling
    callNotesUploadHandler(event) {
        const uploadedFiles = event.detail.files;
        if (uploadedFiles && uploadedFiles.length > 0) {
            this.uploadedDocumentId = uploadedFiles[0].documentId;
            this.uploadedFileName = uploadedFiles[0].name;
            this.disableAnalyzeButton = false;
            this.showToastMessage('File Uploaded', `${this.uploadedFileName} has been uploaded successfully`);
        }
    }

    // Call notes analysis
    handleAnalyzeCallNotes() {
        if (!this.uploadedDocumentId) {
            this.showToastMessage('Missing File', 'Please upload a document before analyzing.', 'warning');
            return;
        }

        this.analyzingNotes = true;
        this.callNoteAnalysisResult = {}; // clear previous result
        this.callNoteAnalysisResultReady = false;

        extractInformationFromMeetingNotes({
            fileId: this.uploadedDocumentId,
            buttonLabel: 'Update Call Notes'
        })
        .then(response => {
            try {
                const parsed = typeof response === 'string' ? JSON.parse(response) : response;

                this.callNoteAnalysisResult = {
                    summary: parsed.summary || '',
                    key_insights: Array.isArray(parsed.key_insights) ? parsed.key_insights : [],
                    customer_pain_points: Array.isArray(parsed.customer_pain_points) ? parsed.customer_pain_points : [],
                    follow_up_actions: Array.isArray(parsed.follow_up_actions) ? parsed.follow_up_actions : [],
                    decision_makers: Array.isArray(parsed.decision_makers) ? parsed.decision_makers : [],
                    timeline_references: Array.isArray(parsed.timeline_references) ? parsed.timeline_references : []
                };

                this.callNoteAnalysisResultReady = true;
                this.showToastMessage('Analysis Complete', 'Your call notes have been analyzed successfully');
            } catch (e) {
                console.error('Error parsing response JSON:', e);
                this.callNoteAnalysisResult = {
                    summary: '<div class="slds-text-color_error">Unable to parse AI response. Please try again later.</div>'
                };
                this.callNoteAnalysisResultReady = true;
                this.showToastMessage('Error', 'Failed to parse analysis results', 'error');
            }
        })
        .catch(error => {
            console.error('Error analyzing notes:', error);
            this.callNoteAnalysisResult = {
                summary: '<div class="slds-text-color_error">Failed to generate insights. Please try again later.</div>'
            };
            this.callNoteAnalysisResultReady = true;
            this.showToastMessage('Error', 'Failed to analyze notes', 'error');
        })
        .finally(() => {
            this.analyzingNotes = false;
        });
    }

    // Opportunity handling
    openUpdateOpportunityModal(event) {
        this.opptyRecordId = event.target.dataset.recordid;
        this.showOpportunityModal = true;
        queryOppData({ opportunityId: this.opptyRecordId })
        .then(result => {
            this.oppStageName = result.StageName;
            this.oppCloseDate = result.CloseDate;
        })
        .catch(error => {
            console.error('Error retrieving opportunity:', error);
        });
    }

    handleOpptyCloseDateChange(event) {
        this.opptyCloseDate = event.target.value;
    }

    handleOpptyStageChange(event) {
        this.opptyStage = event.detail.value;
    }

    handleOpptyProposalChange(event) {
        this.opptyProposal = event.target.value;
    }

    generateProposalAI() {
        this.aiGeneratedProposalLoading = true;
        
        // Fixed bug: Added missing recordId and label variables
        const recordId = this.opptyRecordId;
        const label = 'Update Opportunity';
        
        draftAIProposal({
            oppId: recordId,
            buttonLabel: label
        })
        .then(result => {
            this.opptyProposal = result;
        })
        .catch(error => {
            console.error('Error generating proposal:', error);
            this.opptyProposal = '<div class="slds-text-color_error">Failed to generate proposal. Please try again later.</div>';
            this.showToastMessage('Error', 'Failed to generate proposal', 'error');
        })
        .finally(() => {
            this.aiGeneratedProposalLoading = false;
        });
    }

    saveOpportunityUpdates() {
        // Placeholder for save logic
        console.log('Saving:', this.opptyCloseDate, this.opptyStage, this.opptyProposal);

        this.showToastMessage('Opportunity Updated', 'Changes saved successfully.');
        this.showOpportunityModal = false;
    }

    // Progress indicator getters
    get stepOneClass() {
        return this.callNoteAnalysisResultReady ?
            'slds-progress__item slds-is-completed' :
            'slds-progress__item slds-is-active';
    }

    get stepTwoClass() {
        return this.callNoteAnalysisResultReady ?
            'slds-progress__item slds-is-active' :
            'slds-progress__item';
    }

    resetCallNotesState() {
        this.uploadedFileName = '';
        this.uploadedDocumentId = '';
        this.disableAnalyzeButton = true;
        this.callNoteAnalysisResultReady = false;
        this.callNoteAnalysisResult = '';
        this.analyzingNotes = false;
        this.showVoiceFlow = false;
        this.isVoiceMode = false; // Reset toggle to default (Upload mode)
    }

    handleToggleChange(event) {
        this.isVoiceMode = event.target.checked;
    }

    addToMeetingNotes() {
        this.showToastMessage('Success', 'Prep Notes have been added to the related account', 'success');
        this.handleClosePrepNotesModal();
    }

    addToContactNotes() {
        this.showToastMessage('Success', 'Contact research has been added to the Notes', 'success');
        this.handleCloseContactResearchModal();
    }

    shareWithTeam() {
        this.showToastMessage('Success', 'Status has been shared with the account team', 'success');
        this.handleCloseReviewStatusModal();
    }

    saveToRecordHandler() {
        this.showToastMessage('Success', 'The updates have been saved', 'success');
        this.handleCloseCallNotesModal();
    }


}