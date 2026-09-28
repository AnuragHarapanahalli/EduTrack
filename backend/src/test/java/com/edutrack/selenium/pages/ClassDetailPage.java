package com.edutrack.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object representing Class Detail View (Stream, Classwork, People, Leaderboard).
 */
public class ClassDetailPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Header & Tabs
    private final By classHeader = By.cssSelector(".gc-class-header");
    private final By classTitle = By.cssSelector(".gc-class-title");
    private final By streamTab = By.xpath("//div[contains(@class,'gc-class-tabs')]//span[text()='Stream']/ancestor::button");
    private final By classworkTab = By.xpath("//div[contains(@class,'gc-class-tabs')]//span[text()='Classwork']/ancestor::button");
    private final By peopleTab = By.xpath("//div[contains(@class,'gc-class-tabs')]//span[text()='People']/ancestor::button");
    private final By leaderboardTab = By.xpath("//div[contains(@class,'gc-class-tabs')]//span[text()='Leaderboard']/ancestor::button");

    // Classwork actions
    private final By createMilestoneBtn = By.cssSelector("button.gc-btn-create-milestone");
    private final By turnInWorkBtn = By.cssSelector("button.gc-btn-turn-in");

    // Student Upload Modal
    private final By uploadModalHeader = By.xpath("//div[contains(@class,'gc-modal-header')]//h3[contains(.,'Submit Assignment')]");
    private final By uploadLinkInput = By.cssSelector("input[name^='link_']");
    private final By uploadCommentsTextarea = By.cssSelector("textarea[name='comments']");
    private final By submitWorkBtn = By.cssSelector(".gc-modal-footer button.gc-btn-primary, button[type='submit'].gc-btn-primary");

    // Leaderboard
    private final By leaderboardContainer = By.cssSelector(".gc-leaderboard-container, .gc-leaderboard");

    public ClassDetailPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(classHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getClassTitle() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(classTitle)).getText().trim();
    }

    public void clickStreamTab() {
        wait.until(ExpectedConditions.elementToBeClickable(streamTab)).click();
    }

    public void clickClassworkTab() {
        wait.until(ExpectedConditions.elementToBeClickable(classworkTab)).click();
    }

    public void clickPeopleTab() {
        wait.until(ExpectedConditions.elementToBeClickable(peopleTab)).click();
    }

    public void clickLeaderboardTab() {
        wait.until(ExpectedConditions.elementToBeClickable(leaderboardTab)).click();
    }

    public void openCreateMilestoneModal() {
        clickClassworkTab();
        wait.until(ExpectedConditions.elementToBeClickable(createMilestoneBtn)).click();
    }

    public void openTurnInModal() {
        clickClassworkTab();
        wait.until(ExpectedConditions.elementToBeClickable(turnInWorkBtn)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(uploadModalHeader));
    }

    public void submitDeliverableWork(String link, String comments) {
        openTurnInModal();
        if (link != null && !link.isEmpty() && isElementPresent(uploadLinkInput)) {
            WebElement linkElem = driver.findElement(uploadLinkInput);
            linkElem.clear();
            linkElem.sendKeys(link);
        }
        if (comments != null && !comments.isEmpty() && isElementPresent(uploadCommentsTextarea)) {
            WebElement commentsElem = driver.findElement(uploadCommentsTextarea);
            commentsElem.clear();
            commentsElem.sendKeys(comments);
        }
        wait.until(ExpectedConditions.elementToBeClickable(submitWorkBtn)).click();
    }

    public boolean isLeaderboardVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(leaderboardContainer)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isElementPresent(By locator) {
        return !driver.findElements(locator).isEmpty();
    }
}
