package com.edutrack.selenium.tests;

import com.edutrack.selenium.config.BaseSeleniumTest;
import com.edutrack.selenium.pages.AdminPanelPage;
import com.edutrack.selenium.pages.HeaderPage;
import com.edutrack.selenium.pages.LoginPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-End tests for Authentication, Demo Logins, Role Routing, Theme Toggling, and Logout.
 */
public class AuthenticationSeleniumTest extends BaseSeleniumTest {

    @Test
    @DisplayName("Student logs in successfully and sees student dashboard")
    public void testSuccessfulStudentLogin() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        loginPage.login("anurag@edutrack.edu", "student123");

        HeaderPage header = new HeaderPage(driver);
        assertTrue(header.isHeaderVisible(), "Header should be visible after login");
        assertEquals("STUDENT", header.getUserRole(), "User role should be STUDENT");
        assertTrue(header.getUserFullName().contains("Anurag"), "User name should contain Anurag");
    }

    @Test
    @DisplayName("Instructor logs in successfully and sees instructor dashboard")
    public void testSuccessfulInstructorLogin() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        loginPage.login("sharma@edutrack.edu", "prof123");

        HeaderPage header = new HeaderPage(driver);
        assertTrue(header.isHeaderVisible(), "Header should be visible after login");
        assertEquals("INSTRUCTOR", header.getUserRole(), "User role should be INSTRUCTOR");
        assertTrue(header.getUserFullName().contains("Sharma"), "User name should contain Sharma");
    }

    @Test
    @DisplayName("Admin logs in successfully and is redirected to the Admin Panel")
    public void testSuccessfulAdminLogin() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        loginPage.login("admin@edutrack.edu", "admin123");

        AdminPanelPage adminPanel = new AdminPanelPage(driver);
        assertTrue(adminPanel.isLoaded(), "Admin panel should load automatically for ADMIN role");

        HeaderPage header = new HeaderPage(driver);
        assertEquals("ADMIN", header.getUserRole(), "User role should be ADMIN");
    }

    @Test
    @DisplayName("Quick demo login card populates credentials and logs in")
    public void testQuickDemoLogin() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        loginPage.clickStudentDemo();
        loginPage.clickSignIn();

        HeaderPage header = new HeaderPage(driver);
        assertTrue(header.isHeaderVisible(), "Header should be visible after demo login");
        assertEquals("STUDENT", header.getUserRole());
    }

    @Test
    @DisplayName("Invalid credentials display an authentication error banner")
    public void testInvalidCredentialsShowError() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        loginPage.login("nonexistent@edutrack.edu", "wrongpassword123");

        assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed for invalid credentials");
        assertFalse(loginPage.getErrorMessage().isEmpty(), "Error message text should not be empty");
    }

    @Test
    @DisplayName("Theme toggle switches UI between Light and Dark mode")
    public void testThemeToggle() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isLoaded(), "Login page should be loaded");

        boolean initialDark = loginPage.isDarkMode();
        loginPage.toggleTheme();
        boolean toggledDark = loginPage.isDarkMode();

        assertNotEquals(initialDark, toggledDark, "Theme state should invert after clicking theme toggle");
    }

    @Test
    @DisplayName("Logout flow ends session and returns user to login screen")
    public void testLogoutFlow() {
        openRoot();
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("anurag@edutrack.edu", "student123");

        HeaderPage header = new HeaderPage(driver);
        assertTrue(header.isHeaderVisible(), "Header should be visible after login");

        header.logout();

        assertTrue(loginPage.isLoaded(), "User should be returned to login screen after logout");
    }
}
