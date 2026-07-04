package shashap_backand.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry; // 👈 AJOUTÉ
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Puisque index.html est dans 'templates/', on laisse le moteur de template de Spring
        // le gérer normalement sous le nom "index"
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/admin").setViewName("index");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // On dit à Spring de chercher d'abord dans le dossier externe racine, puis dans le dossier static

        // 1. Pour la route avec le préfixe de l'API demandée par ton application Android
        registry.addResourceHandler("/api/products/uploads/**")
                .addResourceLocations("file:uploads/", "classpath:/static/uploads/");

        // 2. Pour la route directe (au cas où le site web utilise la route courte)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/", "classpath:/static/uploads/");
    }
}