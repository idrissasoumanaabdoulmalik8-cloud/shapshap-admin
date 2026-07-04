package shashap_backand.demo.dto;

public class StoryUpdateMessage {

    private String action;   // "SYNC" = les stories ont changé
    private int storyCount;  // Nombre de stories
    private long timestamp;  // Quand ça a été fait

    public StoryUpdateMessage() {
    }

    public StoryUpdateMessage(String action, int storyCount) {
        this.action = action;
        this.storyCount = storyCount;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters & Setters
    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public int getStoryCount() {
        return storyCount;
    }

    public void setStoryCount(int storyCount) {
        this.storyCount = storyCount;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}