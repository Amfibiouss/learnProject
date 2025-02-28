package com.example.demo.dto.message;

import com.fasterxml.jackson.annotation.JsonRawValue;

public class DMessages {
	private long pindex;

	@JsonRawValue
	private String messages;

	public long getPindex() {
		return pindex;
	}

	public void setPindex(long pindex) {
		this.pindex = pindex;
	}

	public String getMessages() {
		return messages;
	}

	public void setMessages(String messages) {
		this.messages = messages;
	}
}
