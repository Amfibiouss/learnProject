package com.example.demo;

import java.util.List;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.dto.player.DPlayer;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.RoomRepository;

@Component
public class WSHandlerDaoService {
    @Autowired
    SessionFactory sessionFactory;
    
    @Autowired
    RoomRepository roomRepository;
    
    @Autowired
    PlayerRepository playerRepository;
    
    @Autowired
    MessageRepository messageRepository;


	public DPlayer switchOnline(String username) {
		return playerRepository.switchOnline(username);
	}	
	
	
	public List<String> getPlayerUsernames(long room_id) {
		return playerRepository.getPlayerUsernames(room_id);
	}

	public Long getRoomIdByPlayer(String username) {
		return roomRepository.getRoomIdByPlayer(username);
	}
	
	public Short getPindexByPlayer(String username) {
		return roomRepository.getPindexByPlayer(username);
	}
}




