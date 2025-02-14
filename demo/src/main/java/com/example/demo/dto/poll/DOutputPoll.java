package com.example.demo.dto.poll;

import java.util.List;

public class DOutputPoll {
	private String name;
	
	private List<DCandidate> candidates;
	
	private String description;
	
	private long min_selection;
	
	private long max_selection;
	
	private boolean showVotes;
	
	private short controlledPindex;

	public short getControlledPindex() {
		return controlledPindex;
	}

	public void setControlledPindex(short controlledPindex) {
		this.controlledPindex = controlledPindex;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public long getMin_selection() {
		return min_selection;
	}

	public void setMin_selection(long min_selection) {
		this.min_selection = min_selection;
	}

	public long getMax_selection() {
		return max_selection;
	}

	public void setMax_selection(long max_selection) {
		this.max_selection = max_selection;
	}

	public boolean isShowVotes() {
		return showVotes;
	}

	public void setShowVotes(boolean showVotes) {
		this.showVotes = showVotes;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<DCandidate> getCandidates() {
		return candidates;
	}

	public void setCandidates(List<DCandidate> candidates) {
		this.candidates = candidates;
	}
	
}
