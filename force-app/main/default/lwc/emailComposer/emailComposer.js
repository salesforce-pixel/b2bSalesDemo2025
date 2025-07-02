import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EmailComposer extends LightningElement {
    @api showModal = false;
    @api to;
    @api subject;
    @api body;
    @api loading = false;

    renderedCallback() {
        const textarea = this.template.querySelector('.auto-expand textarea');
        if (textarea) {
            textarea.style.height = '300px';
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleEmailSend() {
        this.showToastMessage('Success', 'Email sent successfully', 'success');
        this.handleClose();
    }

    // Toast message utility
    showToastMessage(title, msg, variant) {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            message: msg,
        });
        this.dispatchEvent(event);
    }
}