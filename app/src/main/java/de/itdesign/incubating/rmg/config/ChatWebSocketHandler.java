package de.itdesign.incubating.rmg.config;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.itdesign.incubating.rmg.model.ChatMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;


public class ChatWebSocketHandler extends TextWebSocketHandler {

    // Store active WebSocket sessions
    private final Set<WebSocketSession> activeSessions = Collections.synchronizedSet(new HashSet<>());

    // ObjectMapper for JSON serialization/deserialization
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Add the session to the list of active sessions
        activeSessions.add(session);
        System.out.println("New session connected: " + session.getId());

        // Notify others that a new player has joined
        broadcastStatusMessage(session, "JOIN");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Parse incoming message
        ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);

        // Broadcast the message to all connected clients
        broadcastMessage(chatMessage);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Remove the session from the active session list
        activeSessions.remove(session);
        System.out.println("Session disconnected: " + session.getId());

        // Notify others that a player has left
        broadcastStatusMessage(session, "LEAVE");
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // Handle any errors during WebSocket communication
        System.err.println("Error in session " + session.getId() + ": " + exception.getMessage());

        // Remove the session from the list and close it
        activeSessions.remove(session);
        session.close(CloseStatus.SERVER_ERROR);
    }

    // Broadcast a ChatMessage to all clients
    private void broadcastMessage(ChatMessage chatMessage) throws IOException {
        String messageText = objectMapper.writeValueAsString(chatMessage);
        for (WebSocketSession webSocketSession : activeSessions) {
            if (webSocketSession.isOpen()) {
                webSocketSession.sendMessage(new TextMessage(messageText));
            }
        }
    }

    // Broadcast JOIN or LEAVE status message
    private void broadcastStatusMessage(WebSocketSession session, String status) throws IOException {
        // Create a new ChatMessage for the status change
        ChatMessage statusMessage = new ChatMessage();
        statusMessage.setSenderName(session.getId()); // Using session ID as player identifier
        statusMessage.setMessage("Player " + session.getId() + " has " + (status.equals("JOIN") ? "joined" : "left") + " the chat.");
        statusMessage.setStatus(status);

        // Broadcast the status message to all other connected clients
        broadcastMessage(statusMessage);
    }


}