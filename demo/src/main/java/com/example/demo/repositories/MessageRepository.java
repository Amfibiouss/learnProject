package com.example.demo.repositories;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.configs.RoomInitProperties;
import com.example.demo.dto.message.DMessages;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.message.DStage;
import com.example.demo.entities.FChannel;
import com.example.demo.entities.FChannelFCharacterFStage;
import com.example.demo.entities.FChannelFCharacterFStageId;
import com.example.demo.entities.FChannelFStage;
import com.example.demo.entities.FChannelFStageId;
import com.example.demo.entities.FChannelId;
import com.example.demo.entities.FCharacterFStage;
import com.example.demo.entities.FMessage;
import com.example.demo.entities.FPoll;
import com.example.demo.entities.FPollId;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FStage;
import com.example.demo.entities.FStageId;
import com.example.demo.entities.FUser;
import com.example.demo.views.UsernamePindex;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class MessageRepository {
    @Autowired
    SessionFactory sessionFactory;
	
    @Autowired
    ObjectMapper objectMapper;
    
    @Autowired
    RoomInitProperties initProperties;
    
    private DOutputMessage getSystemMessage(FMessage fmessage, String username, String stageName) {
		DOutputMessage dmessage = new DOutputMessage();
		dmessage.setId(fmessage.getId());
		dmessage.setImageText("");
		dmessage.setUsername(username);
		dmessage.setText(fmessage.getText());
		dmessage.setChannel_name(initProperties.getSystem_channel_name());
		dmessage.setChannel_color(initProperties.getSystem_channel_color());
		dmessage.setStage(stageName);
		dmessage.setDate(fmessage.getDate());
		
		return dmessage;
    }
    
    private DOutputMessage getMessage(
    		FMessage fmessage, 
    		String channelName, 
    		String stageName, 
    		String username, 
    		short pindex, 
    		String color, 
    		ReadAcess acess) {
    	
    	if (acess == ReadAcess.NoRead)
    		return null;
    	
    	if (channelName.equals(initProperties.getSystem_channel_name()))
    		return getSystemMessage(fmessage, username, stageName);
    	
    	DOutputMessage dmessage = new DOutputMessage();
    	dmessage.setId(fmessage.getId());
    	switch(acess) {
    	case Read:
    		dmessage.setUsername("Игрок #" + Short.toString(pindex));
    		dmessage.setImageText(Short.toString(pindex));
    		break;
    	case XRayRead:
    		dmessage.setUsername(username);
    		dmessage.setImageText("");
    		break;
    	case AnonymousRead:
    		dmessage.setUsername("Неизвестный");
    		dmessage.setImageText("?");
    		break;
    	case NoRead:
    		return null;
    	}
    	dmessage.setText(fmessage.getText());
    	dmessage.setChannel_name(channelName);
    	dmessage.setChannel_color(color);
    	dmessage.setStage(stageName);
    	dmessage.setDate(fmessage.getDate());
    	
		return dmessage;
    }
    
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public Long addMessage(
			String text,
			long room_id,
			String channelName,
			String stage,
			short pindex,
			String username,
			short controlled_pindex) {
		
		Session session = sessionFactory.getCurrentSession();
		FRoom room = session.getReference(FRoom.class, room_id);
		FChannel channel =  session.getReference(FChannel.class, new FChannelId(channelName, room));
		FStage fstage = session.getReference(FStage.class, new FStageId(stage, room));
		
		FChannelFCharacterFStage writer = session.get(FChannelFCharacterFStage.class, new FChannelFCharacterFStageId(room, channelName, stage, controlled_pindex));
		
		if (writer.getTongueControlledBy() != pindex)
			return null;
		
    	FUser user = session.getReference(FUser.class, username);
    	FChannelFStage channel_state =  session.get(FChannelFStage.class, new FChannelFStageId(room, channelName, stage));
    	FMessage fmessage = new FMessage();
    
    	fmessage.setText(text);
    	fmessage.setChannel(channel);
    	fmessage.setReadMask(channel_state.getCanRead());
    	fmessage.setAnonymousReadMask(channel_state.getCanAnonymousRead());
    	fmessage.setXRayReadMask(channel_state.getCanXRayRead());
    	fmessage.setStage(fstage);
    	fmessage.setUser(user);
    	fmessage.setPindex(controlled_pindex);
    	fmessage.setDate(OffsetDateTime.now());
    	
    	if (writer.isCanAnonymousWrite() && !writer.isCanWrite() && !writer.isCanXRayWrite())
    		fmessage.setAnonymousMessage(true);
    	
    	if (writer.isCanXRayWrite())
    		fmessage.setXRayMessage(true);
    	
    	session.persist(fmessage);
    	
    	return fmessage.getId();
	}
	
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public Long addSystemMessage(String text, long room_id, String poll_name, String stage) {
		Session session = sessionFactory.getCurrentSession();
		FRoom room = session.getReference(FRoom.class, room_id); 
		FPoll poll = session.get(FPoll.class, new FPollId(poll_name, room));
		//FStage fstage = session.getReference(FStage.class, new FStageId(stage, room));

		if (poll.getChannel() == null) 
			return null;
		
		FChannel system_channel = session.getReference(FChannel.class, new FChannelId(initProperties.getSystem_channel_name(), poll.getRoom()));
		FChannelFStage channel_state =  session.get(FChannelFStage.class, new FChannelFStageId(room, poll.getChannel().getName(), stage));
		
		FMessage fmessage = new FMessage();
    	fmessage.setText(text);
    	fmessage.setChannel(system_channel);
    	fmessage.setXRayReadMask(channel_state.getCanRead() | channel_state.getCanXRayRead());
    	fmessage.setStage(session.getReference(FStage.class, new FStageId(stage, room)));
    	fmessage.setUser(null);
    	fmessage.setPindex((short) -1);
    	fmessage.setDate(OffsetDateTime.now());
    	session.persist(fmessage);

    	return fmessage.getId();
	}
	
	@Transactional(isolation = Isolation.READ_COMMITTED, readOnly = true)
	public DMessages getMessages(long room_id, String username, short pindex) {
    	Session session = sessionFactory.getCurrentSession();
    	//FRoom room =  session.getReference(FRoom.class, room_id);
    	FUser user = session.get(FUser.class, username);
    	
    	if (user.getCharacter().getPindex() != pindex)
    		return null;
    	
    	List<FCharacterFStage> fstages = session.createSelectionQuery(
    			"from FCharacterFStage s where s.character = :character", FCharacterFStage.class)
				.setParameter("character", user.getCharacter())
				.getResultList();
    	
    	List<DStage> dstages = new ArrayList<>(fstages.size());
    	
    	for (FCharacterFStage fstage : fstages) {
    		DStage dstage = new DStage();
    		dstage.setName(fstage.getStage().getName());
    		
    		String json_string = fstage.getJsonMessages();
    		
    		if (json_string != null) {
    			dstage.setRowMessages(json_string);
    			dstages.add(dstage);
    			continue;
    		}
    		
    		List<FMessage> messages = session.createSelectionQuery("from FMessage m join fetch m.channel where m.stage = :stage", FMessage.class)
    				.setParameter("stage", fstage.getStage()).getResultList();
    		
    		dstage.setMessages(new ArrayList<>(messages.size()));
    		
    		for (FMessage fmessage : messages) {
    			
    			ReadAcess acess = ReadAcess.NoRead;
        		long can_read = (fmessage.getXRayReadMask() | fmessage.getReadMask() | fmessage.getAnonymousReadMask()) & (1L << pindex);
    			
        		if ((fmessage.getXRayReadMask() & (1L << pindex)) != 0 || (can_read != 0 && fmessage.isXRayMessage())) {
        			acess = ReadAcess.XRayRead;
        		} else if ((fmessage.getAnonymousReadMask() & (1L << pindex)) != 0 || (can_read != 0 && fmessage.isAnonymousMessage())) {
        			acess = ReadAcess.AnonymousRead;
        		} else if ((fmessage.getReadMask() & (1L << pindex)) != 0) {
        			acess = ReadAcess.Read;
        		}
    			
        		if (acess != ReadAcess.NoRead) {
	        		DOutputMessage dmessage = getMessage(fmessage, fmessage.getChannel().getName(), fmessage.getStage().getName(),
	        				(fmessage.getUser() != null)? fmessage.getUser().getUsername() : null, fmessage.getPindex(), fmessage.getChannel().getColor(), acess);
	        		
	        		dstage.getMessages().add(dmessage);
        		}
    		}
    		
    		dstages.add(dstage);
    	}
    	
    	DMessages messages = new DMessages();
    	messages.setPindex(pindex);
    	messages.setStages(dstages);
    	
    	return messages;
    }
	
	@Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.MANDATORY)
	public void handleStageMessages(long room_id) {
		
		Session session = sessionFactory.getCurrentSession();
		FRoom room =  session.get(FRoom.class, room_id);
		FStage fstage = room.getCurrentStage();
		
		List<FMessage> messages = session.createSelectionQuery("from FMessage m join fetch m.channel where m.stage = :stage", FMessage.class)
				.setParameter("stage", fstage).getResultList();
		
    	List<FCharacterFStage> characters = session.createSelectionQuery("from FCharacterFStage cs where cs.stage = :stage", FCharacterFStage.class)
				.setParameter("stage", fstage).getResultList();
		
		for (FCharacterFStage character : characters) {
			StringBuffer result_string = new StringBuffer("[");
			short pindex = character.getCharacter().getPindex();
			
			for (FMessage fmessage : messages) {
				
    			ReadAcess acess = ReadAcess.NoRead;
        		long can_read = (fmessage.getXRayReadMask() | fmessage.getReadMask() | fmessage.getAnonymousReadMask()) & (1L << pindex);
    			
        		if ((fmessage.getXRayReadMask() & (1L << pindex)) != 0 || (can_read != 0 && fmessage.isXRayMessage())) {
        			acess = ReadAcess.XRayRead;
        		} else if ((fmessage.getAnonymousReadMask() & (1L << pindex)) != 0 || (can_read != 0 && fmessage.isAnonymousMessage())) {
        			acess = ReadAcess.AnonymousRead;
        		} else if ((fmessage.getReadMask() & (1L << pindex)) != 0) {
        			acess = ReadAcess.Read;
        		}
    			
        		if (acess != ReadAcess.NoRead) {
	        		DOutputMessage dmessage = getMessage(fmessage, fmessage.getChannel().getName(), fmessage.getStage().getName(),
	        				(fmessage.getUser() != null)? fmessage.getUser().getUsername() : null, fmessage.getPindex(), fmessage.getChannel().getColor(), acess);
	    			
	    			try {
	    				result_string.append(objectMapper.writeValueAsString(dmessage)).append(',');
					} catch (JsonProcessingException e) {
						throw new RuntimeException();
					}
        		}
			}
			
			if (result_string.charAt(result_string.length() - 1) == ',') 
				result_string = result_string.deleteCharAt(result_string.length() - 1);
			
			result_string.append(']');
			
			character.setJsonMessages(result_string.toString());
		}
	}

	@Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.MANDATORY)
	public List<DOutputMessage> handleSystemMessages(
			List<String> messages, Long room_id) {
		
		Session session = sessionFactory.getCurrentSession();
		FRoom room =  session.get(FRoom.class, room_id);
		
		FChannel system_channel = session.getReference(FChannel.class, new FChannelId(initProperties.getSystem_channel_name(), room));
		List<DOutputMessage> output_messages = new ArrayList<>(messages.size());
		OffsetDateTime now = OffsetDateTime.now();
		
		for (short pindex = 0; pindex < messages.size(); pindex++) {
			if (!messages.get(pindex).equals("")) {
				FMessage fmessage = new FMessage();
				fmessage.setText(messages.get(pindex));
				fmessage.setDate(now);
				fmessage.setStage(room.getCurrentStage());
				fmessage.setPindex((short)-1);
				fmessage.setReadMask(1L << pindex);
				fmessage.setChannel(system_channel);
				session.persist(fmessage);
				
				DOutputMessage output_message = getSystemMessage(fmessage, null, room.getCurrentStage().getName());
				output_messages.add(output_message);
			} else {
				output_messages.add(null);
			}
		}
		
		return output_messages;
	}
	
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public List<Map.Entry<String, DOutputMessage> > getPlayersForMessage(long room_id, long message_id) {
		Session session = sessionFactory.getCurrentSession();
		
		FMessage fmessage = session.get(FMessage.class, message_id);
		
		List<UsernamePindex> players = session.createSelectionQuery(
    			"select u.username, u.character.pindex "
    			+ "from FUser u "
    			+ "where u.character.room.id = :room_id", UsernamePindex.class)
				.setParameter("room_id", room_id).getResultList()
				.stream().toList();

    	List<Map.Entry<String, DOutputMessage> > messages = new ArrayList<>(players.size());
    	
    	for (UsernamePindex player : players) {
    		short player_pindex = player.getPindex();
    		ReadAcess acess = ReadAcess.NoRead;
    		long can_read = (fmessage.getXRayReadMask() | fmessage.getReadMask() | fmessage.getAnonymousReadMask()) & (1L << player_pindex);
			
    		if ((fmessage.getXRayReadMask() & (1L << player_pindex)) != 0 || (can_read != 0 && fmessage.isXRayMessage())) {
    			acess = ReadAcess.XRayRead;
    		} else if ((fmessage.getAnonymousReadMask() & (1L << player_pindex)) != 0 || (can_read != 0 && fmessage.isAnonymousMessage())) {
    			acess = ReadAcess.AnonymousRead;
    		} else if ((fmessage.getReadMask() & (1L << player_pindex)) != 0) {
    			acess = ReadAcess.Read;
    		}
    		
    		DOutputMessage output_message = getMessage(fmessage, fmessage.getChannel().getName(), fmessage.getStage().getName(),
    				(fmessage.getUser() != null)? fmessage.getUser().getUsername() : null, fmessage.getPindex(), fmessage.getChannel().getColor(), acess);

    		if (acess != ReadAcess.NoRead)
    			messages.add(Map.entry(player.getUsername(), output_message));
    	}
		
		return messages;
	}
}

enum ReadAcess {XRayRead, Read, AnonymousRead, NoRead}

