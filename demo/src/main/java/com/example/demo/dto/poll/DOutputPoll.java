package com.example.demo.dto.poll;

import java.util.List;

public class DOutputPoll {
	private String name;
	
	private List<DCandidate> candidates;

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
