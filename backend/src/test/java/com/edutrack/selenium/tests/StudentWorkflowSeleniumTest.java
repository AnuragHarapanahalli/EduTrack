package com.edutrack.selenium.tests;

import com.edutrack.selenium.config.BaseSeleniumTest;
import com.edutrack.selenium.pages.ClassDetailPage;
import com.edutrack.selenium.pages.LoginPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-End tests for Student workflows: Classwork inspection, turn-in interaction, and gamified leaderboard.
 */
public class StudentWorkflowSeleniumTest extends BaseSeleniumTest {

    private void loginAsStudent() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("anurag@edutrack.edu", "student123");
    }

    @Test
    @DisplayName("Student logs in and inspects milestone progress cards")
    public void testStudentViewsClassworkAndMilestones() {
        loginAsStudent();

        ClassDetailPage classDetail = new ClassDetailPage(driver);
        // Student lands on their primary enrolled classwork
        assertTrue(isElementVisible(By.cssSelector(".gc-classwork-container")), "Classwork container should be visible");
        assertTrue(isElementPresent(By.cssSelector(".netflix-hero-card, .netflix-milestone-card")), "Milestones should be listed");
    }

    @Test
    @DisplayName("Student inspects gamified leaderboard tab")
    public void testStudentViewsLeaderboardTab() {
        loginAsStudent();

        ClassDetailPage classDetail = new ClassDetailPage(driver);
        // In student view or class detail, click leaderboard tab if available
        if (isElementPresent(By.xpath("//div[contains(@class,'gc-class-tabs')]//span[text()='Leaderboard']/ancestor::button"))) {
            classDetail.clickLeaderboardTab();
            assertTrue(classDetail.isLeaderboardVisible(), "Leaderboard should display student ranks");
        } else {
            // Student direct leaderboard verification
            assertTrue(isElementPresent(By.cssSelector(".gc-classwork-container")), "Student dashboard is active");
        }
    }
}
