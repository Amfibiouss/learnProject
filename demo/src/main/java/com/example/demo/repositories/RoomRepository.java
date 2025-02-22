package com.example.demo.repositories;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
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
import com.example.demo.dto.DRooms;
import com.example.demo.dto.channel.DInputChannel;
import com.example.demo.dto.channel.DInputChannelState;
import com.example.demo.dto.channel.DInputReader;
import com.example.demo.dto.channel.DOutputChannel;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.poll.DCandidate;
import com.example.demo.dto.poll.DInputCandidate;
import com.example.demo.dto.poll.DInputPoll;
import com.example.demo.dto.poll.DInputPollState;
import com.example.demo.dto.poll.DOutputPoll;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;
import com.example.demo.entities.FChannel;
import com.example.demo.entities.FChannelFCharacterFStage;
import com.example.demo.entities.FChannelFStage;
import com.example.demo.entities.FChannelFStageId;
import com.example.demo.entities.FChannelId;
import com.example.demo.entities.FCharacter;
import com.example.demo.entities.FCharacterFStage;
import com.example.demo.entities.FParticipationToken;
import com.example.demo.entities.FPoll;
import com.example.demo.entities.FPollFCharacterFStage;
import com.example.demo.entities.FPollId;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FStage;
import com.example.demo.entities.FUser;
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
    
    @Value("${app.room.max_rooms_on_page}")
    private int max_rooms_on_page;
    
    @Value("${app.room.config.max_channels}")
    private long max_channels;
    
    @Value("${app.room.config.max_polls}")
    private long max_polls;
    
    @Value("${app.room.first_stage_name}")
    private String first_stage_name;
    
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
    	
    	FUser creator = (FUser) session.get(FUser.class, creator_username, LockMode.PESSIMISTIC_WRITE);
    	
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
		fstage.setName(first_stage_name);
		fstage.setDuration(-1);
		fstage.setDate(OffsetDateTime.now());
		fstage.setRoom(room);
    	session.persist(fstage);
    	room.setCurrentStage(fstage);
    	
		FChannel lobby_channel = new FChannel();
		lobby_channel.setName(lobby_channel_name);
		lobby_channel.setRoom(room);
		lobby_channel.setColor(lobby_channel_color);
		session.persist(lobby_channel);

		FChannel system_channel = new FChannel();
		system_channel.setName(system_channel_name);
		system_channel.setRoom(room);
		system_channel.setColor(system_channel_color);
		session.persist(system_channel);

    	FChannelFStage system_channel_stage = new FChannelFStage();
    	system_channel_stage.setRoom(room);
    	system_channel_stage.setStageId(first_stage_name);
    	system_channel_stage.setChannelId(system_channel_name);
    	system_channel_stage.setCanXRayRead((1L << 32) - 1);
    	session.persist(system_channel_stage);
		
    	FChannelFStage lobby_channel_stage = new FChannelFStage();
    	lobby_channel_stage.setRoom(room);
    	lobby_channel_stage.setStageId(first_stage_name);
    	lobby_channel_stage.setChannelId(lobby_channel_name);
    	lobby_channel_stage.setCanXRayRead((1L << 32) - 1);
    	session.persist(lobby_channel_stage);

    	for (short pindex = 0; pindex < max_population; pindex++) {
        	FCharacter character = new FCharacter();
        	character.setPindex(pindex);
        	character.setRoom(room);
        	session.persist(character);
        	
        	FParticipationToken token = new FParticipationToken();
        	token.setPindex(pindex);
        	token.setRoom(room);
        	token.setVersion(0);
        	
        	if (pindex == 0) {
        		creator.setCharacter(character);
        		creator.setToken(token);
        		creator.setOnline(false);
        		token.setFree(false);
        	} else {
        		token.setFree(true);
        	}
        	
        	session.persist(token);
        	
        	FChannelFCharacterFStage reader = new FChannelFCharacterFStage();
        	reader.setRoom(room);
        	reader.setChannelId(lobby_channel_name);
        	reader.setStageId(first_stage_name);
        	reader.setPindex(pindex);
        	reader.setCanXRayWrite(true);
        	reader.setTongueControlledBy(pindex);
        	reader.setEarsControlledBy(pindex);
        	session.persist(reader);
        	
			FCharacterFStage character_stage = new FCharacterFStage();
			character_stage.setCharacter(character);
			character_stage.setStage(fstage);
			character_stage.setJsonMessages(null);
			session.persist(character_stage);
    	}
    	
    	return room.getId();
    }
	
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void createRoomForTests(String name,
			String description, 
			String creator_username, 
			String mode, 
			String config,
			short max_population) {
    	Session session = sessionFactory.getCurrentSession();
    	FUser creator = session.get(FUser.class, creator_username, LockMode.PESSIMISTIC_WRITE);
    	FRoom room = new FRoom();
    	room.setName(name);
    	room.setDescription(description);
    	room.setMode(mode);
    	room.setCreation_date(OffsetDateTime.now());
    	room.setMax_population(max_population);
    	room.setStatus("waiting");
    	room.setClosed(true);
    	room.setConfig(config);
    	room.setVersion(0);
    	room.setPlayersCount((short) 0);
    	room.setCreator(creator);
    	session.persist(room);
    	
    	List<String> channels = new ArrayList<>(Arrays.asList("Общий", "Мафия"));
		for (String channel : channels) {
			FChannel fchannel = new FChannel();
			fchannel.setName(channel);
			fchannel.setRoom(room);
			fchannel.setColor("#0000aa");
			session.persist(fchannel);
		}
    	
    	List<String> times = new ArrayList<>(Arrays.asList("Ночь", "День"));
    	for (int day_counter = 0; day_counter < 10; day_counter++) {
    		for (String time : times) {
				FStage fstage = new FStage();
				fstage.setName(time + " " + day_counter);
				fstage.setDuration(-1);
				fstage.setDate(OffsetDateTime.now());
				fstage.setRoom(room);
		    	session.persist(fstage);
		    	room.setCurrentStage(fstage);
		    	
		    	for (String channel : channels) {
		        	FChannelFStage channel_stage = new FChannelFStage();
		        	channel_stage.setRoom(room);
		        	channel_stage.setStageId(fstage.getName());
		        	channel_stage.setChannelId(channel);
		        	channel_stage.setCanRead((1L << 32) - 1);
		        	session.persist(channel_stage);
		    	}
    		}
    	}
 
		FChannel lobby_channel = new FChannel();
		lobby_channel.setName(lobby_channel_name);
		lobby_channel.setRoom(room);
		lobby_channel.setColor(lobby_channel_color);
		session.persist(lobby_channel);

		FChannel system_channel = new FChannel();
		system_channel.setName(system_channel_name);
		system_channel.setRoom(room);
		system_channel.setColor(system_channel_color);
		session.persist(system_channel);

    	FChannelFStage system_channel_stage = new FChannelFStage();
    	system_channel_stage.setRoom(room);
    	system_channel_stage.setStageId(first_stage_name);
    	system_channel_stage.setChannelId(system_channel_name);
    	system_channel_stage.setCanXRayRead((1L << 32) - 1);
    	session.persist(system_channel_stage);
		
    	FChannelFStage lobby_channel_stage = new FChannelFStage();
    	lobby_channel_stage.setRoom(room);
    	lobby_channel_stage.setStageId(first_stage_name);
    	lobby_channel_stage.setChannelId(lobby_channel_name);
    	lobby_channel_stage.setCanXRayRead((1L << 32) - 1);
    	session.persist(lobby_channel_stage);

    	for (short pindex = 0; pindex < max_population; pindex++) {
        	FCharacter character = new FCharacter();
        	character.setPindex(pindex);
        	character.setRoom(room);
        	session.persist(character);
        	
        	FParticipationToken token = new FParticipationToken();
        	token.setPindex(pindex);
        	token.setRoom(room);
        	token.setVersion(0);
        	token.setFree(true);
        	session.persist(token);
        	
        	FChannelFCharacterFStage reader = new FChannelFCharacterFStage();
        	reader.setRoom(room);
        	reader.setChannelId(lobby_channel_name);
        	reader.setStageId(first_stage_name);
        	reader.setPindex(pindex);
        	reader.setCanXRayWrite(true);
        	reader.setTongueControlledBy(pindex);
        	reader.setEarsControlledBy(pindex);
        	session.persist(reader);
    	}
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
    	
    	FChannelFStage system_channel_stage = new FChannelFStage();
    	system_channel_stage.setRoom(room);
    	system_channel_stage.setStageId(fstage.getName());
    	system_channel_stage.setChannelId(system_channel_name);
    	system_channel_stage.setCanXRayRead((1L << 32) - 1);
    	session.persist(system_channel_stage);
    	
		for (DInputChannelState dchannel : state.getChannelStates()) {
			FChannel fchannel = session.get(FChannel.class, new FChannelId(dchannel.getId(), room));
			List <DInputReader> readers = dchannel.getReaders();
			
			long anonymousReadMask = 0;
			long readMask = 0;
			long XRayReadMask = 0;		
			
			for (short pindex = 0; pindex < room.getMax_population(); pindex++) {
				FChannelFCharacterFStage reader = new FChannelFCharacterFStage();
				DInputReader dreader = readers.get(pindex);
				reader.setRoom(room);
				reader.setChannelId(fchannel.getName());
				reader.setStageId(fstage.getName());
				reader.setPindex(pindex);
				reader.setEarsControlledBy(dreader.getEarsControlledBy());
				reader.setTongueControlledBy(dreader.getTongueControlledBy());
				reader.setCanWrite(dreader.isCanWrite());
				reader.setCanAnonymousWrite(dreader.isCanAnonymousWrite());
				reader.setCanXRayWrite(dreader.isCanXRayWrite());
				
				if (dreader.isCanAnonymousRead())
					anonymousReadMask |= 1L << dreader.getEarsControlledBy();
				
				if (dreader.isCanRead())
					readMask |= 1L << dreader.getEarsControlledBy();
				
				if (dreader.isCanXRayRead())
					XRayReadMask |= 1L << dreader.getEarsControlledBy();
				
				session.persist(reader);
			}
			
			FChannelFStage channel_stage = new FChannelFStage();
			channel_stage.setRoom(room);
			channel_stage.setChannelId(fchannel.getName());
			channel_stage.setStageId(fstage.getName());
			channel_stage.setCanAnonymousRead(anonymousReadMask);
			channel_stage.setCanRead(readMask);
			channel_stage.setCanXRayRead(XRayReadMask);
			session.persist(channel_stage);
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
				voter.setControlledBy(candidates.get(pindex).getControlledBy());
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
    		output_states.add(getCurrentState(session, fchannels, fpolls, room, character.getPindex()));
    		
			FCharacterFStage character_stage = new FCharacterFStage();
			character_stage.setCharacter(character);
			character_stage.setStage(fstage);
			character_stage.setJsonMessages(null);
			session.persist(character_stage);
    	}
		
		List<DOutputMessage> system_messages = messageRepository.handleSystemMessages(state.getMessages(), room_id);
		
		return Map.entry(system_messages, output_states);
	}
	
	@Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
	public DOutputState getState(long room_id, String username) {
		
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room =  session.get(FRoom.class, room_id);
    	FUser user = session.get(FUser.class, username);
    	
    	short pindex = user.getCharacter().getPindex();
    	
    	List<FPoll> fpolls = session.createSelectionQuery("from FPoll p where p.room = :room", FPoll.class)
				.setParameter("room", room).getResultList();
    	
    	List<FChannel> fchannels = session.createSelectionQuery("from FChannel c where c.room = :room", FChannel.class)
				.setParameter("room", room).getResultList();
		
    	return getCurrentState(session, fchannels, fpolls, room, pindex);
	}
	
	private DOutputState getCurrentState(Session session, List<FChannel> fchannels, List<FPoll> fpolls, FRoom room, short pindex) {
		FStage fstage = room.getCurrentStage();
		
    	DOutputState state = new DOutputState();
    	state.setPindex(pindex);   
    	state.setStage(fstage.getName());
    	
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
		
		for (FChannel fchannel : fchannels) {
    		List<FChannelFCharacterFStage> readers = session.createSelectionQuery(
  				  "from FChannelFCharacterFStage ccs "
  				+ "where ccs.room.id = :room_id and ccs.channelId = :channel_id "
  				+ "and ccs.stageId = :stage_id order by ccs.pindex", FChannelFCharacterFStage.class)
  				.setParameter("room_id", room.getId())
  				.setParameter("channel_id", fchannel.getName())
  				.setParameter("stage_id", fstage.getName())
  				.getResultList();
    		
    		FChannelFStage channel_stage = session.get(FChannelFStage.class, new FChannelFStageId(room, fchannel.getName(), fstage.getName()));
    		
    		boolean canRead = false;
    		
    		if (channel_stage != null)
    			canRead = ((channel_stage.getCanAnonymousRead() | channel_stage.getCanRead() | channel_stage.getCanXRayRead()) & (1 << pindex)) != 0;
    		
    		List<Short> pindexes = readers.stream()
    				.filter(item -> item.getTongueControlledBy() == pindex 
    				&& (item.isCanWrite() || item.isCanAnonymousWrite() ||  item.isCanXRayWrite()))
    				.map(item -> item.getPindex()).toList();
    		
    		DOutputChannel dchannel = new DOutputChannel();
    		dchannel.setName(fchannel.getName());
    		dchannel.setColor(fchannel.getColor());
    		dchannel.setPindexes(pindexes);
    		dchannel.setCanRead(canRead);	
    		state.getChannels().add(dchannel);
		}
    	
    	for (FPoll fpoll : fpolls) {	
    		
    		List<FPollFCharacterFStage> voters = session.createSelectionQuery(
    				  "from FPollFCharacterFStage pcs "
    				+ "where pcs.room = :room and pcs.pollId = :poll_id "
    				+ "and pcs.stageId = :stage_id order by pcs.pindex", FPollFCharacterFStage.class)
    				.setParameter("room", room)
    				.setParameter("poll_id", fpoll.getName())
    				.setParameter("stage_id", fstage.getName())
    				.getResultList();
    		
    		List<FPollFCharacterFStage> controlled_voters = voters.stream()
    				.filter(item -> (item.isCanVote() && item.getControlledBy() == pindex))
    				.toList();

    		for (FPollFCharacterFStage voter: controlled_voters) {
        		DOutputPoll dpoll = new DOutputPoll();
        		dpoll.setName(fpoll.getName());
        		dpoll.setCandidates(new ArrayList<>());
        		dpoll.setName(fpoll.getName());
        		dpoll.setDescription(fpoll.getDescription());
        		dpoll.setShowVotes(fpoll.isShowVotes());
        		dpoll.setMax_selection(fpoll.getMaxSelection());
        		dpoll.setMin_selection(fpoll.getMinSelection());
        		dpoll.setControlledPindex(voter.getPindex());
        		
	    		for (FPollFCharacterFStage candidate: voters) {
	    			
	    			DCandidate dcandidate = new DCandidate();
	    			dcandidate.setId(candidate.getPindex());
	    			dcandidate.setVotes(Long.bitCount(candidate.getInVotesMask()));
	    			dcandidate.setName(candidate.getName());
	    			
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
    public DRooms getRooms(String status, int start) {
    	Session session = sessionFactory.getCurrentSession();
    	
    	List<FRoom> frooms;
    	long count;
    	
    	if (!status.equals("closed")) {
    		count = session.createSelectionQuery("from FRoom r where r.status = :status", FRoom.class)
        			.setParameter("status", status).getResultCount();
    		
    		frooms = session.createSelectionQuery("from FRoom r where r.status = :status order by r.playersCount asc, r.creation_date desc", FRoom.class)
    			.setParameter("status", status)
    			.setFirstResult((start - 1) * max_rooms_on_page)
    			.setMaxResults(max_rooms_on_page)
    			.getResultList();
    	}
    	else {
    		count = session.createSelectionQuery("from FRoom r where r.closed = true", FRoom.class).getResultCount();
    		
    		frooms = session.createSelectionQuery("from FRoom r where r.closed = true order by r.creation_date desc", FRoom.class)
	       		.setFirstResult((start - 1) * max_rooms_on_page)
	        	.setMaxResults(max_rooms_on_page)
	    		.getResultList();
    	}
    	
    	List<DRoom> rooms = new ArrayList<DRoom>();
    	
    	for (FRoom froom : frooms) {
    		
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
        	
        	rooms.add(droom);
    	}
    	
    	DRooms drooms = new DRooms();
    	drooms.setRooms(rooms);
    	drooms.setCount((count + max_rooms_on_page - 1) / max_rooms_on_page);
    	return drooms;
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

