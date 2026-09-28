package com.edutrack.selenium.config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Base test class for all Selenium E2E tests.
 * Manages driver lifecycle, screenshot captures, and wait helpers.
 */
public abstract class BaseSeleniumTest {

    protected WebDriver driver;
    protected WebDriverWait wait;
    protected String baseUrl;

    @BeforeEach
    public void setUp() {
        this.baseUrl = System.getProperty("baseUrl", "http://localhost:8080");
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        String browser = System.getProperty("browser", "chrome");
        boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));

        this.driver = WebDriverFactory.createDriver(browser, headless);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    public void tearDown(TestInfo testInfo) {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception ignored) {
            }
        }
    }

    public void open(String relativePath) {
        String target = relativePath.startsWith("/") ? baseUrl + relativePath : baseUrl + "/" + relativePath;
        driver.get(target);
    }

    public void openRoot() {
        driver.get(baseUrl);
    }

    public WebElement waitForVisibility(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public WebElement waitForClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    public void click(By locator) {
        waitForClickable(locator).click();
    }

    public void type(By locator, String text) {
        WebElement element = waitForVisibility(locator);
        element.clear();
        element.sendKeys(text);
    }

    public String getText(By locator) {
        return waitForVisibility(locator).getText();
    }

    public boolean isElementPresent(By locator) {
        try {
            return !driver.findElements(locator).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isElementVisible(By locator) {
        try {
            WebElement elem = driver.findElement(locator);
            return elem.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void takeScreenshot(String testName) {
        if (driver instanceof TakesScreenshot takesScreenshot) {
            try {
                byte[] screenshotBytes = takesScreenshot.getScreenshotAs(OutputType.BYTES);
                Path outputDir = Paths.get("target", "selenium-screenshots");
                Files.createDirectories(outputDir);
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                Path targetFile = outputDir.resolve(testName + "_" + timestamp + ".png");
                Files.write(targetFile, screenshotBytes);
                System.out.println("Screenshot captured: " + targetFile.toAbsolutePath());
            } catch (IOException e) {
                System.err.println("Failed to write screenshot: " + e.getMessage());
            }
        }
    }
}
