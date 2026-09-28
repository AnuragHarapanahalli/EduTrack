package com.edutrack.selenium.tests;

import com.edutrack.selenium.config.BaseSeleniumTest;
import com.edutrack.selenium.pages.ClassDetailPage;
import com.edutrack.selenium.pages.ClassesHomePage;
import com.edutrack.selenium.pages.LoginPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-End tests for Faculty/Instructor workflows: Class creation, navigation, and classwork inspection.
 */
public class InstructorWorkflowSeleniumTest extends BaseSeleniumTest {

    private ClassesHomePage loginAsInstructor() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("sharma@edutrack.edu", "prof123");
        ClassesHomePage classesHome = new ClassesHomePage(driver);
        assertTrue(classesHome.isLoaded(), "Classes home dashboard should load for instructor");
        return classesHome;
    }

    @Test
    @DisplayName("Instructor creates a new course classroom and verifies it on the dashboard")
    public void testInstructorCreatesNewClass() {
        ClassesHomePage home = loginAsInstructor();

        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String className = "Automated Test Lab " + uniqueSuffix;
        String classCode = "TEST-" + uniqueSuffix;
        String description = "Automated testing lab environment";

        home.createClass(className, classCode, description, "A1");

        assertTrue(home.isClassPresent(classCode), "Newly created class card should appear on instructor dashboard");
    }

    @Test
    @DisplayName("Instructor enters a class and switches between detail tabs")
    public void testInstructorNavigatesClassTabs() {
        ClassesHomePage home = loginAsInstructor();

        // Select the pre-seeded PBL3 class
        home.selectClassByCode("CSE20140-PBL3");

        ClassDetailPage classDetail = new ClassDetailPage(driver);
        assertTrue(classDetail.isLoaded(), "Class detail view should load");

        classDetail.clickClassworkTab();
        classDetail.clickPeopleTab();
        classDetail.clickLeaderboardTab();
        assertTrue(classDetail.isLeaderboardVisible(), "Leaderboard should display rankings");

        classDetail.clickStreamTab();
    }
}
