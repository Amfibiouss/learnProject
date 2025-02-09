package com.example.demo;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.demo.dto.message.DInputMessage;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.player.DCharacter;
import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.dto.poll.DVote;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
	
	@Autowired
	DaoService daoService;
	
	@Autowired
    ObjectMapper objectMapper;
	
	ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		String username = session.getPrincipal().getName();
		
		sessions.put(username, session);
		daoService.switchOnline(username);
		
		Long room_id = daoService.getRoomIdByPlayer(username);
		Short pindex = daoService.getPindexByPlayer(username);
		
		if (room_id == null || pindex == null)
			return;
		
		DCharacter dcharacter = daoService.getCharacter(room_id, pindex);
		List<String> players = daoService.getPlayers(room_id);
		sendAll(players, dcharacter, "player");
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
		String username = session.getPrincipal().getName();
		
		sessions.remove(session.getPrincipal().getName());
		daoService.switchOnline(session.getPrincipal().getName());
		
		Long room_id = daoService.getRoomIdByPlayer(username);
		Short pindex = daoService.getPindexByPlayer(username);
		
		if (room_id == null || pindex == null)
			return;
		
		DCharacter dcharacter = daoService.getCharacter(room_id, pindex);
		List<String> players = daoService.getPlayers(room_id);
		sendAll(players, dcharacter, "player");
	}
	
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String str = message.getPayload();
        String username;
        
        synchronized(session) {username = session.getPrincipal().getName();}
        
        try {
        	WSMessage wsMessage = objectMapper.readValue(str, WSMessage.class);
        	
        	String type = wsMessage.getType();
        	String content = wsMessage.getData();
        	
        	if ("message".equals(type)) {
        		DInputMessage input_message = objectMapper.readValue(content, DInputMessage.class);
        		if (!daoService.check(input_message.getRoomId(), input_message.getStage(), input_message.getPindex(), username)) 
        			return;
        		
        		
        		Long message_id = daoService.addMessage(
        				input_message.getText(),
        				input_message.getRoomId(),
        				input_message.getChannelName(), 
        				input_message.getStage(),
        				input_message.getPindex(),
        				username);
        		
        		if (message_id == null)
        			return;
        		     		
        		List<Map.Entry<String, DOutputMessage> > output_messages = daoService.getPlayersForMessage(input_message.getRoomId(), message_id);
        		
        		for (Map.Entry<String, DOutputMessage> entry : output_messages) {
        			send(entry.getValue(), "message", entry.getKey());
        		}     		
        	} else if ("vote".equals(type)) {
        		DVote vote =  objectMapper.readValue(content, DVote.class);
        		
        		if (!daoService.check(vote.getRoomId(), vote.getStage(), vote.getPindex(), username)) 
        			return;
        		
        		List<DCandidateState> dcandidates = daoService.addVote(
        				vote.getSelected(),
        				vote.getRoomId(), 
        				vote.getPollName(),
        				vote.getStage(),
        				vote.getPindex());
        		
        		if (dcandidates == null)
        			return;
        		
        		if (daoService.showVotes(vote.getRoomId(), vote.getPollName())) { 
	    			List<String> players = daoService.getPlayersForPoll(vote.getRoomId(), vote.getPollName(), vote.getStage());
	    			
	    			sendAll(players, dcandidates, "poll");
        		}
    			
    			String names_str = "";
    			for (long index : vote.getSelected()) {
    				if (!names_str.equals("")) 
    					names_str += ", ";
    				names_str += "Игрок #" + index;
    			}
    			
        		Long message_id = daoService.addSystemMessage(
        				"Игрок #" + vote.getPindex() + " проголосовал за " + names_str + " в \"" + vote.getPollName() + "\""
        				, vote.getRoomId(), vote.getPollName(), vote.getStage());
        		
        		if (message_id == null)
        			return;
        		
        		List<Map.Entry<String, DOutputMessage> > output_messages = daoService.getPlayersForMessage(vote.getRoomId(), message_id);
        		
        		for (Map.Entry<String, DOutputMessage> entry : output_messages) {
        			send(entry.getValue(), "message", entry.getKey());
        		}
        	}
        	
        } catch(Exception e) {
        	throw new RuntimeException(e);
        }
    }
    
    private String serializeAndWrap(Object obj, String type) {
		String data;
		
		if (obj.getClass() == String.class) {
			data = (String) obj;
		} else {
			try {
				data = objectMapper.writeValueAsString(obj);
			} catch(Exception e) {
				throw new RuntimeException(e);
			}
		}
		
		WSMessage wsMessage = new WSMessage(type, data);
		
		try {
			data = objectMapper.writeValueAsString(wsMessage);
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
		
		return data;
    }
    
    public void sendAll(List<String> usernames, Object obj, String type) {
		
    	if (obj == null)
    		return;
    	
		String data = serializeAndWrap(obj, type);
		
		for (String username : usernames) {
			WebSocketSession session = sessions.get(username);

			if (session != null) {
				synchronized(session) {
					this.sendTextMessage(session, data);
				}
			}
		}
	}
    
    public void send(Object obj, String type, String username) {
		
    	if (obj == null)
    		return;
    	
		String data = serializeAndWrap(obj, type);
		
		WebSocketSession session = sessions.get(username);
		
		if (session == null)
			return;
		
		synchronized(session) {
			this.sendTextMessage(session, data);
		}
	}
	
	private void sendTextMessage(WebSocketSession session, String data) {
		try {
			session.sendMessage(new TextMessage(data));
		} catch(IOException e) {
			try {
				session.close();
			} catch(IOException exception) {
				throw new RuntimeException(exception);
			}
		}
	}

}

class WSMessage{
	private String type;
	private String data;
	
	public WSMessage(String type, String data) {
		super();
		this.type = type;
		this.data = data;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getData() {
		return data;
	}
	public void setData(String data) {
		this.data = data;
	}
}