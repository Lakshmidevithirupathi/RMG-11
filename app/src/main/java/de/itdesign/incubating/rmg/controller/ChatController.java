package de.itdesign.incubating.rmg.controller;



import de.itdesign.incubating.rmg.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private Map<String, String> users = new HashMap<>(); // Track active users

    public ChatController(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public ChatMessage sendPublicMessage(ChatMessage message) {
        // Handle user join
        if ("JOIN".equals(message.getStatus())) {
            users.put(message.getSenderName(), message.getSenderName());
            message.setMessage(message.getSenderName() + " has joined the chat!");
        }
        return message; // Return message to all subscribers of "/chatroom/public"
    }

    @MessageMapping("/private-message")
    public void sendPrivateMessage(ChatMessage message) {
        // Send to specific user
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
    }
}
