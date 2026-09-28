package com.edutrack.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Page Object representing the Admin Panel Dashboard.
 */
public class AdminPanelPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators
    private final By adminContainer = By.cssSelector(".gc-admin-container");
    private final By usersTabBtn = By.xpath("//div[contains(@class,'gc-admin-nav-tabs')]//span[contains(text(),'User Accounts')]/ancestor::button");
    private final By classesTabBtn = By.xpath("//div[contains(@class,'gc-admin-nav-tabs')]//span[contains(text(),'Lab Classes')]/ancestor::button");
    private final By logsTabBtn = By.xpath("//div[contains(@class,'gc-admin-nav-tabs')]//span[contains(text(),'Audit History')]/ancestor::button");
    private final By statsTabBtn = By.xpath("//div[contains(@class,'gc-admin-nav-tabs')]//span[contains(text(),'System Reports')]/ancestor::button");

    private final By createUserBtn = By.cssSelector("button.gc-btn-create");
    private final By searchInput = By.cssSelector("input.gc-search-input");
    private final By toastNotification = By.cssSelector(".gc-toast");

    // Modal Locators
    private final By modalCard = By.cssSelector(".gc-modal-card");
    private final By fullNameInput = By.cssSelector("input[name='fullName']");
    private final By emailInput = By.cssSelector("input[name='email']");
    private final By passwordInput = By.cssSelector("input[name='password']");
    private final By roleSelect = By.cssSelector("select[name='role']");
    private final By panelInput = By.cssSelector("input[name='panel']");
    private final By batchInput = By.cssSelector("input[name='batch']");
    private final By modalSaveBtn = By.cssSelector(".gc-modal-footer button.gc-btn-primary");

    public AdminPanelPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(adminContainer)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void selectUsersTab() {
        wait.until(ExpectedConditions.elementToBeClickable(usersTabBtn)).click();
    }

    public void selectClassesTab() {
        wait.until(ExpectedConditions.elementToBeClickable(classesTabBtn)).click();
    }

    public void selectLogsTab() {
        wait.until(ExpectedConditions.elementToBeClickable(logsTabBtn)).click();
    }

    public void selectStatsTab() {
        wait.until(ExpectedConditions.elementToBeClickable(statsTabBtn)).click();
    }

    public void openCreateUserModal() {
        wait.until(ExpectedConditions.elementToBeClickable(createUserBtn)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(modalCard));
    }

    public void fillUserForm(String fullName, String email, String password, String role, String panel, String batch) {
        WebElement nameElem = wait.until(ExpectedConditions.visibilityOfElementLocated(fullNameInput));
        nameElem.clear();
        nameElem.sendKeys(fullName);

        WebElement emailElem = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        emailElem.clear();
        emailElem.sendKeys(email);

        WebElement passElem = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        passElem.clear();
        passElem.sendKeys(password);

        WebElement selectElem = wait.until(ExpectedConditions.visibilityOfElementLocated(roleSelect));
        new Select(selectElem).selectByValue(role);

        if (panel != null && !panel.isEmpty() && isElementPresent(panelInput)) {
            WebElement panelElem = driver.findElement(panelInput);
            panelElem.clear();
            panelElem.sendKeys(panel);
        }

        if (batch != null && !batch.isEmpty() && isElementPresent(batchInput)) {
            WebElement batchElem = driver.findElement(batchInput);
            batchElem.clear();
            batchElem.sendKeys(batch);
        }
    }

    public void submitUserForm() {
        wait.until(ExpectedConditions.elementToBeClickable(modalSaveBtn)).click();
    }

    public String getToastMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(toastNotification)).getText();
        } catch (Exception e) {
            return "";
        }
    }

    public void searchUser(String query) {
        WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
        search.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"), org.openqa.selenium.Keys.BACK_SPACE);
        search.sendKeys(query);
    }

    public boolean isUserPresentInTable(String email) {
        try {
            By rowLocator = By.xpath("//table[contains(@class,'gc-table')]//tr[contains(.,'" + email + "')]");
            return wait.until(ExpectedConditions.visibilityOfElementLocated(rowLocator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isElementPresent(By locator) {
        return !driver.findElements(locator).isEmpty();
    }
}
