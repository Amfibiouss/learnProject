package com.example.demo.dto.message;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonRawValue;

public class DStage {
	private String name;
	
	@JsonRawValue
	private String rowMessages = "[]";
	
	private List<DOutputMessage> messages = new ArrayList<>();

	public String getRowMessages() {
		return rowMessages;
	}

	public void setRowMessages(String rowMessages) {
		this.rowMessages = rowMessages;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<DOutputMessage> getMessages() {
		return messages;
	}

	public void setMessages(List<DOutputMessage> messages) {
		this.messages = messages;
	}

	
	
}
