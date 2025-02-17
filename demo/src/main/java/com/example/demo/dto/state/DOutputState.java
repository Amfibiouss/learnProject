package com.example.demo.dto.state;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.dto.channel.DOutputChannel;
import com.example.demo.dto.poll.DOutputPoll;

public class DOutputState {
	private List <DOutputPoll> polls = new ArrayList<>();
	
	private List<DOutputChannel> channels = new ArrayList<>();
	
	private String status;
	
	private long duration;
	
	private long pindex;
	
	private long version;

	private String stage;
	
	public List<DOutputChannel> getChannels() {
		return channels;
	}

	public void setChannels(List<DOutputChannel> channels) {
		this.channels = channels;
	}

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}
	
	
	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}

	public List<DOutputPoll> getPolls() {
		return polls;
	}

	public void setPolls(List<DOutputPoll> polls) {
		this.polls = polls;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public long getPindex() {
		return pindex;
	}

	public void setPindex(long pindex) {
		this.pindex = pindex;
	}
	
	
}
