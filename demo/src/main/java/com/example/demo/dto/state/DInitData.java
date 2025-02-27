package com.example.demo.dto.state;

import java.util.List;

import com.example.demo.dto.channel.DInputChannel;
import com.example.demo.dto.poll.DInputPoll;

public class DInitData {
	private List<DInputPoll> polls;
	
	private List<DInputChannel> channels;

	public List<DInputPoll> getPolls() {
		return polls;
	}
	
	public void setPolls(List<DInputPoll> polls) {
		this.polls = polls;
	}
	
	public List<DInputChannel> getChannels() {
		return channels;
	}
	
	public void setChannels(List<DInputChannel> channels) {
		this.channels = channels;
	}
}
