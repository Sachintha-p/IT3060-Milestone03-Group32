package com.library.smart_campus_backend.feature2.service;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.feature2.model.AlertChannel;
import com.library.smart_campus_backend.feature2.model.Book;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationHelper {

    public void sendNotification(User user, Book book, List<AlertChannel> channels) {
        // Minimal simulated notification service
        String channelNames = channels.stream().map(Enum::name).reduce((a, b) -> a + ", " + b).orElse("NONE");
        System.out.println("[ALERT SENT via " + channelNames + "] to " + user.getEmail() + ": Good news! The book '" + book.getTitle() + "' is now available.");
    }
}
