package com.example.demo;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementNotInteractableException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

public class LoginPage {

    private WebDriver driver;

    private By usernameInput = By.xpath("//*[@id=\"react\"]/div/div[2]/form/div[1]/label/input");
    
    private By passwordInput = By.name("password");
    
    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

	public void enterUsername(String username) {
		 Wait<WebDriver> wait = new FluentWait<>(driver)
	            .withTimeout(Duration.ofSeconds(5))
	            .pollingEvery(Duration.ofMillis(300))
	            .ignoring(ElementNotInteractableException.class); 
		 
		wait.until(d -> {
			driver.findElement(usernameInput).sendKeys(username);	
			return true;
		});
	}

	public void enterPassword(String password) {
		driver.findElement(passwordInput).sendKeys(password);
	}

	public void submit() {
		driver.findElement(usernameInput).submit();
	}
}
