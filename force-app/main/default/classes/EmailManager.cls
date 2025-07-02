public with sharing class EmailManager {
    public Boolean sendMail(String email, String subject, String htmlBody) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { email });
        mail.setSubject(subject);
        mail.setHtmlBody(htmlBody);

        Messaging.SendEmailResult[] results = Messaging.sendEmail(
            new Messaging.SingleEmailMessage[] { mail });

        // Return true if the first (and only) result indicates success
        if (results != null && results.size() > 0 && results[0].isSuccess()) {
            System.debug('Email sent successfully');
            return true;
        } else {
            if (results != null && results.size() > 0) {
                System.debug('Email failed to send: ' + results[0].getErrors()[0].getMessage());
            } else {
                System.debug('Email sending failed for unknown reasons.');
            }
            return false;
        }
    }
}