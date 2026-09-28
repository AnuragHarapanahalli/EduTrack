package com.edutrack.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object representing the Navigation Sidebar.
 */
public class SidebarPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators
    private final By dashboardLink = By.xpath("//aside[contains(@class,'gc-sidebar')]//span[text()='Dashboard']/ancestor::a");
    private final By adminUsersLink = By.xpath("//aside[contains(@class,'gc-sidebar')]//span[text()='User Accounts']/ancestor::a");
    private final By adminClassesLink = By.xpath("//aside[contains(@class,'gc-sidebar')]//span[text()='Lab Classes']/ancestor::a");
    private final By adminLogsLink = By.xpath("//aside[contains(@class,'gc-sidebar')]//span[text()='Audit Logs']/ancestor::a");
    private final By adminStatsLink = By.xpath("//aside[contains(@class,'gc-sidebar')]//span[text()='System Reports']/ancestor::a");

    public SidebarPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void clickDashboard() {
        wait.until(ExpectedConditions.elementToBeClickable(dashboardLink)).click();
    }

    public void clickAdminUsers() {
        wait.until(ExpectedConditions.elementToBeClickable(adminUsersLink)).click();
    }

    public void clickAdminClasses() {
        wait.until(ExpectedConditions.elementToBeClickable(adminClassesLink)).click();
    }

    public void clickAdminLogs() {
        wait.until(ExpectedConditions.elementToBeClickable(adminLogsLink)).click();
    }

    public void clickAdminStats() {
        wait.until(ExpectedConditions.elementToBeClickable(adminStatsLink)).click();
    }
}
