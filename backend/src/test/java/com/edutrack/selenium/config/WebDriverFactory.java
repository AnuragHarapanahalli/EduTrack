package com.edutrack.selenium.config;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;

import java.time.Duration;

/**
 * Factory for creating configured WebDriver instances (Chrome / Edge).
 * Supports headless and visual execution modes.
 */
public class WebDriverFactory {

    public static WebDriver createDriver(String browser, boolean headless) {
        WebDriver driver;
        String browserChoice = (browser != null) ? browser.trim().toLowerCase() : "chrome";

        switch (browserChoice) {
            case "edge":
                EdgeOptions edgeOptions = new EdgeOptions();
                if (headless) {
                    edgeOptions.addArguments("--headless=new");
                }
                edgeOptions.addArguments(
                        "--window-size=1920,1080",
                        "--disable-gpu",
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--remote-allow-origins=*",
                        "--disable-notifications"
                );
                driver = new EdgeDriver(edgeOptions);
                break;

            case "chrome":
            default:
                ChromeOptions chromeOptions = new ChromeOptions();
                if (headless) {
                    chromeOptions.addArguments("--headless=new");
                }
                chromeOptions.addArguments(
                        "--window-size=1920,1080",
                        "--disable-gpu",
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--remote-allow-origins=*",
                        "--disable-notifications"
                );
                driver = new ChromeDriver(chromeOptions);
                break;
        }

        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        return driver;
    }
}
