package com.example.demo.dto.poll;

public class DCandidate {
	private long id;
	
	private String name;
	
	private long votes;
	
	private boolean selected;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getVotes() {
		return votes;
	}

	public void setVotes(long votes) {
		this.votes = votes;
	}

	public boolean isSelected() {
		return selected;
	}

	public void setSelected(boolean selected) {
		this.selected = selected;
	}
	
	
}
