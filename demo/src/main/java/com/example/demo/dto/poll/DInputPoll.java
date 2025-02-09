package com.example.demo.dto.poll;

public class DInputPoll {
	private String id;
	
	private String description;
	
	private boolean self_use;
	
	private long min_selection;
	
	private long max_selection;
	
	private String channel;
	
	private boolean showVotes;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isSelf_use() {
		return self_use;
	}

	public void setSelf_use(boolean self_use) {
		this.self_use = self_use;
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

	public String getChannel() {
		return channel;
	}

	public void setChannel(String channel) {
		this.channel = channel;
	}

	public boolean isShowVotes() {
		return showVotes;
	}

	public void setShowVotes(boolean showVotes) {
		this.showVotes = showVotes;
	}
}
