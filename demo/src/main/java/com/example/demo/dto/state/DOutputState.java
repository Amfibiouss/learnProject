package com.example.demo.dto.state;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.dto.poll.DOutputPoll;
import com.fasterxml.jackson.annotation.JsonRawValue;

public class DOutputState {

	@JsonRawValue
	private String staticState;
	
	private List <DOutputPoll> polls = new ArrayList<>();
	
	private String status;
	
	private long duration;
	
	private long pindex;
	
	private long version;

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	

	public String getStaticState() {
		return staticState;
	}

	public void setStaticState(String staticState) {
		this.staticState = staticState;
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
