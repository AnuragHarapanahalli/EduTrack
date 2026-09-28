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
 * Page Object representing the Classes Home Dashboard (Instructor & Student Class Grid).
 */
public class ClassesHomePage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators
    private final By createClassBtn = By.xpath("//button[contains(@class,'gc-btn-primary') and contains(.,'Create Class')]");
    private final By classesGrid = By.cssSelector(".gc-classes-grid");
    private final By classCards = By.cssSelector(".gc-class-card");

    // Create Class Modal
    private final By modalContainer = By.cssSelector(".gc-modern-modal");
    private final By classNameInput = By.name("name");
    private final By classCodeInput = By.name("code");
    private final By classDescriptionInput = By.name("description");
    private final By batchSelect = By.name("batch");
    private final By modalSubmitBtn = By.cssSelector(".gc-modal-actions button.gc-primary-btn");
    private final By modalCancelBtn = By.cssSelector(".gc-modal-actions button.gc-secondary-btn");

    public ClassesHomePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(classesGrid)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void openCreateClassModal() {
        wait.until(ExpectedConditions.elementToBeClickable(createClassBtn)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(modalContainer));
    }

    public void createClass(String name, String code, String description, String batch) {
        openCreateClassModal();

        WebElement nameElem = wait.until(ExpectedConditions.visibilityOfElementLocated(classNameInput));
        nameElem.clear();
        nameElem.sendKeys(name);

        WebElement codeElem = wait.until(ExpectedConditions.visibilityOfElementLocated(classCodeInput));
        codeElem.clear();
        codeElem.sendKeys(code);

        if (description != null && !description.isEmpty()) {
            WebElement descElem = driver.findElement(classDescriptionInput);
            descElem.clear();
            descElem.sendKeys(description);
        }

        if (batch != null && !batch.isEmpty() && isElementPresent(batchSelect)) {
            new Select(driver.findElement(batchSelect)).selectByValue(batch);
        }

        wait.until(ExpectedConditions.elementToBeClickable(modalSubmitBtn)).click();
    }

    public void selectClassByCode(String code) {
        By cardLocator = By.xpath("//div[contains(@class,'gc-class-card')]//p[contains(text(),'" + code + "')]/ancestor::div[contains(@class,'gc-class-card')]");
        wait.until(ExpectedConditions.elementToBeClickable(cardLocator)).click();
    }

    public boolean isClassPresent(String code) {
        try {
            By cardLocator = By.xpath("//div[contains(@class,'gc-class-card')]//p[contains(text(),'" + code + "')]");
            return wait.until(ExpectedConditions.visibilityOfElementLocated(cardLocator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getClassesCount() {
        return driver.findElements(classCards).size();
    }

    private boolean isElementPresent(By locator) {
        return !driver.findElements(locator).isEmpty();
    }
}
