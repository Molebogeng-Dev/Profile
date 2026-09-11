package com.profile.web.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Controller skeleton for profile contact communications.
 * Dedicated DTOs and EmailService implementations will be plugged in here later.
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    /**
     * Endpoint placeholder for email submission from profile visitors.
     * Future phase will bind this to a strongly typed DTO from com.profile.web.dto.
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> submitContactMessage(@RequestBody Map<String, String> payload) {
        // Placeholder response while DTOs and backend mail services are awaiting implementation
        String email = payload.getOrDefault("email", "");
        return ResponseEntity.ok(Map.of(
            "status", "received",
            "message", "Transmission signal received for: " + email + ". Backend mail dispatch will be wired in next phase."
        ));
    }
}

