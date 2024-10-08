package de.itdesign.incubating.rmg.model;

public class ChatMessage {

    private String senderName;
    private String receiverName;
    private String message;
    private String status; // For "JOIN", "MESSAGE", etc.

    // Constructors, getters, and setters

    public ChatMessage() {}

    public ChatMessage(String senderName, String receiverName, String message, String status) {
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.message = message;
        this.status = status;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
