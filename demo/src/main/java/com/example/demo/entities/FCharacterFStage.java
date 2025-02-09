package com.example.demo.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FCharacterFStageId.class)
public class FCharacterFStage {
	
	@Id
	@ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
	FCharacter character;
	
	@Id
	@ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
	FStage stage;
	
	@Column(columnDefinition = "TEXT")
	String jsonMessages;

	public FCharacter getCharacter() {
		return character;
	}

	public void setCharacter(FCharacter character) {
		this.character = character;
	}

	public FStage getStage() {
		return stage;
	}

	public void setStage(FStage stage) {
		this.stage = stage;
	}

	public String getJsonMessages() {
		return jsonMessages;
	}

	public void setJsonMessages(String json_messages) {
		this.jsonMessages = json_messages;
	}
}
