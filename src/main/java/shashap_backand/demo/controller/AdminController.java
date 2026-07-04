package shashap_backand.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {

    @GetMapping({"/", "/admin", "/dashboard", "/orders", "/products", "/clients"})
    public String index() {
        return "index";  // ← templates/index.html
    }
}