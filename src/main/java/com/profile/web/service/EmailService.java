package com.profile.web.service;

/**
 * Service interface for handling contact email notifications.
 * Implementation and DTO integration will be added in the backend phase.
 */
public interface EmailService {

    /**
     * Sends an email notification to the profile owner.
     * 
     * @param senderEmail The visitor's email address
     * @param subject     The subject or reason
     * @param message     The body of the message
     * @return true if sent successfully, false otherwise
     */
    boolean sendContactEmail(String senderEmail, String subject, String message);
}

