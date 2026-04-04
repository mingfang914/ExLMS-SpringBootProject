package project.TeamFive.ExLMS.quiz.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;

@Getter
public class QuizCreatedEvent extends ApplicationEvent {
    private final GroupQuiz deployment;

    public QuizCreatedEvent(Object source, GroupQuiz deployment) {
        super(source);
        this.deployment = deployment;
    }
}
