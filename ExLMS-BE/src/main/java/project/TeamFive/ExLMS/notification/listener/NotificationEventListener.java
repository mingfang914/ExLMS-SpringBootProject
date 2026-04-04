package project.TeamFive.ExLMS.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.event.AssignmentCreatedEvent;
import project.TeamFive.ExLMS.course.event.CourseCreatedEvent;
import project.TeamFive.ExLMS.forum.event.ForumPostCreatedEvent;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.notification.entity.Notification;
import project.TeamFive.ExLMS.notification.service.NotificationService;
import project.TeamFive.ExLMS.quiz.event.QuizCreatedEvent;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @EventListener
    @Transactional
    public void onCourseCreated(CourseCreatedEvent event) {
        System.out.println("DEBUG: NotificationEventListener received CourseCreatedEvent for group course: " + event.getGroupCourse().getId());
        
        List<GroupMember> members = groupMemberRepository.findByGroup_Id(event.getGroupCourse().getGroup().getId());
        System.out.println("DEBUG: Found " + members.size() + " members for group: " + event.getGroupCourse().getGroup().getName());
        
        User creator = event.getGroupCourse().getCourse().getCreatedBy();
        System.out.println("DEBUG: Course creator: " + creator.getEmail());
        
        for (GroupMember member : members) {
            System.out.println("DEBUG: Checking member: " + member.getUser().getEmail());
            if (member.getUser().getId().equals(creator.getId())) {
                System.out.println("DEBUG: Skipping creator notification.");
                continue;
            }
            
            System.out.println("DEBUG: Calling createNotification for Course: " + member.getUser().getEmail());
            notificationService.createNotification(
                    member.getUser(),
                    "Khóa học mới: " + event.getGroupCourse().getCourse().getTitle(),
                    "Giảng viên vừa thêm một khóa học mới vào nhóm " + event.getGroupCourse().getGroup().getName(),
                    Notification.NotificationType.NEW_COURSE,
                    "/group/" + event.getGroupCourse().getGroup().getId() + "/courses/" + event.getGroupCourse().getId(),
                    event.getGroupCourse().getId(),
                    "GROUP_COURSE"
            );
        }
    }

    @EventListener
    @Transactional
    public void onAssignmentCreated(AssignmentCreatedEvent event) {
        System.out.println("DEBUG: NotificationEventListener received AssignmentCreatedEvent for deployment: " + event.getDeployment().getId());
        
        List<GroupMember> members = groupMemberRepository.findByGroup_Id(event.getDeployment().getGroup().getId());
        System.out.println("DEBUG: Found " + members.size() + " members for group: " + event.getDeployment().getGroup().getName());
        
        User creator = event.getDeployment().getAssignment().getCreatedBy();
        System.out.println("DEBUG: Assignment creator: " + creator.getEmail());
        
        for (GroupMember member : members) {
            System.out.println("DEBUG: Checking member: " + member.getUser().getEmail());
            if (member.getUser().getId().equals(creator.getId())) {
                System.out.println("DEBUG: Skipping creator notification.");
                continue;
            }
            
            System.out.println("DEBUG: Calling createNotification for Assignment: " + member.getUser().getEmail());
            notificationService.createNotification(
                    member.getUser(),
                    "Bài tập mới: " + event.getDeployment().getAssignment().getTitle(),
                    "Bạn có bài tập mới cần hoàn thành trong nhóm " + event.getDeployment().getGroup().getName(),
                    Notification.NotificationType.NEW_ASSIGNMENT,
                    "/group/" + event.getDeployment().getGroup().getId() + "/assignments/" + event.getDeployment().getId(),
                    event.getDeployment().getId(),
                    "GROUP_ASSIGNMENT"
            );
        }
    }

    @EventListener
    @Transactional
    public void onForumPostCreated(ForumPostCreatedEvent event) {
        System.out.println("DEBUG: NotificationEventListener received ForumPostCreatedEvent: " + event.getPost().getId());
        
        List<User> users = userRepository.findAll();
        System.out.println("DEBUG: Sending forum notification to " + users.size() + " users.");
        
        User author = event.getPost().getAuthor();
        System.out.println("DEBUG: Post author: " + author.getEmail());
        
        for (User user : users) {
             System.out.println("DEBUG: Checking user: " + user.getEmail());
             if (user.getId().equals(author.getId())) {
                 System.out.println("DEBUG: Skipping author notification.");
                 continue;
             }
             
             System.out.println("DEBUG: Calling createNotification for Forum Post: " + user.getEmail());
             notificationService.createNotification(
                    user,
                    "Bài đăng diễn đàn mới",
                    author.getFullName() + " vừa đăng bài viết mới: " + event.getPost().getTitle(),
                    Notification.NotificationType.SYSTEM,
                    "/forum/post/" + event.getPost().getId(),
                    event.getPost().getId(),
                    "FORUM_POST"
            );
        }
    }

    @EventListener
    @Transactional
    public void onQuizCreated(QuizCreatedEvent event) {
        System.out.println("DEBUG: NotificationEventListener received QuizCreatedEvent for deployment: " + event.getDeployment().getId());
        
        List<GroupMember> members = groupMemberRepository.findByGroup_Id(event.getDeployment().getGroup().getId());
        System.out.println("DEBUG: Found " + members.size() + " members for group: " + event.getDeployment().getGroup().getName());
        
        User creator = event.getDeployment().getQuiz().getCreatedBy();
        System.out.println("DEBUG: Quiz creator: " + creator.getEmail());
        
        for (GroupMember member : members) {
            System.out.println("DEBUG: Checking member: " + member.getUser().getEmail());
            if (member.getUser().getId().equals(creator.getId())) {
                System.out.println("DEBUG: Skipping creator notification.");
                continue;
            }
            
            System.out.println("DEBUG: Calling createNotification for Quiz: " + member.getUser().getEmail());
            notificationService.createNotification(
                    member.getUser(),
                    "Đợt kiểm tra mới: " + event.getDeployment().getQuiz().getTitle(),
                    "Bạn có đợt kiểm tra mới cần thực hiện trong nhóm " + event.getDeployment().getGroup().getName(),
                    Notification.NotificationType.NEW_QUIZ,
                    "/group/" + event.getDeployment().getGroup().getId() + "/quizzes/" + event.getDeployment().getId(),
                    event.getDeployment().getId(),
                    "GROUP_QUIZ"
            );
        }
    }
}
