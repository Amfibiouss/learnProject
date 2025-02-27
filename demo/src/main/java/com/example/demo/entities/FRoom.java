package com.example.demo.entities;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
public class FRoom {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;
	
	private String name;
	
	@Column(columnDefinition = "TEXT")
	private String description;
	
	@ManyToOne(fetch=FetchType.LAZY)
    private FUser creator;
	
	private String status;
	
	private String mode;
	
	private Short max_population;
	
	private OffsetDateTime creation_date;
	
	@OneToOne(optional=true, fetch=FetchType.LAZY)
	private FStage currentStage;
	
	private boolean closed;
	
	private short playersCount;
	
	private long version;

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FRoom other = (FRoom) obj;
		return Objects.equals(id, other.id);
	}

	public short getPlayersCount() {
		return playersCount;
	}

	public void setPlayersCount(short playersCount) {
		this.playersCount = playersCount;
	}

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public FStage getCurrentStage() {
		return currentStage;
	}

	public void setCurrentStage(FStage currentStage) {
		this.currentStage = currentStage;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Short getMax_population() {
		return max_population;
	}

	public void setMax_population(Short max_population) {
		this.max_population = max_population;
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

	public FUser getCreator() {
		return creator;
	}

	public void setCreator(FUser creator) {
		this.creator = creator;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	public OffsetDateTime getCreation_date() {
		return creation_date;
	}

	public void setCreation_date(OffsetDateTime creation_date) {
		this.creation_date = creation_date;
	}

	public Long getId() {
		return id;
	}

	public boolean isClosed() {
		return closed;
	}

	public void setClosed(boolean closed) {
		this.closed = closed;
	}
	
	
}
