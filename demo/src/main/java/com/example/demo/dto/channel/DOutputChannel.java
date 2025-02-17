package com.example.demo.dto.channel;

import java.util.List;

public class DOutputChannel {
	
	private String name;
	
	private boolean canRead;
	
	private String color;
	
	private List<Short> pindexes;
	
	public List<Short> getPindexes() {
		return pindexes;
	}

	public void setPindexes(List<Short> pindexes) {
		this.pindexes = pindexes;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean getCanRead() {
		return canRead;
	}

	public void setCanRead(boolean canRead) {
		this.canRead = canRead;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}
}
