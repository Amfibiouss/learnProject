package com.example.demo.dto.channel;

import java.util.List;

public class DInputChannelState {
	private String id;
	
	private List<DInputReader> readers;
	
	public List<DInputReader> getReaders() {
		return readers;
	}

	public void setReaders(List<DInputReader> readers) {
		this.readers = readers;
	}

	public String getId() {
		return id;
	}
}
