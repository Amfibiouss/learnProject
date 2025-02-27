package com.example.demo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import com.example.demo.configs.MessageProperties;
import com.example.demo.configs.PollProperties;
import com.example.demo.configs.RoomConfigProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonschema.core.exceptions.ProcessingException;
import com.github.fge.jsonschema.core.report.ProcessingReport;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import com.github.fge.jsonschema.main.JsonValidator;

@Component
public class ValidateJsonService {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	private RoomConfigProperties roomConfigProperties;
	
	@Autowired
	private PollProperties pollProperties;
	
	@Autowired
	private MessageProperties messageProperties;
	
	@Value("${app.jsonchema.classpath}")
	private String path_prefix; 
	
	private TemplateEngine templateEngine;
	
	private JsonValidator jsonValidator;
	
	//private ConcurrentHashMap<String, String> chemaMap = new ConcurrentHashMap<>();
	
	ValidateJsonService() {
		this.jsonValidator = JsonSchemaFactory.byDefault().getValidator();
		
		this.templateEngine = new SpringTemplateEngine();
		StringTemplateResolver resolver = new StringTemplateResolver();
		resolver.setTemplateMode(TemplateMode.TEXT);
		this.templateEngine.addTemplateResolver(resolver);
	}
	
	public <T> T validateAndParse(String json, Class<T> className, Map<String, Object> extraProps){
		String location = path_prefix + className.getSimpleName() + ".json";
		InputStream stream = ValidateJsonService.class.getClassLoader().getResourceAsStream(location);
		String template;
		
		try {
			template = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
		} catch (IOException e) {
			throw new RuntimeException("Не удалось считать файл со схемой json.");
		}

		Context ctx = new Context();
		ctx.setVariable("room_config_props", roomConfigProperties);
		ctx.setVariable("poll_props", pollProperties);
		ctx.setVariable("message_props", messageProperties);
		if (extraProps != null)
			ctx.setVariables(extraProps);
		String json_chema = templateEngine.process(template, ctx);

	    try {
	    	
			JsonNode chema = objectMapper.readTree(json_chema);
			JsonNode instance = objectMapper.readTree(json);
			ProcessingReport report = jsonValidator.validate(chema, instance);
			
			if (!report.isSuccess()) {
				throw new RuntimeException("Json chema is violated! " + report);
			}

			return objectMapper.treeToValue(instance, className);
			
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Файл со схемой json или входные данные не являются json документом.", e);
		} catch (IllegalArgumentException e) {
			throw new RuntimeException("Я без понятия почему это произошло", e);
		} catch (ProcessingException e) {
			throw new RuntimeException("Ошибка во время валидации входных данных", e);
		}
	}
}

