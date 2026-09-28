package com.edutrack.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object representing the Global Top Header Navigation Bar.
 */
public class HeaderPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators
    private final By brandTitle = By.cssSelector(".gc-brand-title");
    private final By userPod = By.cssSelector(".gc-user-pod");
    private final By userName = By.cssSelector(".gc-user-name");
    private final By userRole = By.cssSelector(".gc-user-role");
    private final By userMenuDropdown = By.cssSelector(".gc-user-menu");
    private final By signOutMenuItem = By.cssSelector(".gc-user-menu-item.gc-menu-item-danger");
    private final By logoutHeaderAction = By.cssSelector(".gc-logout-action");
    private final By themeToggleAction = By.cssSelector(".gc-header-right button.gc-header-action:not(.gc-logout-action)");
    private final By hamburgerBtn = By.cssSelector(".gc-hamburger-btn");

    public HeaderPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isHeaderVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(brandTitle)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getUserFullName() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(userName)).getText().trim();
    }

    public String getUserRole() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(userRole)).getText().trim();
    }

    public void openUserMenu() {
        wait.until(ExpectedConditions.elementToBeClickable(userPod)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(userMenuDropdown));
    }

    public void logout() {
        try {
            // First try clicking the direct header logout action if visible
            WebElement directLogout = wait.until(ExpectedConditions.elementToBeClickable(logoutHeaderAction));
            directLogout.click();
        } catch (Exception e) {
            // Fallback to opening the dropdown and clicking sign out
            openUserMenu();
            wait.until(ExpectedConditions.elementToBeClickable(signOutMenuItem)).click();
        }
    }

    public void toggleTheme() {
        wait.until(ExpectedConditions.elementToBeClickable(themeToggleAction)).click();
    }

    public void toggleSidebar() {
        wait.until(ExpectedConditions.elementToBeClickable(hamburgerBtn)).click();
    }
}
