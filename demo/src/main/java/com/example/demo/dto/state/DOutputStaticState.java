package com.example.demo.dto.state;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.dto.channel.DOutputChannel;

public class DOutputStaticState {
	private List <DOutputChannel> channels = new ArrayList<>();
	
	private String stage;

	public List<DOutputChannel> getChannels() {
		return channels;
	}

	public void setChannels(List<DOutputChannel> channels) {
		this.channels = channels;
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}
	
	
}
