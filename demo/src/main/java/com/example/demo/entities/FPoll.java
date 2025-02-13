package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
@IdClass(FPollId.class)
public class FPoll {
	
	@Id
	private String name;
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	FRoom room;
	
	private String description;
	
	@ManyToOne(fetch=FetchType.LAZY)
	FChannel channel;
	
	private long maxSelection;
	
	private long minSelection;
	
	private boolean selfUse;
	
	private boolean showVotes;
	
	@Override
	public int hashCode() {
		return Objects.hash(name, room);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FPoll other = (FPoll) obj;
		return Objects.equals(name, other.name) && Objects.equals(room, other.room);
	}
	
	

	public boolean isShowVotes() {
		return showVotes;
	}

	public void setShowVotes(boolean showVotes) {
		this.showVotes = showVotes;
	}

	public FRoom getRoom() {
		return room;
	}

	public void setRoom(FRoom room) {
		this.room = room;
	}
	
	public FChannel getChannel() {
		return channel;
	}

	public void setChannel(FChannel channel) {
		this.channel = channel;
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

	public boolean isSelfUse() {
		return selfUse;
	}

	public void setSelfUse(boolean self_use) {
		this.selfUse = self_use;
	}

	public long getMaxSelection() {
		return maxSelection;
	}

	public void setMaxSelection(long max_selection) {
		this.maxSelection = max_selection;
	}

	public long getMinSelection() {
		return minSelection;
	}

	public void setMinSelection(long min_selection) {
		this.minSelection = min_selection;
	}	
}
