package com.example.demo;

import java.util.List;
import java.util.Map;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.dto.message.DMessages;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.player.DPlayer;
import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.PollRepository;
import com.example.demo.repositories.RoomRepository;
import com.example.demo.repositories.UserRepository;

@Component
public class DaoService {
    @Autowired
    SessionFactory sessionFactory;
    
    @Autowired
    MessageRepository messageRepository;
    
    @Autowired
    RoomRepository roomRepository;
    
    @Autowired
    PlayerRepository playerRepository;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PollRepository pollRepository;
    
    public void addUser(String username, String password, String role) {
    	userRepository.addUser(username, password, role);
    }

    public String getPassword(String username) {
    	return userRepository.getPassword(username);
    }

	public Long addMessage(
			String text,
			long room_id,
			String channelName,
			String stage,
			short pindex,
			String username,
			short controlled_pindex) {
    	return messageRepository.addMessage(text, room_id, channelName, stage, pindex, username, controlled_pindex);
	}
    
	public DMessages getMessages(long room_id, String username, short pindex) {
    	return messageRepository.getMessages(room_id, username, pindex);
    }
	
	public Map.Entry<List<DCandidateState>, Short> addVote(
			List<Short> selected, 
			long room_id, 
			String pollName,
			String stage,
			short pindex,
			short controlled_pindex) {
		return pollRepository.addVote(selected, room_id, pollName, stage, pindex, controlled_pindex);
	}

	public DPlayer switchOnline(String username) {
		return playerRepository.switchOnline(username);
	}	
	
	
	public List<String> getPlayerUsernames(long room_id) {
		return playerRepository.getPlayerUsernames(room_id);
	}
	
	public List<DPlayer> getPlayers(long room_id) {
		return playerRepository.getPlayers(room_id);
	}

	public Long getRoomIdByPlayer(String username) {
		return roomRepository.getRoomIdByPlayer(username);
	}
	
	public Short getPindexByPlayer(String username) {
		return roomRepository.getPindexByPlayer(username);
	}

	public Long addSystemMessage(String text, long room_id, String poll_name, String stage) {
		return messageRepository.addSystemMessage(text, room_id, poll_name, stage);
	}

	public boolean check(long room_id, String stage, short pindex, String username) {
		return roomRepository.check(room_id, stage, pindex, username);
	}
	
	public List<Map.Entry<String, DOutputMessage> > getPlayersForMessage(long room_id, long message_id) {
		return messageRepository.getPlayersForMessage(room_id, message_id);
	}
	
	boolean showVotes(long room_id, String pollName) {
		return pollRepository.showVotes(room_id, pollName);
	}

	public List<String> getPlayersForPoll(long roomId, String pollName, String stage) {
		return pollRepository.getPlayersForPoll(roomId, pollName, stage);
	}
}




