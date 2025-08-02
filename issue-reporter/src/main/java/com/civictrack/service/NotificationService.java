package com.civictrack.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void notifyUser(Long userId, String message) {
        // For demo, print to console. Integrate email/push in real app.
        System.out.println("Notification to User #" + userId + ": " + message);
    }
}
