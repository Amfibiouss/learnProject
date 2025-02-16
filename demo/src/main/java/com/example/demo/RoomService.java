package com.example.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import com.example.demo.dto.DRoom;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.player.DPlayer;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.dto.state.DInitData;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;
import com.example.demo.dto.state.DStatus;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.PollRepository;
import com.example.demo.repositories.RoomRepository;
import com.example.demo.views.UsernamePindex;

@Component
public class RoomService {
	
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
		Map.Entry<List<DOutputMessage>, List<DOutputState> > results =
				roomRepository.setState(room_id, initData.getInitState(), initData.getChannels(), initData.getPolls(), true);
		
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
	
	public void updateRoom(long room_id, DInputState state) {
		Map.Entry<List<DOutputMessage>, List<DOutputState> > results =
				roomRepository.setState(room_id, state, null, null, false);
		
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

	
	public String getRoomConfig(long room_id) {

    	String config = roomRepository.getRoomConfig(room_id);
    	
		setStatus(room_id, "initializing");
		
		try {
		Thread.sleep(1000);
		} catch(Exception e) {} 
		
		return config;
	}
	
	public List<DPollResult> getPollResults(long room_id) {
		List<DPollResult> results = pollRepository.getPollResults(room_id);
		
		setStatus(room_id, "processing");
		
		try {
		Thread.sleep(1000);
		} catch(Exception e) {} 
		
		return results;
	}
	
    public void addRoom(String name,
			String description, 
			String creator_username, 
			String mode, 
			String config,
			short max_population) {
    	long room_id = roomRepository.addRoom(name, description, creator_username, mode, config, max_population);
    	
    	closeRoomScheduler.schedule(() -> {closeRoom(room_id);}, Instant.now().plusSeconds(room_ttl));
	}
    
    public List<DRoom> getRooms() {
    	return roomRepository.getRooms();
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
}
