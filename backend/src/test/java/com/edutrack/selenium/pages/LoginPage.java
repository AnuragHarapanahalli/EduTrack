package com.edutrack.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object representing the EduTrack Authentication / Login Screen.
 */
public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators
    private final By emailInput = By.name("loginEmail");
    private final By passwordInput = By.name("loginPassword");
    private final By submitButton = By.cssSelector("form button[type='submit']");
    private final By errorMessage = By.cssSelector(".gc-auth-error");
    private final By themeToggleBtn = By.cssSelector(".gc-theme-toggle");
    private final By forgotPasswordBtn = By.cssSelector(".gc-forgot-btn");
    private final By backToSignInBtn = By.cssSelector("button.gc-btn-secondary");

    // Demo Account Buttons
    private final By studentDemoBtn = By.xpath("//div[contains(@class,'gc-demo-grid')]//strong[contains(text(),'Anurag')]/ancestor::button");
    private final By instructorDemoBtn = By.xpath("//div[contains(@class,'gc-demo-grid')]//strong[contains(text(),'Sharma')]/ancestor::button");
    private final By adminDemoBtn = By.xpath("//div[contains(@class,'gc-demo-grid')]//strong[contains(text(),'Admin')]/ancestor::button");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void enterEmail(String email) {
        WebElement elem = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        elem.clear();
        elem.sendKeys(email);
    }

    public void enterPassword(String password) {
        WebElement elem = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        elem.clear();
        elem.sendKeys(password);
    }

    public void clickSignIn() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickSignIn();
    }

    public void clickStudentDemo() {
        wait.until(ExpectedConditions.elementToBeClickable(studentDemoBtn)).click();
    }

    public void clickInstructorDemo() {
        wait.until(ExpectedConditions.elementToBeClickable(instructorDemoBtn)).click();
    }

    public void clickAdminDemo() {
        wait.until(ExpectedConditions.elementToBeClickable(adminDemoBtn)).click();
    }

    public String getErrorMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).getText();
    }

    public boolean isErrorDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void toggleTheme() {
        wait.until(ExpectedConditions.elementToBeClickable(themeToggleBtn)).click();
    }

    public boolean isDarkMode() {
        WebElement html = driver.findElement(By.tagName("html"));
        String dataTheme = html.getAttribute("data-theme");
        String classAttr = html.getAttribute("class");
        return "dark".equals(dataTheme) || (classAttr != null && classAttr.contains("dark-theme"));
    }

    public void openForgotPassword() {
        wait.until(ExpectedConditions.elementToBeClickable(forgotPasswordBtn)).click();
    }

    public void backToSignIn() {
        wait.until(ExpectedConditions.elementToBeClickable(backToSignInBtn)).click();
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
