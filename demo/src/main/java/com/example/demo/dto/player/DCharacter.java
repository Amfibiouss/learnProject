package com.example.demo.dto.player;

import java.util.List;

public class DCharacter {
	private List<DPlayer> players;
	
	private Short pindex;

	private long version;
	
	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public List<DPlayer> getPlayers() {
		return players;
	}

	public void setPlayers(List<DPlayer> players) {
		this.players = players;
	}

	public Short getPindex() {
		return pindex;
	}

	public void setPindex(Short pindex) {
		this.pindex = pindex;
	}
}
