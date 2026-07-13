package shashap_backand.demo.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;

@RestController
public class ImageProxyController {

    @GetMapping("/proxy-image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            // Télécharge l'image côté serveur (pas de CORS)
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}