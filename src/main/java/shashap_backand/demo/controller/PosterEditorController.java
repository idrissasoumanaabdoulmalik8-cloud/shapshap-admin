package shashap_backand.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PosterEditorController {

    @GetMapping("/poster-editor")
    public String posterEditor() {
        return "poster-editor";
    }
}