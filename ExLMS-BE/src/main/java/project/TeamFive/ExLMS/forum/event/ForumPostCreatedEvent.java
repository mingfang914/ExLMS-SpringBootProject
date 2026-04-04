package project.TeamFive.ExLMS.forum.event;

import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.forum.entity.ForumPost;

public class ForumPostCreatedEvent extends ApplicationEvent {

    private final ForumPost post;

    public ForumPostCreatedEvent(Object source, ForumPost post) {
        super(source);
        this.post = post;
    }

    public ForumPost getPost() {
        return post;
    }
}
