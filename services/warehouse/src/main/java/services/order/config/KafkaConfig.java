package services.order.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.support.converter.JsonMessageConverter;

@Configuration
public class KafkaConfig {

  @Bean
  NewTopic processingToppic() {
    return TopicBuilder.name("processingOrder")
        .partitions(1)
        .replicas(1)
        .build();
  }

  @Bean
  JsonMessageConverter converter() {
    return new JsonMessageConverter();
  }
}