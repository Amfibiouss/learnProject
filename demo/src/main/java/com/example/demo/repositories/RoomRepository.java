package com.example.demo.repositories;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hibernate.LockMode;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.DRoom;
import com.example.demo.dto.channel.DInputChannel;
import com.example.demo.dto.channel.DInputChannelState;
import com.example.demo.dto.channel.DOutputChannel;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.poll.DCandidate;
import com.example.demo.dto.poll.DInputCandidate;
import com.example.demo.dto.poll.DInputPoll;
import com.example.demo.dto.poll.DInputPollState;
import com.example.demo.dto.poll.DOutputPoll;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;
import com.example.demo.dto.state.DOutputStaticState;
import com.example.demo.entities.FChannel;
import com.example.demo.entities.FChannelFStage;
import com.example.demo.entities.FChannelFStageId;
import com.example.demo.entities.FChannelId;
import com.example.demo.entities.FCharacter;
import com.example.demo.entities.FCharacterFStage;
import com.example.demo.entities.FParticipationToken;
import com.example.demo.entities.FPoll;
import com.example.demo.entities.FPollFCharacterFStage;
import com.example.demo.entities.FPollFCharacterFStageId;
import com.example.demo.entities.FPollId;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FStage;
import com.example.demo.entities.FUser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class RoomRepository {
    @Autowired
    SessionFactory sessionFactory;
    
    @Autowired
    MessageRepository messageRepository; 
    
    @Autowired
    ObjectMapper objectMapper;

    @Value("${app.room.limit}")
    private long rooms_limit;
    
    @Value("${app.room.max_channels}")
    private long max_channels;
    
    @Value("${app.room.max_polls}")
    private long max_polls;
    
    @Value("${app.room.system_channel_name}")
    private String system_channel_name;
    
    @Value("${app.room.system_channel_color}")
    private String system_channel_color;
    
    @Value("${app.room.lobby_channel_name}")
    private String lobby_channel_name;
    
    @Value("${app.room.lobby_channel_color}")
    private String lobby_channel_color;
    
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public long addRoom(String name,
    					String description, 
    					String creator_username, 
    					String mode, 
    					String config,
    					short max_population) {
    	
    	Session session = sessionFactory.getCurrentSession();
    	
    	if (session.createSelectionQuery("from FRoom r where r.closed = false", FRoom.class).getResultCount() >= rooms_limit)
    		throw new RuntimeException("rooms are too much");
    	
    	FUser creator = (FUser) session.get(FUser.class, creator_username);
    	
    	if (creator.getCharacter() != null)
    		throw new RuntimeException("user already has entered other room.");
    	
    	FRoom room = new FRoom();
    	room.setName(name);
    	room.setDescription(description);
    	room.setMode(mode);
    	room.setCreation_date(OffsetDateTime.now());
    	room.setMax_population(max_population);
    	room.setStatus("waiting");
    	room.setConfig(config);
    	room.setVersion(0);
    	room.setPlayersCount((short) 1);
    	room.setCreator(creator);
    	session.persist(room);
    	
		FStage fstage = new FStage();
		fstage.setName("Начало");
		fstage.setDuration(-1);
		fstage.setDate(OffsetDateTime.now());
		fstage.setRoom(room);
    	session.persist(fstage);
    	room.setCurrentStage(fstage);
    	
		FChannel lobby_channel = new FChannel();
		lobby_channel.setName(lobby_channel_name);
		lobby_channel.setRoom(room);
		lobby_channel.setColor(lobby_channel_color);
		FChannelFStage lobby_channel_state = new FChannelFStage();
		lobby_channel_state.setChannel(lobby_channel);
		lobby_channel_state.setStage(fstage);
		lobby_channel_state.setCanXRayRead((1L << 32) - 1);
		lobby_channel_state.setCanWrite((1L << 32) - 1);

		FChannel system_channel = new FChannel();
		system_channel.setName(system_channel_name);
		system_channel.setRoom(room);
		system_channel.setColor(system_channel_color);
		FChannelFStage system_channel_state = new FChannelFStage();
		system_channel_state.setChannel(system_channel);
		system_channel_state.setStage(fstage);
		system_channel_state.setCanXRayRead((1L << 32) - 1);
		system_channel_state.setCanWrite(0);
    	
    	session.persist(lobby_channel);
    	session.persist(system_channel);
    	session.persist(lobby_channel_state);
    	session.persist(system_channel_state);
    	lobby_channel.setCurrentState(lobby_channel_state);
    	system_channel.setCurrentState(system_channel_state);
    	
    	DOutputStaticState static_state = getStaticState(List.of(lobby_channel, system_channel), fstage, (short) 0);
    	
    	for (short pindex = 0; pindex < max_population; pindex++) {
        	FCharacter character = new FCharacter();
        	character.setPindex(pindex);
        	character.setRoom(room);
        	character.setVersion(0);
        
    		try {
				character.setState(objectMapper.writeValueAsString(static_state));
			} catch (JsonProcessingException e) {
				throw new RuntimeException();
			}
        	session.persist(character);
        	
        	FParticipationToken token = new FParticipationToken();
        	token.setPindex(pindex);
        	token.setRoom(room);
        	
        	if (pindex == 0) {
        		creator.setCharacter(character);
        		creator.setToken(token);
        		creator.setOnline(false);
        		token.setFree(false);
        	} else {
        		token.setFree(true);
        	}
        	
        	session.persist(token);
        	
			FCharacterFStage character_stage = new FCharacterFStage();
			character_stage.setCharacter(character);
			character_stage.setStage(fstage);
			character_stage.setJsonMessages(null);
			session.persist(character_stage);
    	}
    	
    	return room.getId();
    }
	
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public Map.Entry< List<DOutputMessage>, List<DOutputState> > setState(long room_id, DInputState state, 
			List<DInputChannel> channels, List<DInputPoll> polls, boolean init) {
		
		Session session = sessionFactory.getCurrentSession();
		FRoom room =  (FRoom) session.get(FRoom.class, room_id, LockMode.PESSIMISTIC_WRITE);
		
		room.setVersion(room.getVersion() + 1);
		
		if (init) {
			
			if (channels.size() + 2 > max_channels || polls.size() > max_polls)
				throw new RuntimeException();
			
			if (!room.getStatus().equals("initializing"))
				throw new RuntimeException();
			
			for (DInputChannel dchannel : channels) {
				FChannel fchannel = new FChannel();
				fchannel.setName(dchannel.getId());
				fchannel.setRoom(room);
				fchannel.setColor(dchannel.getColor());
				session.persist(fchannel);
			}
			
			for (DInputPoll dpoll : polls) {
				FPoll fpoll = new FPoll();
				fpoll.setName(dpoll.getId());
				fpoll.setDescription(dpoll.getDescription());
				fpoll.setRoom(room);
				fpoll.setSelfUse(dpoll.isSelf_use());
				fpoll.setShowVotes(dpoll.isShowVotes());
				fpoll.setMaxSelection(dpoll.getMax_selection());
				fpoll.setMinSelection(dpoll.getMin_selection());
				if (dpoll.getChannel() != null)
					fpoll.setChannel(session.getReference(FChannel.class, new FChannelId(dpoll.getChannel(), room)));
				
				session.persist(fpoll);
			}
			
		} else {
			if (!room.getStatus().equals("processing"))
				throw new RuntimeException();
		}
		
		messageRepository.handleStageMessages(room_id);
		
		FStage fstage = new FStage();
		fstage.setName(state.getStage());
		fstage.setDate(OffsetDateTime.now());
		fstage.setDuration(state.getDuration());
		fstage.setRoom(room);
		session.persist(fstage);
		room.setCurrentStage(fstage);
		
		if (state.isFinish())
			room.setStatus("finished");
		else
			room.setStatus("run");
			
    	List<FChannel> fchannels = session.createSelectionQuery("from FChannel c where c.room = :room", FChannel.class)
				.setParameter("room", room).getResultList();
		
		for (FChannel fchannel : fchannels) {
			FChannelFStage fchannel_state = new FChannelFStage();
			fchannel_state.setChannel(fchannel);
			fchannel_state.setStage(fstage);
			session.persist(fchannel_state);
			FChannelFStage old_state = fchannel.getCurrentState();
			fchannel.setCurrentState(fchannel_state);
			
			if (old_state == null)
				continue;
			
			fchannel_state.setCanWrite(old_state.getCanWrite());
			fchannel_state.setCanAnonymousWrite(old_state.getCanAnonymousWrite());
			fchannel_state.setCanXRayWrite(old_state.getCanXRayWrite());
			fchannel_state.setCanRead(old_state.getCanRead());
			fchannel_state.setCanAnonymousRead(old_state.getCanAnonymousRead());
			fchannel_state.setCanXRayRead(old_state.getCanXRayRead());
			
		} 
    	
		for (DInputChannelState dchannel : state.getChannelStates()) {
			FChannel fchannel = session.get(FChannel.class, new FChannelId(dchannel.getId(), room));
			FChannelFStage fchannel_state = fchannel.getCurrentState();
			fchannel_state.setCanWrite(dchannel.getCanWrite());
			fchannel_state.setCanAnonymousWrite(dchannel.getCanAnonymousWrite());
			fchannel_state.setCanXRayWrite(dchannel.getCanXRayWrite());
			fchannel_state.setCanRead(dchannel.getCanRead());
			fchannel_state.setCanAnonymousRead(dchannel.getCanAnonymousRead());
			fchannel_state.setCanXRayRead(dchannel.getCanXRayRead());
		}
		
		if (init) {
			FChannel lobby_channel = session.getReference(FChannel.class, new FChannelId(lobby_channel_name, room));
			FChannelFStage state_channel = session.getReference(FChannelFStage.class, new FChannelFStageId(lobby_channel, fstage));
			state_channel.setCanWrite(0);
		}
		
    	List<FPoll> fpolls = session.createSelectionQuery("from FPoll p where p.room = :room", FPoll.class)
				.setParameter("room", room).getResultList();
		
		for (DInputPollState dpoll : state.getPollStates()) {
			FPoll fpoll = session.getReference(FPoll.class, new FPollId(dpoll.getId(), room));
			List <DInputCandidate> candidates = dpoll.getCandidates();
			
			for (short pindex = 0; pindex < room.getMax_population(); pindex++) {
				FPollFCharacterFStage voter = new FPollFCharacterFStage();
				voter.setRoom(room);
				voter.setPollId(fpoll.getName());
				voter.setStageId(fstage.getName());
				voter.setPindex(pindex);
				voter.setAlias(candidates.get(pindex).getAlias());
				voter.setCanVote(candidates.get(pindex).isCanVote());
				voter.setWeight(candidates.get(pindex).getWeight());
				voter.setName(candidates.get(pindex).getName());
				voter.setCandidates(candidates.get(pindex).getCandidates());
				voter.setInVotesMask(0);
				voter.setOutVotesMask(0);
				
				session.persist(voter);
			}
		}
		
    	List<FCharacter> characters = session.createSelectionQuery("from FCharacter c where c.room = :room order by c.pindex", FCharacter.class)
				.setParameter("room", room).getResultList();

    	List <DOutputState> output_states = new ArrayList<>(room.getMax_population());
    	
    	for (FCharacter character : characters) {
    		DOutputStaticState static_state = getStaticState(fchannels, fstage, character.getPindex());

    		try {
				character.setState(objectMapper.writeValueAsString(static_state));
			} catch (JsonProcessingException e) {
				throw new RuntimeException();
			}
    		   		
    		DOutputState new_state = new DOutputState();
        	new_state.setStatus(room.isClosed()? "closed" : room.getStatus());
    		new_state.setVersion(room.getVersion());
    		new_state.setPindex(character.getPindex());   
    		new_state.setDuration(fstage.getDuration());
    		new_state.setStaticState(character.getState());
    		
        	for (FPoll fpoll : fpolls) {			
        		FPollFCharacterFStage voter = session.get(FPollFCharacterFStage.class,
        				new FPollFCharacterFStageId(room, fpoll.getName(), fstage.getName(), character.getPindex()));
        		
    			if (voter == null || !voter.getCanVote()) 
    				continue;
    				
        		DOutputPoll dpoll = new DOutputPoll();
        		dpoll.setName(fpoll.getName());
        		dpoll.setCandidates(new ArrayList<>());
        		dpoll.setName(fpoll.getName());
        		dpoll.setDescription(fpoll.getDescription());
        		dpoll.setShowVotes(fpoll.isShowVotes());
        		dpoll.setMax_selection(fpoll.getMaxSelection());
        		dpoll.setMin_selection(fpoll.getMinSelection());
        		
        		List<FPollFCharacterFStage> voters = session.createSelectionQuery(
        				  "from FPollFCharacterFStage pcs "
        				+ "where pcs.room = :room and pcs.pollId = :poll_id "
        				+ "and pcs.stageId = :stage_id order by pcs.pindex", FPollFCharacterFStage.class)
        				.setParameter("room", room)
        				.setParameter("poll_id", fpoll.getName())
        				.setParameter("stage_id", fstage.getName())
        				.getResultList();
        		
        		for (FPollFCharacterFStage fvoter: voters) {
        			
        			DCandidate dcandidate = new DCandidate();
        			dcandidate.setId(fvoter.getPindex());
        			dcandidate.setVotes(0);
        			dcandidate.setName(fvoter.getName());
        			
        			if ((voter.getCandidates() & (1 << dcandidate.getId())) != 0) {
        				dcandidate.setBlocked(false);
        			} else
        				dcandidate.setBlocked(true);
        			
        			dcandidate.setSelected(false);
        			dpoll.getCandidates().add(dcandidate);
        		}
        		
        		new_state.getPolls().add(dpoll);
        	}
    		
    		output_states.add(new_state);
    		
			FCharacterFStage character_stage = new FCharacterFStage();
			character_stage.setCharacter(character);
			character_stage.setStage(fstage);
			character_stage.setJsonMessages(null);
			session.persist(character_stage);
    	}
		
		List<DOutputMessage> system_messages = messageRepository.handleSystemMessages(state.getMessages(), room_id);
		
		return Map.entry(system_messages, output_states);
	}
	
	private DOutputStaticState getStaticState(List<FChannel> fchannels, FStage fstage, short pindex) {
		DOutputStaticState static_state = new DOutputStaticState();
		static_state.setStage(fstage.getName());

    	for (FChannel fchannel : fchannels) {
			DOutputChannel dchannel = new DOutputChannel();
    		dchannel.setName(fchannel.getName());
    		FChannelFStage channel_state = fchannel.getCurrentState();
    		long read_mask = channel_state.getCanRead() | channel_state.getCanXRayRead() | channel_state.getCanAnonymousRead();
    		long write_mask = channel_state.getCanWrite() | channel_state.getCanXRayWrite() | channel_state.getCanAnonymousWrite();
    		dchannel.setCanRead((read_mask & (1L << pindex)) != 0);
    		dchannel.setCanWrite((write_mask & (1L << pindex)) != 0);
    		dchannel.setColor(fchannel.getColor());
    		static_state.getChannels().add(dchannel);
    	}
    	
    	return static_state;
	}
	
	@Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
	public DOutputState getState(long room_id, String username) {
		
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room =  session.get(FRoom.class, room_id);
    	FUser user = session.get(FUser.class, username);
    	
    	short pindex = user.getCharacter().getPindex();
    	
    	List<FPoll> fpolls = session.createSelectionQuery("from FPoll p where p.room = :room", FPoll.class)
				.setParameter("room", room).getResultList();
		
    	FStage fstage = room.getCurrentStage();
    	
    	DOutputState state = new DOutputState();
    	state.setPindex(pindex);   
    	state.setStaticState(user.getCharacter().getState());
    	
    	if (room.isClosed())
    		state.setStatus("closed");
    	else
    		state.setStatus(room.getStatus());
		state.setVersion(room.getVersion());
		
		if (room.getStatus().equals("pause"))
			state.setDuration(fstage.getDuration());
		else {
			long duration = fstage.getDuration();
			OffsetDateTime date = fstage.getDate();
			state.setDuration(duration - date.until(OffsetDateTime.now(), ChronoUnit.MILLIS));
		}
    	
    	for (FPoll fpoll : fpolls) {			
    		FPollFCharacterFStage voter = session.get(FPollFCharacterFStage.class,
    				new FPollFCharacterFStageId(room, fpoll.getName(), fstage.getName(), pindex));
    		
			if (voter == null || !voter.getCanVote()) 
				continue;
				
    		DOutputPoll dpoll = new DOutputPoll();
    		dpoll.setName(fpoll.getName());
    		dpoll.setCandidates(new ArrayList<>());
    		dpoll.setName(fpoll.getName());
    		dpoll.setDescription(fpoll.getDescription());
    		dpoll.setShowVotes(fpoll.isShowVotes());
    		dpoll.setMax_selection(fpoll.getMaxSelection());
    		dpoll.setMin_selection(fpoll.getMinSelection());
    		
    		List<FPollFCharacterFStage> voters = session.createSelectionQuery(
    				  "from FPollFCharacterFStage pcs "
    				+ "where pcs.room = :room and pcs.pollId = :poll_id "
    				+ "and pcs.stageId = :stage_id order by pcs.pindex", FPollFCharacterFStage.class)
    				.setParameter("room", room)
    				.setParameter("poll_id", fpoll.getName())
    				.setParameter("stage_id", fstage.getName())
    				.getResultList();
    		
    		for (FPollFCharacterFStage fvoter: voters) {
    			
    			DCandidate dcandidate = new DCandidate();
    			dcandidate.setId(fvoter.getPindex());
    			dcandidate.setVotes(Long.bitCount(fvoter.getInVotesMask()));
    			dcandidate.setName(fvoter.getName());
    			
    			if ((voter.getCandidates() & (1 << dcandidate.getId())) != 0) {
    				dcandidate.setBlocked(false);
    			} else
    				dcandidate.setBlocked(true);
    			
    			if ((voter.getOutVotesMask() & (1 << dcandidate.getId())) != 0)
    				dcandidate.setSelected(true);
    			else 
    				dcandidate.setSelected(false);
    			
    			dpoll.getCandidates().add(dcandidate);
    		}
    		
    		state.getPolls().add(dpoll);
    	}
    	
    	return state;
	}
	
	@Transactional(isolation = Isolation.READ_COMMITTED) 
	public Map.Entry<Long, Long> setRoomStatus(long room_id, String status) {
		Session session = sessionFactory.getCurrentSession();
		FRoom room =  (FRoom) session.get(FRoom.class, room_id, LockMode.PESSIMISTIC_WRITE);
		
		FStage fstage = room.getCurrentStage();
		long duration = -1;
		
		switch(status) {
			case "initializing":
				if (!room.getStatus().equals("waiting"))
					throw new RuntimeException();
				break;
				
			case "processing":
				if (!room.getStatus().equals("run"))
					throw new RuntimeException();
				break;
				
			case "run":
				if (!room.getStatus().equals("pause"))
					throw new RuntimeException();
			
				duration = fstage.getDuration();
				break;
				
			case "pause":
				if (!room.getStatus().equals("run"))
					throw new RuntimeException();

				duration = fstage.getDuration() - fstage.getDate().until(OffsetDateTime.now(), ChronoUnit.MILLIS);
				break;
				
			default:
				throw new RuntimeException();
		}
		
		fstage.setDate(OffsetDateTime.now());
		fstage.setDuration(duration);
		room.setStatus(status);
		room.setVersion(room.getVersion() + 1);
		
		return Map.entry(duration, room.getVersion());
	}
	
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public String getRoomConfig(long room_id) {
		Session session = sessionFactory.getCurrentSession();
    	FRoom room =  (FRoom) session.get(FRoom.class, room_id);
		return room.getConfig();
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
    public List<DRoom> getRooms() {
    	Session session = sessionFactory.getCurrentSession();
    	
    	List<FRoom> items = session.createSelectionQuery("from FRoom", FRoom.class).getResultList();
    	List<DRoom> rooms = new ArrayList<DRoom>();
    	
    	for (FRoom item : items) {
    		DRoom room = new DRoom();
    	
        	room.setPopulation(item.getPlayersCount());
        	room.setCreator(item.getCreator().getUsername());
    		
        	room.setId(item.getId());
        	room.setName(item.getName());
        	room.setDescription(item.getDescription());
        	room.setMode(item.getMode());
        	room.setCreation_date(item.getCreation_date());
        	room.setStatus(item.getStatus());
        	room.setMax_population(item.getMax_population());
        	room.setFavorite(false);
        	
        	rooms.add(room);
    	}
    	
    	return rooms;
    }
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public DRoom getRoom(long room_id) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom froom =  (FRoom) session.get(FRoom.class, room_id);
		DRoom droom = new DRoom();
    	
    	droom.setPopulation(froom.getPlayersCount());
    	droom.setCreator(froom.getCreator().getUsername());
    	droom.setId(froom.getId());
    	droom.setName(froom.getName());
    	droom.setDescription(froom.getDescription());
    	droom.setMode(froom.getMode());
    	droom.setCreation_date(froom.getCreation_date());
    	droom.setStatus(froom.getStatus());
    	droom.setMax_population(froom.getMax_population());
    	droom.setFavorite(false);

		return droom;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public long getRoomIdByCreator(String creator) {
    	
    	Session session = sessionFactory.getCurrentSession();
		FRoom room = session.createSelectionQuery("from FRoom r where r.creator.username=:creator and r.closed = false", FRoom.class)
					.setParameter("creator", creator)
					.getSingleResultOrNull();
		
		if (room == null)
			return -1L;
		
		return room.getId();
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public Long getRoomIdByPlayer(String username) {
    	Session session = sessionFactory.getCurrentSession();
		FUser user = session.get(FUser.class, username);
		
		if (user.getCharacter() == null)
			return null;
		
		return user.getCharacter().getRoom().getId();
	}

    @Transactional(isolation = Isolation.READ_COMMITTED)
	public void closeRoom(long room_id) {
		Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.get(FRoom.class, room_id);
    	room.setClosed(true);
    	session.createMutationQuery("update FUser u set u.character = null, u.token = null where u.character.room = :room")
			.setParameter("room", room).executeUpdate();
    	/*session.createMutationQuery("delete from FCharacter c where c.room = :room")
    		.setParameter("room", room).executeUpdate();*/
	}

	@Transactional(isolation = Isolation.READ_COMMITTED)
	public Short getPindexByPlayer(String username) {
		Session session = sessionFactory.getCurrentSession();
		FUser user = session.get(FUser.class, username);
		
		if (user.getCharacter() == null)
			return null;
		
    	return user.getCharacter().getPindex();
	}

	@Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
	public boolean check(long room_id, String stage, short pindex, String username) {
		Session session = sessionFactory.getCurrentSession();
		FUser fuser = session.getReference(FUser.class, username);
		
		if (room_id != fuser.getCharacter().getRoom().getId() || pindex != fuser.getCharacter().getPindex())
			return false;
	
		FRoom froom = session.getReference(FRoom.class, room_id);
    	if (!froom.getCurrentStage().getName().equals(stage))
    		return false;
    	
		return true;
	}
}

