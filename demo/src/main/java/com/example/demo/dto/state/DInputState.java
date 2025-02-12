package com.example.demo.dto.state;

import java.util.List;

import com.example.demo.dto.channel.DInputChannelState;
import com.example.demo.dto.poll.DInputPollState;

public class DInputState {
	
	private List<DInputChannelState> channelStates;
	
	private List<DInputPollState> pollStates;
	
	private List<String> messages;
	
	private boolean finish;
	
	private String stage;
	
	private long duration;

	
	
	public List<DInputPollState> getPollStates() {
		return pollStates;
	}

	public void setPollStates(List<DInputPollState> pollStates) {
		this.pollStates = pollStates;
	}
	
	public boolean isFinish() {
		return finish;
	}

	public void setFinish(boolean finish) {
		this.finish = finish;
	}

	public List<DInputChannelState> getChannelStates() {
		return channelStates;
	}

	public void setChannelStates(List<DInputChannelState> channels) {
		this.channelStates = channels;
	}

	public List<String> getMessages() {
		return messages;
	}

	public void setMessages(List<String> messages) {
		this.messages = messages;
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}
}
