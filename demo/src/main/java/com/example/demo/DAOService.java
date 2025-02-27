package com.example.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import com.example.demo.dto.DRoom;
import com.example.demo.dto.DRooms;
import com.example.demo.dto.message.DInputMessage;
import com.example.demo.dto.message.DMessages;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.player.DPlayer;
import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.dto.poll.DVote;
import com.example.demo.dto.state.DInitData;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;
import com.example.demo.dto.state.DStatus;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.PollRepository;
import com.example.demo.repositories.RoomRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.views.UsernamePindex;

@Component
public class DAOService {
	
	@Autowired 
	RoomRepository roomRepository;
	
	@Autowired 
	PlayerRepository playerRepository;
	
    @Autowired
    GameWebSocketHandler wsHandler;
    
    @Autowired
    MessageRepository messageRepository;
    
    @Autowired
    PollRepository pollRepository;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    ThreadPoolTaskScheduler closeRoomScheduler;
	
	@Value("${app.room.time_to_life}")
	private long room_ttl;
	
	@Value("${app.room.time_to_life_after_finish}")
	private long room_ttl_after_finish;
	
	public void setStatus(long room_id, String status) {
		Map.Entry<Long, Long> res = roomRepository.setRoomStatus(room_id, status);
		long duration = res.getKey();
		long version = res.getValue();
		
		List<String> players = playerRepository.getPlayerUsernames(room_id);
		for (String player : players) {
			wsHandler.send(new DStatus(status, duration, version), "status", player);
		}
	}
	
	private void closeRoom(long room_id) {
		List<String> players = playerRepository.getPlayerUsernames(room_id);
		roomRepository.closeRoom(room_id);
		wsHandler.sendAll(players, new DStatus("closed", -1, 1000_000_000_000_000_000L), "status");
	}
	
	public void initRoom(long room_id, DInitData initData) {
		roomRepository.initializeRoom(room_id, initData);
		
		setStatus(room_id, "processing");
	}
	
	public void updateRoom(long room_id, DInputState state) {
		Map.Entry<List<DOutputMessage>, List<DOutputState> > results =
				roomRepository.setState(room_id, state);
		
		if (state.isFinish()) {
			closeRoomScheduler.schedule(() -> {closeRoom(room_id);}, Instant.now().plusSeconds(room_ttl_after_finish));
		}
		
		List<DOutputMessage> output_messages = results.getKey();
		List<DOutputState> output_states = results.getValue();
		
		List<UsernamePindex> players = playerRepository.getPlayersAndPindexes(room_id);
		
		for (UsernamePindex player : players) {
			short pindex = player.getPindex();
			String username = player.getUsername();
			
			wsHandler.send(output_messages.get(pindex), "message", username);
			wsHandler.send(output_states.get(pindex), "state", username);
		}
	}
	
	
	public DOutputState getState(long room_id, String name) {
		return roomRepository.getState(room_id, name);
	}
	
	public List<DPollResult> getPollResults(long room_id) {
		List<DPollResult> results = pollRepository.getPollResults(room_id);
		
		setStatus(room_id, "processing");

		return results;
	}
	
    public void addRoom(String name,
			String description, 
			String creator_username, 
			String mode, 
			short max_population) {
    	long room_id = roomRepository.addRoom(name, description, creator_username, mode, max_population);
    	
    	closeRoomScheduler.schedule(() -> {closeRoom(room_id);}, Instant.now().plusSeconds(room_ttl));
	}
    
    public void createRoomForTests(String name,
			String description, 
			String creator_username, 
			String mode, 
			short max_population) {
    	roomRepository.createRoomForTests(name, description, creator_username, mode, max_population);
	}
    
    public DRooms getRooms(String status, int start) {
    	return roomRepository.getRooms(status, start);
    }
    
    public DRoom getRoom(long room_id) {
    	return roomRepository.getRoom(room_id);
    }
    
	public long getRoomIdByCreator(String creator) {
		return roomRepository.getRoomIdByCreator(creator);
	}
    
