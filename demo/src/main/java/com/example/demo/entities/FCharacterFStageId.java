package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FCharacterFStageId implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private FCharacter character;
	
	private FStage stage;

	@Override
	public int hashCode() {
		return Objects.hash(character, stage);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FCharacterFStageId other = (FCharacterFStageId) obj;
		return Objects.equals(character, other.character) && Objects.equals(stage, other.stage);
	}

	public FCharacterFStageId(FCharacter character, FStage stage) {
		super();
		this.character = character;
		this.stage = stage;
	}

	public FCharacterFStageId() {
		super();
	}
	
	
}
