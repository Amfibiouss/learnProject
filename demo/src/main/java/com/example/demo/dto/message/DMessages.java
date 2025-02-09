package com.example.demo.dto.message;

import java.util.List;

public class DMessages {
	private long pindex;
	
	private List<DStage> stages;

	public long getPindex() {
		return pindex;
	}

	public void setPindex(long pindex) {
		this.pindex = pindex;
	}

	public List<DStage> getStages() {
		return stages;
	}

	public void setStages(List<DStage> stages) {
		this.stages = stages;
	}
}