	public void tryEnter(long room_id, String username) {
	
		if (roomRepository.getRoomIdByPlayer(username) == Long.valueOf(room_id)) 
			return;
		
		DPlayer dplayer = playerRepository.tryEnter(room_id, username);
					
		List<String> players = playerRepository.getPlayerUsernames(room_id);
		wsHandler.sendAll(players, dplayer, "player");
		
    	return;
	}
	
	
	public boolean tryExit(long room_id, String username) {
		DPlayer dplayer = playerRepository.tryExit(room_id, username);

		if (roomRepository.getRoomIdByCreator(username) == room_id) 
			closeRoom(room_id);
		
		List<String> players = playerRepository.getPlayerUsernames(room_id);
		wsHandler.sendAll(players, dplayer, "player");
		wsHandler.send("", "kick", username);
		
		return true;
	}

	public void imperius(long room_id, String username, short pindex) {
		DPlayer dplayer = playerRepository.imperius(room_id, username, pindex);
			
		List<String> players = playerRepository.getPlayerUsernames(room_id);
		
		wsHandler.sendAll(players, dplayer, "player");
		wsHandler.send(dplayer, "imperius", username);
	}

	public void sendMessage(DInputMessage input_message, String username) {

		if (!roomRepository.check(input_message.getRoomId(), input_message.getStage(), input_message.getPindex(), username)) 
			throw new RuntimeException("Ошибка авторизации");

		Long message_id = messageRepository.addMessage(
				input_message.getText(),
				input_message.getRoomId(),
				input_message.getChannelName(), 
				input_message.getStage(),
				input_message.getPindex(),
				username,
				input_message.getControlledPindex());
		
		if (message_id == null)
			throw new RuntimeException("Ошибка авторизации");
			
		List<Map.Entry<String, DOutputMessage> > output_messages = messageRepository.getPlayersForMessage(input_message.getRoomId(), message_id);
		
		for (Map.Entry<String, DOutputMessage> entry : output_messages) {
			wsHandler.send(entry.getValue(), "message", entry.getKey());
		}
	}

	public void sendVote(DVote vote, String username) {
		
		if (!roomRepository.check(vote.getRoomId(), vote.getStage(), vote.getPindex(), username)) 
			throw new RuntimeException("Ошибка авторизации");
		
		Map.Entry<List<DCandidateState>, Short> res = pollRepository.addVote(
				vote.getSelected(),
				vote.getRoomId(), 
				vote.getPollName(),
				vote.getStage(),
				vote.getPindex(),
				vote.getControlledPindex());
		
		if (res == null)
			throw new RuntimeException("Ошибка авторизации");
		
		List<DCandidateState> dcandidates = res.getKey();
		short alias = res.getValue();
		
		if (pollRepository.showVotes(vote.getRoomId(), vote.getPollName())) { 
			List<String> players = pollRepository.getPlayersForPoll(vote.getRoomId(), vote.getPollName(), vote.getStage());
			
			wsHandler.sendAll(players, dcandidates, "poll");
		}
		
		String names_str = "";
		for (long index : vote.getSelected()) {
			if (!names_str.equals("")) 
				names_str += ", ";
			names_str += "Игрок #" + index;
		}
		
		Long message_id = messageRepository.addSystemMessage(
				"Игрок #" + alias + " проголосовал за " + names_str + " в \"" + vote.getPollName() + "\""
				, vote.getRoomId(), vote.getPollName(), vote.getStage());
		
		if (message_id == null)
			return;
		
		List<Map.Entry<String, DOutputMessage> > output_messages = messageRepository.getPlayersForMessage(vote.getRoomId(), message_id);
		
		for (Map.Entry<String, DOutputMessage> entry : output_messages) {
			wsHandler.send(entry.getValue(), "message", entry.getKey());
		}
	}
	
	 public void addUser(String username, String password, String role) {
    	userRepository.addUser(username, password, role);
    }

    public String getPassword(String username) {
    	return userRepository.getPassword(username);
    }
    
	public Long getRoomIdByPlayer(String username) {
		return roomRepository.getRoomIdByPlayer(username);
	}
	
	public DMessages getMessages(long room_id, String username, short pindex) {
    	return messageRepository.getMessages(room_id, username, pindex);
    }
	
	public List<DPlayer> getPlayers(long room_id) {
		return playerRepository.getPlayers(room_id);
	}
}
