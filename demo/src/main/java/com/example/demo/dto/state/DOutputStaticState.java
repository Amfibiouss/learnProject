package com.example.demo.dto.state;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.dto.channel.DOutputChannel;
import com.example.demo.dto.poll.DOutputStaticPoll;

public class DOutputStaticState {
	private List <DOutputChannel> channels = new ArrayList<>();
	
	private List <DOutputStaticPoll> polls = new ArrayList<>();
	
	private String stage;

	public List<DOutputChannel> getChannels() {
		return channels;
	}

	public void setChannels(List<DOutputChannel> channels) {
		this.channels = channels;
	}

	public List<DOutputStaticPoll> getPolls() {
		return polls;
	}

	public void setPolls(List<DOutputStaticPoll> polls) {
		this.polls = polls;
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}
	
	
}
