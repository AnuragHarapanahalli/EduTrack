package com.edutrack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:validation.properties")
public class ValidationConfig {

    // Subject
    @Value("${subject.name.min:3}")
    private int subjectNameMin;

    @Value("${subject.name.max:100}")
    private int subjectNameMax;

    @Value("${subject.code.min:3}")
    private int subjectCodeMin;

    @Value("${subject.code.max:20}")
    private int subjectCodeMax;

    @Value("${subject.description.max:500}")
    private int subjectDescriptionMax;

    // Milestone
    @Value("${milestone.title.min:3}")
    private int milestoneTitleMin;

    @Value("${milestone.title.max:150}")
    private int milestoneTitleMax;

    @Value("${milestone.description.min:5}")
    private int milestoneDescriptionMin;

    @Value("${milestone.description.max:1000}")
    private int milestoneDescriptionMax;

    @Value("${milestone.points.min:10}")
    private int milestonePointsMin;

    @Value("${milestone.points.max:1000}")
    private int milestonePointsMax;

    // User / Registration
    @Value("${user.fullname.min:2}")
    private int userFullnameMin;

    @Value("${user.fullname.max:100}")
    private int userFullnameMax;

    @Value("${user.email.max:100}")
    private int userEmailMax;

    @Value("${user.password.min:6}")
    private int userPasswordMin;

    @Value("${user.password.max:30}")
    private int userPasswordMax;

    // Submission
    @Value("${submission.comments.max:500}")
    private int submissionCommentsMax;

    @Value("${submission.link.max:255}")
    private int submissionLinkMax;

    // Getters
    public int getSubjectNameMin() { return subjectNameMin; }
    public int getSubjectNameMax() { return subjectNameMax; }
    public int getSubjectCodeMin() { return subjectCodeMin; }
    public int getSubjectCodeMax() { return subjectCodeMax; }
    public int getSubjectDescriptionMax() { return subjectDescriptionMax; }

    public int getMilestoneTitleMin() { return milestoneTitleMin; }
    public int getMilestoneTitleMax() { return milestoneTitleMax; }
    public int getMilestoneDescriptionMin() { return milestoneDescriptionMin; }
    public int getMilestoneDescriptionMax() { return milestoneDescriptionMax; }
    public int getMilestonePointsMin() { return milestonePointsMin; }
    public int getMilestonePointsMax() { return milestonePointsMax; }

    public int getUserFullnameMin() { return userFullnameMin; }
    public int getUserFullnameMax() { return userFullnameMax; }
    public int getUserEmailMax() { return userEmailMax; }
    public int getUserPasswordMin() { return userPasswordMin; }
    public int getUserPasswordMax() { return userPasswordMax; }

    public int getSubmissionCommentsMax() { return submissionCommentsMax; }
    public int getSubmissionLinkMax() { return submissionLinkMax; }
}
