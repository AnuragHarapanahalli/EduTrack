package com.edutrack.selenium.tests;

import com.edutrack.selenium.config.BaseSeleniumTest;
import com.edutrack.selenium.pages.AdminPanelPage;
import com.edutrack.selenium.pages.LoginPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-End tests for Admin Governance, Tab Navigation, and User Provisioning.
 */
public class AdminPanelSeleniumTest extends BaseSeleniumTest {

    private AdminPanelPage loginAsAdmin() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("admin@edutrack.edu", "admin123");
        AdminPanelPage adminPanel = new AdminPanelPage(driver);
        assertTrue(adminPanel.isLoaded(), "Admin panel should load upon login");
        return adminPanel;
    }

    @Test
    @DisplayName("Admin navigates across all administration tabs")
    public void testAdminNavigationAndTabs() {
        AdminPanelPage adminPanel = loginAsAdmin();

        adminPanel.selectClassesTab();
        adminPanel.selectLogsTab();
        adminPanel.selectStatsTab();
        adminPanel.selectUsersTab();

        assertTrue(adminPanel.isLoaded(), "Admin panel should remain responsive while switching tabs");
    }

    @Test
    @DisplayName("Admin creates a new student account with panel and batch assignments")
    public void testAdminCreatesNewStudent() {
        AdminPanelPage adminPanel = loginAsAdmin();

        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6);
        String studentName = "Test Student " + uniqueSuffix;
        String studentEmail = "student_" + uniqueSuffix + "@edutrack.edu";

        adminPanel.openCreateUserModal();
        adminPanel.fillUserForm(studentName, studentEmail, "student123", "STUDENT", "A", "A1");
        adminPanel.submitUserForm();

        // Search for newly created student and verify inclusion
        adminPanel.searchUser(studentEmail);
        assertTrue(adminPanel.isUserPresentInTable(studentEmail), "Newly created student should appear in user table");
    }

    @Test
    @DisplayName("Admin searches user directory by email")
    public void testAdminSearchUserFilter() {
        AdminPanelPage adminPanel = loginAsAdmin();

        adminPanel.searchUser("anurag@edutrack.edu");
        assertTrue(adminPanel.isUserPresentInTable("anurag@edutrack.edu"), "User table should show searched user");
    }
}
