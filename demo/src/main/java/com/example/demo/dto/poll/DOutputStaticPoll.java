package com.example.demo.dto.poll;

import java.util.List;

public class DOutputStaticPoll {
	private String name;
	
	private String description;
	
	private List <DInputCandidate> candidates;
	
	private long min_selection;
	
	private long max_selection;

	private boolean selfUse;
	
	private boolean showVotes;

	public boolean isShowVotes() {
		return showVotes;
	}

	public void setShowVotes(boolean showVotes) {
		this.showVotes = showVotes;
	}

	public boolean isSelfUse() {
		return selfUse;
	}

	public void setSelfUse(boolean selfUse) {
		this.selfUse = selfUse;
	}

	public List<DInputCandidate> getCandidates() {
		return candidates;
	}

	public void setCandidates(List<DInputCandidate> candidates) {
		this.candidates = candidates;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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
	
	
}
