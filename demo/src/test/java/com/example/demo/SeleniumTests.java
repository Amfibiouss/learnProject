package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Duration;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class SeleniumTests {
	static private WebDriver driver;
	
	@BeforeAll
    static public void setup(){
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
    }
	
    @Test
    public void checkLogin() throws InterruptedException {
        driver.get("http://localhost:8080/login");

        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.enterUsername("Rarity");
        loginPage.enterPassword("1");
        loginPage.submit();
        
        Thread.sleep(1000);

        assertEquals(driver.getCurrentUrl(), "http://localhost:8080/public/rooms");
    }
    
    @Test
    public void checkUncorrectLogin() throws InterruptedException {
        driver.get("http://localhost:8080/login");

        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.enterUsername("Rarity");
        loginPage.enterPassword("12");
        loginPage.submit();
        
        Thread.sleep(1000);

        assertEquals(driver.getCurrentUrl(), "http://localhost:8080/login?error");
    }

    @AfterAll
    static public void quit(){
        driver.quit();
    }
}
