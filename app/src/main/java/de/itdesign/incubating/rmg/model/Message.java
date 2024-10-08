package de.itdesign.incubating.rmg.model;

///@NoArgsConstructor
////@AllArgsConstructor
////@Getter
////@Setter
////@ToString
public class Message {
    private String senderName;
    private String receiverName;
    private String message;
    private String date;
    private Status status;

    public String getSenderName(){
        return  senderName;
    }

    public  void setSenderName(String senderName){
        this.senderName=senderName;
    }

    public String getReceiverName(){
        return  receiverName;
    }

    public  void setReceiverName(String receiverName){
        this.receiverName=receiverName;
    }
}

